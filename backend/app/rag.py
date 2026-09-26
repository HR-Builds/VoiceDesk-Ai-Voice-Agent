import hashlib
import re
import uuid
from typing import List

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


COLLECTION_NAME = "knowledge_base"
VECTOR_SIZE = 384

# Chunking
CHUNK_SIZE = 800
CHUNK_OVERLAP = 120

qdrant = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)


def _ensure_collection() -> None:
    """Create the collection if it does not exist."""
    collections = qdrant.get_collections()

    exists = any(
        collection.name == COLLECTION_NAME
        for collection in collections.collections
    )

    if not exists:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]+", text.lower())


def _hashed_vector(text: str) -> List[float]:
    """
    Lightweight deterministic text vector.

    No PyTorch.
    No sentence-transformers.
    No external embedding model.

    Uses word and character n-gram hashing to create a
    384-dimensional normalized vector.
    """

    vector = [0.0] * VECTOR_SIZE

    text = text.lower().strip()

    if not text:
        return vector

    tokens = _tokenize(text)

    features = []

    # Word features
    features.extend(tokens)

    # Word bigrams
    for i in range(len(tokens) - 1):
        features.append(f"{tokens[i]}_{tokens[i + 1]}")

    # Character n-grams help with:
    # shipping / shipment
    # refund / refunds
    # warranty / warranties
    normalized = re.sub(r"\s+", " ", text)

    for n in (3, 4, 5):
        if len(normalized) >= n:
            for i in range(len(normalized) - n + 1):
                gram = normalized[i:i + n]

                if gram.strip():
                    features.append(f"char:{gram}")

    # Hash features into 384 dimensions
    for feature in features:
        digest = hashlib.sha256(feature.encode("utf-8")).digest()

        index = int.from_bytes(digest[:4], "big") % VECTOR_SIZE

        # Signed hashing reduces collisions
        sign = 1.0 if digest[4] % 2 == 0 else -1.0

        vector[index] += sign

    # Normalize for cosine similarity
    magnitude = sum(value * value for value in vector) ** 0.5

    if magnitude == 0:
        return vector

    return [value / magnitude for value in vector]


def _chunk_text(text: str) -> List[str]:
    """Split large documents into overlapping chunks."""

    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return []

    if len(text) <= CHUNK_SIZE:
        return [text]

    chunks = []

    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE

        chunk = text[start:end]

        # Prefer ending at a sentence/word boundary
        if end < len(text):
            last_break = max(
                chunk.rfind(". "),
                chunk.rfind("? "),
                chunk.rfind("! "),
                chunk.rfind(" "),
            )

            if last_break > CHUNK_SIZE * 0.55:
                chunk = chunk[:last_break + 1]
                end = start + len(chunk)

        chunk = chunk.strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = max(start + 1, end - CHUNK_OVERLAP)

    return chunks


def _ensure_payload_indexes() -> None:
    """Create indexes used for company/document filtering."""

    for field_name in ("company_id", "doc_id"):
        try:
            qdrant.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name=field_name,
                field_schema="keyword",
            )
        except Exception:
            # Index may already exist.
            pass


def add_document_to_kb(
    company_id: str,
    doc_id: str,
    content: str,
) -> List[str]:
    """
    Chunk and store a document in Qdrant.

    Returns the Qdrant point IDs.
    """

    _ensure_collection()
    _ensure_payload_indexes()

    chunks = _chunk_text(content)

    if not chunks:
        return []

    points = []
    point_ids = []

    for index, chunk in enumerate(chunks):
        point_id = str(uuid.uuid4())

        point_ids.append(point_id)

        points.append(
            PointStruct(
                id=point_id,
                vector=_hashed_vector(chunk),
                payload={
                    "company_id": company_id,
                    "doc_id": doc_id,
                    "chunk_index": index,
                    "text": chunk,
                },
            )
        )

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
        wait=True,
    )

    return point_ids


def delete_document_vectors(doc_id: str) -> None:
    """Delete every Qdrant chunk belonging to a document."""

    _ensure_collection()

    qdrant.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchValue(value=doc_id),
                )
            ]
        ),
        wait=True,
    )


def search_kb(
    company_id: str,
    query: str,
    top_k: int = 3,
) -> List[str]:
    """
    Search only the current company's knowledge base.

    Returns plain text chunks because llm.ask_bot()
    expects List[str].
    """

    _ensure_collection()

    query = query.strip()

    if not query:
        return []

    query_vector = _hashed_vector(query)

    try:
        results = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="company_id",
                        match=MatchValue(value=company_id),
                    )
                ]
            ),
            limit=max(1, top_k),
            with_payload=True,
        )
    except Exception:
        return []

    chunks = []

    for point in results.points:
        payload = point.payload or {}
        text = payload.get("text")

        if text:
            chunks.append(str(text))

    return chunks