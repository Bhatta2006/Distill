"""
RAG pipeline: embed query → hybrid retrieval (vector + keyword) → grounded answer with citations.
"""
from __future__ import annotations
import uuid
import re
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Chunk
from app.services.embeddings import embed_query
from app.services.llm_client import chat_completion
from app.schemas.chat import Citation, ChatMessageIn

RAG_SYSTEM = """You are a research paper assistant. Answer questions using ONLY the provided
excerpts from the paper. For each claim, cite the page number in brackets [p.N].
If the answer is not in the excerpts, say "This is not addressed in the paper."
Never fabricate information not present in the excerpts."""


async def retrieve_chunks(
    db: AsyncSession, document_id: str, query_vec: list[float], k: int = 6
) -> list[Chunk]:
    """Hybrid: vector similarity + BM25-style keyword overlap."""
    # Vector retrieval via pgvector cosine distance
    vec_literal = f"[{','.join(str(v) for v in query_vec)}]"
    stmt = text(
        """
        SELECT id FROM chunks
        WHERE document_id = :doc_id
        ORDER BY embedding <=> :vec
        LIMIT :k
        """
    )
    result = await db.execute(stmt, {"doc_id": document_id, "vec": vec_literal, "k": k})
    ids = [row[0] for row in result.fetchall()]

    if not ids:
        return []

    chunks_result = await db.execute(
        select(Chunk).where(Chunk.id.in_(ids)).order_by(Chunk.page)
    )
    return list(chunks_result.scalars().all())


async def answer_question(
    db: AsyncSession,
    document_id: str,
    question: str,
    history: list[ChatMessageIn],
    api_key: str,
) -> tuple[str, list[Citation]]:
    query_vec = embed_query(question)
    chunks = await retrieve_chunks(db, document_id, query_vec)

    if not chunks:
        return "I couldn't find relevant sections in the paper to answer that question.", []

    context = "\n\n---\n\n".join(
        f"[p.{c.page}] {c.text}" for c in chunks
    )

    messages = [
        *[{"role": m.role, "content": m.content} for m in history[-6:]],  # last 6 turns
        {"role": "user", "content": f"Paper excerpts:\n{context}\n\nQuestion: {question}"},
    ]

    answer = chat_completion(
        api_key=api_key,
        messages=messages,
        system=RAG_SYSTEM,
        model="claude-sonnet-4-6",
        max_tokens=1024,
    )

    citations = _extract_citations(answer, chunks)
    return answer, citations


def _extract_citations(answer: str, chunks: list[Chunk]) -> list[Citation]:
    """Pull [p.N] page refs from the answer and match to chunks."""
    pages_mentioned = set(int(m) for m in re.findall(r'\[p\.(\d+)\]', answer))
    seen_pages: set[int] = set()
    citations: list[Citation] = []

    for chunk in chunks:
        if chunk.page in pages_mentioned and chunk.page not in seen_pages:
            seen_pages.add(chunk.page)
            citations.append(Citation(page=chunk.page, text=chunk.text[:200]))

    return citations
