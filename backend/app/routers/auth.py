from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Admin
from ..schemas import AdminResponse, LoginRequest, LoginResponse, RegisterRequest
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED
)
def register(payload: RegisterRequest, database: Session = Depends(get_db)) -> Admin:
    email = str(payload.email).lower()
    if database.scalar(select(Admin).where(Admin.email == email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An administrator with this email already exists.",
        )

    admin = Admin(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
    )
    database.add(admin)
    database.commit()
    database.refresh(admin)
    return admin


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, database: Session = Depends(get_db)) -> LoginResponse:
    admin = database.scalar(
        select(Admin).where(Admin.email == str(payload.email).lower())
    )
    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return LoginResponse(
        access_token=create_token(admin.id),
        expires_in=settings.token_expire_minutes * 60,
        admin=admin,
    )


@router.get("/me", response_model=AdminResponse)
def current_admin(admin: Admin = Depends(get_current_admin)) -> Admin:
    return admin
