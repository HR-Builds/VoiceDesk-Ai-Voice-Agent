from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ─── Company ───
class CompanyCreate(BaseModel):
    name: str
    slug: str  # e.g. "acme-corp"


class CompanyOut(BaseModel):
    id: UUID
    name: str
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── User ───
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "agent"  # "admin" or "agent"


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    company_id: UUID

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Document ───
class DocumentCreate(BaseModel):
    filename: str
    content: str


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Conversation ───
class ConversationOut(BaseModel):
    id: UUID
    session_id: str
    customer_phone: Optional[str]
    transcript: List[dict]
    duration_seconds: float
    resolved: bool
    escalation: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Order ───
class OrderCreate(BaseModel):
    order_number: str
    customer_email: Optional[str]
    customer_phone: Optional[str]
    status: str
    items: List[dict] = []
    total_amount: float = 0.0


class OrderOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True