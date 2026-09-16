from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, User
from app.auth import get_current_user, require_admin
from app.schemas import DocumentCreate, DocumentOut
from app.rag import add_document_to_kb, delete_document_vectors

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/", response_model=DocumentOut)
def upload_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    doc = Document(
        company_id=current_user.company_id,
        filename=payload.filename,
        content=payload.content,
        uploaded_by=current_user.id,
    )
    db.add(doc)
    db.flush()

    qdrant_ids = add_document_to_kb(
        company_id=str(current_user.company_id),
        doc_id=str(doc.id),
        content=payload.content,
    )
    doc.qdrant_id = qdrant_ids[0] if qdrant_ids else None
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/", response_model=list[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Document)
        .filter(Document.company_id == current_user.company_id)
        .all()
    )


@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    doc = (
        db.query(Document)
        .filter(
            Document.id == doc_id,
            Document.company_id == current_user.company_id,
        )
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_document_vectors(str(doc.id))
    db.delete(doc)
    db.commit()
    return {"detail": "Deleted"}