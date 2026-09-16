from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .. import models
from ..auth import create_access_token, get_current_user, verify_password
from ..database import get_db
from uuid import UUID

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str = ""
    role: str = "admin"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    # NOTE: agar tumhare User model mein password field ka naam
    # "password_hash" hai toh neeche user.hashed_password ki jagah woh likhna
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_access_token({"sub": str(user.id), "role": getattr(user, "role", "admin")})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user.id, email=user.email,
            name=getattr(user, "name", "") or "",
            role=getattr(user, "role", "admin"),
        ),
    )


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return UserOut(
        id=current_user.id, email=current_user.email,
        name=getattr(current_user, "name", "") or "",
        role=getattr(current_user, "role", "admin"),
    )