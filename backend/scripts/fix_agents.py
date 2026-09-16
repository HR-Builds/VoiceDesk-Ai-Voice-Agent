import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth import hash_password
from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    agents = db.query(models.User).filter(models.User.role == "agent").all()
    if not agents:
        print("Koi agent nahi mila. Pehle Admin panel se agent banao.")
    for a in agents:
        # Simple approach: sab agents ka password "agent123" set karo
        a.hashed_password = hash_password("agent123")
        a.is_active = True
        print(f"[FIXED] {a.email} -> password: agent123")
    db.commit()
    print("\nDone! Ab agents 'agent123' password se login kar sakte hain.")
finally:
    db.close()