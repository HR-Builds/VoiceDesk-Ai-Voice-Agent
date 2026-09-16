from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conversation, User
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company_id = current_user.company_id

    total = db.query(Conversation).filter(Conversation.company_id == company_id).count()
    resolved = db.query(Conversation).filter(
        Conversation.company_id == company_id,
        Conversation.resolved == True
    ).count()
    escalated = db.query(Conversation).filter(
        Conversation.company_id == company_id,
        Conversation.escalation == True
    ).count()

    avg_duration = db.query(func.avg(Conversation.duration_seconds)).filter(
        Conversation.company_id == company_id
    ).scalar() or 0.0

    # Last 7 days daily activity
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily = db.query(
        func.date(Conversation.created_at).label("date"),
        func.count(Conversation.id).label("count")
    ).filter(
        Conversation.company_id == company_id,
        Conversation.created_at >= seven_days_ago
    ).group_by("date").order_by("date").all()

    return {
        "total_conversations": total,
        "resolved": resolved,
        "escalated": escalated,
        "resolution_rate": round(resolved / total * 100, 1) if total else 0,
        "escalation_rate": round(escalated / total * 100, 1) if total else 0,
        "avg_duration_seconds": round(avg_duration, 1),
        "daily_activity": [{"date": str(d.date), "count": d.count} for d in daily],
    }