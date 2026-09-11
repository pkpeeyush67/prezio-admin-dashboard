from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Admin, Customer
from ..schemas import DashboardStatsResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(
    _: Admin = Depends(get_current_admin),
    database: Session = Depends(get_db),
) -> DashboardStatsResponse:
    def count(*conditions) -> int:
        statement = select(func.count()).select_from(Customer).where(*conditions)
        return database.scalar(statement) or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    return DashboardStatsResponse(
        total_customers=count(),
        active_customers=count(Customer.status == "active"),
        inactive_customers=count(Customer.status == "inactive"),
        added_last_30_days=count(Customer.created_at >= thirty_days_ago),
    )
