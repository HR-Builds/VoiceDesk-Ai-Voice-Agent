
import re
import uuid as uuid_lib
from uuid import UUID
 
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
 
from .. import models
from ..auth import create_access_token, get_current_user, verify_password, hash_password
from ..database import get_db
 
router = APIRouter(prefix="/auth", tags=["auth"])
 
 
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
 
 
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
 
 
class UserOut(BaseModel):
    id: UUID
    email: str
    name: str = ""
    role: str = "admin"
 
 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
 
 
def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or str(uuid_lib.uuid4())[:8]
 
 
@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
 
    base_slug = slugify(body.company_name)
    slug = base_slug
    counter = 1
    while db.query(models.Company).filter(models.Company.slug == slug).first():
        counter += 1
        slug = f"{base_slug}-{counter}"
 
    company = models.Company(name=body.company_name, slug=slug)
    db.add(company)
    db.flush()  # company.id mil jaye bina commit kiye
 
    user = models.User(
        company_id=company.id,
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=models.UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
 
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user.id, email=user.email, name=user.full_name, role=user.role),
    )
 
 
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_access_token({"sub": str(user.id), "role": getattr(user, "role", "admin")})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user.id, email=user.email,
            name=getattr(user, "full_name", "") or "",
            role=getattr(user, "role", "admin"),
        ),
    )
 
 
@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return UserOut(
        id=current_user.id, email=current_user.email,
        name=getattr(current_user, "full_name", "") or "",
        role=getattr(current_user, "role", "admin"),
    )