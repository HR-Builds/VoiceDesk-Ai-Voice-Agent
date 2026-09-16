import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conversation, User
from app.auth import get_current_user
from app.schemas import ConversationOut

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/")
def start_conversation(
    customer_phone: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = Conversation(
        company_id=current_user.company_id,
        session_id=str(uuid.uuid4()),
        customer_phone=customer_phone,
        transcript=[],
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {"session_id": conv.session_id, "id": str(conv.id)}


@router.post("/{session_id}/message")
def add_message(
    session_id: str,
    speaker: str,  # "customer" or "bot"
    text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.session_id == session_id,
            Conversation.company_id == current_user.company_id,
        )
        .first()
    )
    if not conv:
        return {"error": "Conversation not found"}

    conv.transcript = conv.transcript or []
    conv.transcript.append({
        "speaker": speaker,
        "text": text,
        "timestamp": datetime.utcnow().isoformat(),
    })
    db.commit()
    return {"detail": "Message added"}


@router.get("/", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Conversation)
        .filter(Conversation.company_id == current_user.company_id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


@router.patch("/{session_id}/resolve")
def resolve_conversation(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.session_id == session_id,
            Conversation.company_id == current_user.company_id,
        )
        .first()
    )
    if conv:
        conv.resolved = True
        db.commit()
    return {"detail": "Marked resolved"}


@router.patch("/{session_id}/escalate")
def escalate_conversation(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.session_id == session_id,
            Conversation.company_id == current_user.company_id,
        )
        .first()
    )
    if conv:
        conv.escalation = True
        db.commit()
    return {"detail": "Marked escalated"}