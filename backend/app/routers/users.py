from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import hash_password

from app.database import get_db
from app.models import User, UserRole
from app.auth import hash_password, get_current_user, require_admin
from app.schemas import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/agents", response_model=UserOut)
def create_agent(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing = (
        db.query(User)
        .filter(
            User.company_id == current_user.company_id,
            User.email == payload.email,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists in company")

    agent = User(
        company_id=current_user.company_id,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=UserRole.AGENT,
        is_active=True,
    )
    
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/agents", response_model=list[UserOut])
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return (
        db.query(User)
        .filter(
            User.company_id == current_user.company_id,
            User.role == UserRole.AGENT,
        )
        .all()
    )


@router.patch("/agents/{agent_id}/disable")
def disable_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    agent = (
        db.query(User)
        .filter(
            User.id == agent_id,
            User.company_id == current_user.company_id,
            User.role == UserRole.AGENT,
        )
        .first()
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.is_active = False
    db.commit()
    return {"detail": "Agent disabled"}


@router.delete("/agents/{agent_id}")
def delete_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    agent = (
        db.query(User)
        .filter(
            User.id == agent_id,
            User.company_id == current_user.company_id,
            User.role == UserRole.AGENT,
        )
        .first()
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()
    return {"detail": "Agent deleted"}