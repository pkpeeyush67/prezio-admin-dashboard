import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Admin, ManagedUser
from ..schemas import ImportResult, UserCreate, UserListResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["User Management"])


def find_user(user_id: int, database: Session) -> ManagedUser:
    user = database.get(ManagedUser, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.get("", response_model=UserListResponse)
def list_users(
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> UserListResponse:
    users = list(database.scalars(select(ManagedUser).order_by(ManagedUser.id.desc())).all())
    return UserListResponse(items=users, total=len(users))


@router.post("/import", response_model=ImportResult)
async def import_users(
    file: UploadFile = File(...),
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> ImportResult:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    try:
        text = (await file.read()).decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="The CSV must use UTF-8 encoding.") from error
    reader = csv.DictReader(io.StringIO(text))
    required = {"name", "email", "company", "status"}
    if not reader.fieldnames or not required.issubset(reader.fieldnames):
        raise HTTPException(
            status_code=400,
            detail="CSV columns must include name, email, company, and status.",
        )

    existing_emails = set(database.scalars(select(ManagedUser.email)).all())
    imported = 0
    skipped = 0
    for row in reader:
        email = row["email"].strip().lower()
        user_status = row["status"].strip().lower()
        if (
            not row["name"].strip()
            or "@" not in email
            or not row["company"].strip()
            or user_status not in {"active", "inactive"}
            or email in existing_emails
        ):
            skipped += 1
            continue
        database.add(
            ManagedUser(
                name=row["name"].strip(),
                email=email,
                company=row["company"].strip(),
                status=user_status,
            )
        )
        existing_emails.add(email)
        imported += 1
    database.commit()
    return ImportResult(imported=imported, skipped=skipped)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> ManagedUser:
    return find_user(user_id, database)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> ManagedUser:
    user = ManagedUser(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        company=payload.company.strip(),
        status=payload.status,
    )
    database.add(user)
    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()
        raise HTTPException(status_code=409, detail="A user with this email already exists.") from error
    database.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> ManagedUser:
    user = find_user(user_id, database)
    user.name = payload.name.strip()
    user.email = str(payload.email).lower()
    user.company = payload.company.strip()
    user.status = payload.status
    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()
        raise HTTPException(status_code=409, detail="A user with this email already exists.") from error
    database.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> Response:
    database.delete(find_user(user_id, database))
    database.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
