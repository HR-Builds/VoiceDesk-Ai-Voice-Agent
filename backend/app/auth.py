
import os
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from . import models


SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720")
)


# Password hashing
# Argon2id is used instead of Passlib/bcrypt.
password_hasher = PasswordHasher()


bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return password_hasher.verify(hashed, plain)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if creds is None:
        raise cred_exc

    try:
        payload = jwt.decode(
            creds.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise cred_exc

    except JWTError:
        raise cred_exc

    try:
        user_uuid = UUID(str(user_id))
    except (ValueError, TypeError):
        raise cred_exc

    user = (
        db.query(models.User)
        .filter(models.User.id == user_uuid)
        .first()
    )

    if user is None:
        raise cred_exc

    return user


def require_admin(current_user=Depends(get_current_user)):
    if getattr(current_user, "role", "admin") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user