import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth import hash_password
from app.database import SessionLocal
from app import models

EMAIL = "admin@acme.com"
PASSWORD = "admin123"
NAME = "Admin"


def main():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == EMAIL).first()
        if user:
            user.hashed_password = hash_password(PASSWORD)
            print(f"[OK] Password update: {EMAIL}")
        else:
            user = models.User(
                email=EMAIL,
                hashed_password=hash_password(PASSWORD),
                name=NAME,
                role="admin",
            )
            db.add(user)
            print(f"[OK] Admin created: {EMAIL}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()