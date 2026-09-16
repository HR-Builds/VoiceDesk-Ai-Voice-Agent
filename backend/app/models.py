import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    Integer,
    Float,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    AGENT = "agent"


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="company", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="company", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.AGENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")

    __table_args__ = (  # email must be unique per company
        {"sqlite_autoincrement": True},
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)  # extracted text
    qdrant_id = Column(String(100), nullable=True)  # vector DB reference
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="documents")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    customer_phone = Column(String(50), nullable=True)
    transcript = Column(JSON, default=list)  # [{speaker, text, timestamp}]
    audio_url = Column(String(500), nullable=True)
    duration_seconds = Column(Float, default=0.0)
    resolved = Column(Boolean, default=False)
    escalation = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="conversations")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    order_number = Column(String(100), nullable=False, index=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False)  # "shipped", "delivered", etc.
    items = Column(JSON, default=list)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="orders")