"""
Dual-provider embedding service.

provider=local  → sentence-transformers (all-MiniLM-L6-v2, 384-dim). Docker only.
provider=voyage → Voyage AI API (voyage-2, 1024-dim). Required for Vercel.

The vector column in Chunk defaults to 384 dims. When using Voyage AI (1024 dims),
set EMBEDDING_DIM=1024 and re-run migrations or recreate the DB.
"""
from __future__ import annotations
from functools import lru_cache
from app.config import get_settings

# Voyage AI voyage-2 output dimension
_VOYAGE_DIM = 1024
_LOCAL_DIM = 384


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    settings = get_settings()
    if settings.embedding_provider == "voyage":
        return _voyage_embed(texts, settings.voyage_api_key)
    return _local_embed(texts, settings.embedding_model)


def embed_query(query: str) -> list[float]:
    result = embed_texts([query])
    return result[0] if result else []


# ── Voyage AI ────────────────────────────────────────────────────────────────

def _voyage_embed(texts: list[str], api_key: str) -> list[list[float]]:
    import voyageai  # installed only in api/requirements.txt for Vercel
    client = voyageai.Client(api_key=api_key)
    # Voyage AI handles batching internally; max 128 per call
    result = client.embed(texts, model="voyage-2", input_type="document")
    return result.embeddings


# ── Local sentence-transformers ───────────────────────────────────────────────

@lru_cache(maxsize=1)
def _st_model(model_name: str):
    from sentence_transformers import SentenceTransformer  # not installed on Vercel
    return SentenceTransformer(model_name)


def _local_embed(texts: list[str], model_name: str) -> list[list[float]]:
    model = _st_model(model_name)
    vecs = model.encode(texts, batch_size=64, show_progress_bar=False, normalize_embeddings=True)
    return vecs.tolist()
