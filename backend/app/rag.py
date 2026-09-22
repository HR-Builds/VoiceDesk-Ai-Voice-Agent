
import re
import uuid
from typing import List

from groq import Groq
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from app.config import settings


groq_client = Groq(api_key=settings.GROQ_API_KEY)
qdrant = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)

EMBEDDING_DIM = 384


def ensure_collection():
    collections = qdrant.get_collections().collections
    names = [c.name for c in collections]

    if settings.QDRANT_COLLECTION not in names:
        qdrant.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=EMBEDDING_DIM,
                distance=Distance.COSINE,
            ),
        )


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[str]:
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks


def _tokens(text: str):
    return set(re.findall(r"\b[a-zA-Z0-9]{2,}\b", text.lower()))


def get_embedding(text: str) -> List[float]:
    # Lightweight placeholder vector.
    # Semantic retrieval is handled by lexical scoring below.
    return [0.0] * EMBEDDING_DIM


def add_document_to_kb(
    company_id: str,
    doc_id: str,
    content: str,
):
    ensure_collection()

    chunks = chunk_text(content)
    points = []

    for i, chunk in enumerate(chunks):
        point_id = str(uuid.uuid4())

        points.append(
            PointStruct(
                id=point_id,
                vector=get_embedding(chunk),
                payload={
                    "company_id": company_id,
                    "doc_id": doc_id,
                    "chunk_index": i,
                    "text": chunk,
                },
            )
        )

    if points:
        qdrant.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points,
        )

    return [p.id for p in points]


def search_kb(
    company_id: str,
    query: str,
    top_k: int = 5,
) -> List[str]:
    ensure_collection()

    query_tokens = _tokens(query)

    result, _ = qdrant.scroll(
        collection_name=settings.QDRANT_COLLECTION,
        scroll_filter=Filter(
            must=[
                FieldCondition(
                    key="company_id",
                    match=MatchValue(value=company_id),
                )
            ]
        ),
        limit=100,
        with_payload=True,
        with_vectors=False,
    )

    scored = []

    for point in result:
        payload = point.payload or {}
        text = payload.get("text", "")

        if not text:
            continue

        text_tokens = _tokens(text)
        score = len(query_tokens.intersection(text_tokens))

        if score > 0:
            scored.append((score, text))

    scored.sort(key=lambda x: x[0], reverse=True)

    return [text for _, text in scored[:top_k]]


def delete_document_vectors(doc_id: str):
    ensure_collection()

    qdrant.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchValue(value=doc_id),
                )
            ]
        ),
    )