from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_api_key
from app.models.document import Document
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import answer_question

router = APIRouter(prefix="/documents", tags=["chat"])


@router.post("/{doc_id}/chat", response_model=ChatResponse)
async def chat(
    doc_id: str,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(get_api_key),
):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status != "ready":
        raise HTTPException(status_code=409, detail=f"Document is still processing ({doc.status})")

    answer, citations = await answer_question(db, doc_id, body.question, body.history, api_key)
    return ChatResponse(id=str(uuid.uuid4()), content=answer, citations=citations)
