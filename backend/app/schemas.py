from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: AdminResponse


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    company: str
    status: Literal["active", "inactive"]
    created_at: datetime
    updated_at: datetime


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(min_length=2, max_length=150)
    status: Literal["active", "inactive"] = "active"


class CustomerUpdate(CustomerCreate):
    pass


class CustomerActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    action: str
    created_at: datetime
    metadata: dict = Field(validation_alias="activity_metadata")


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardStatsResponse(BaseModel):
    total_customers: int
    active_customers: int
    inactive_customers: int
    added_last_30_days: int
