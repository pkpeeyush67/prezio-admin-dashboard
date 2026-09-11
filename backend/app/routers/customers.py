import math
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Admin, Customer
from ..schemas import CustomerListResponse

router = APIRouter(prefix="/api/customers", tags=["Customers"])

SORT_COLUMNS = {
    "id": Customer.id,
    "name": Customer.name,
    "company": Customer.company,
    "status": Customer.status,
    "created_at": Customer.created_at,
    "updated_at": Customer.updated_at,
}


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
