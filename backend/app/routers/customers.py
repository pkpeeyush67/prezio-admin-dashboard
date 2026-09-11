import math
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Admin, Customer, CustomerActivity
from ..schemas import (
    CustomerActivityResponse,
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter(prefix="/api/customers", tags=["Customers"])

SORT_COLUMNS = {
    "id": Customer.id,
    "name": Customer.name,
    "company": Customer.company,
    "status": Customer.status,
    "created_at": Customer.created_at,
    "updated_at": Customer.updated_at,
}


def get_customer_or_404(customer_id: int, database: Session) -> Customer:
    customer = database.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


def record_activity(
    database: Session, customer: Customer, action: str, metadata: dict
) -> None:
    database.add(
        CustomerActivity(
            customer=customer,
            action=action,
            activity_metadata=metadata,
        )
    )


@router.get("", response_model=CustomerListResponse)
def list_customers(
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: str = Query("", max_length=100),
    status: Literal["active", "inactive"] | None = None,
    sort_by: Literal[
        "id", "name", "company", "status", "created_at", "updated_at"
    ] = "created_at",
    sort_order: Literal["asc", "desc"] = "desc",
) -> CustomerListResponse:
    filters = []
    if search.strip():
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                Customer.name.ilike(term),
                Customer.email.ilike(term),
                Customer.company.ilike(term),
            )
        )
    if status:
        filters.append(Customer.status == status)

    total = database.scalar(
        select(func.count()).select_from(Customer).where(*filters)
    ) or 0

    sort_column = SORT_COLUMNS[sort_by]
    order = asc(sort_column) if sort_order == "asc" else desc(sort_column)
    statement = (
        select(Customer)
        .where(*filters)
        .order_by(order, Customer.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    customers = list(database.scalars(statement).all())

    return CustomerListResponse(
        items=customers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> Customer:
    return get_customer_or_404(customer_id, database)


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> Customer:
    customer = Customer(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        company=payload.company.strip(),
        status=payload.status,
    )
    database.add(customer)
    record_activity(database, customer, "created", {"status": payload.status})
    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists.",
        ) from error
    database.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> Customer:
    customer = get_customer_or_404(customer_id, database)
    previous_status = customer.status
    customer.name = payload.name.strip()
    customer.email = str(payload.email).lower()
    customer.company = payload.company.strip()
    customer.status = payload.status
    record_activity(
        database,
        customer,
        "updated",
        {"previous_status": previous_status, "status": payload.status},
    )
    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists.",
        ) from error
    database.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> Response:
    customer = get_customer_or_404(customer_id, database)
    database.delete(customer)
    database.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{customer_id}/activity", response_model=list[CustomerActivityResponse])
def get_customer_activity(
    customer_id: int,
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> list[CustomerActivity]:
    get_customer_or_404(customer_id, database)
    statement = (
        select(CustomerActivity)
        .where(CustomerActivity.customer_id == customer_id)
        .order_by(CustomerActivity.created_at.desc())
    )
    return list(database.scalars(statement).all())
