import uuid
from typing import List
from groq import Groq

from sentence_transformers import SentenceTransformer
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

# Groq client — used for chat/completion generation elsewhere in the app
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# Qdrant client — vector database for storing document embeddings
qdrant = QdrantClient(url=settings.QDRANT_URL)

# Local embedding model (Groq does not provide an embeddings endpoint)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output size


def ensure_collection():
    collections = qdrant.get_collections().collections
    names = [c.name for c in collections]
    if settings.QDRANT_COLLECTION not in names:
        qdrant.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def get_embedding(text: str) -> List[float]:
    return embedding_model.encode(text).tolist()


def add_document_to_kb(company_id: str, doc_id: str, content: str):
    ensure_collection()
    chunks = chunk_text(content)
    points = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        point_id = str(uuid.uuid4())
        points.append(
            PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "company_id": company_id,
                    "doc_id": doc_id,
                    "chunk_index": i,
                    "text": chunk,
                },
            )
        )
    if points:
        qdrant.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
    return [p.id for p in points]

def search_kb(company_id: str, query: str, top_k: int = 5) -> List[str]:
    ensure_collection()
    embedding = get_embedding(query)
    result = qdrant.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=embedding,
        limit=top_k,
    )
    return [point.payload["text"] for point in result.points]

def delete_document_vectors(doc_id: str):
    qdrant.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=Filter(
            must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
        ),
    )