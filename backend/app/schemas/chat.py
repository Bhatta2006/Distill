from pydantic import BaseModel
from typing import Literal
from app.schemas.document import Rect


class Citation(BaseModel):
    page: int
    text: str
    rect: Rect | None = None


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[ChatMessageIn] = []


class ChatResponse(BaseModel):
    id: str
    role: Literal["assistant"] = "assistant"
    content: str
    citations: list[Citation] = []


class DiagramOut(BaseModel):
    id: str
    document_id: str
    type: str
    mermaid_code: str
    confidence: Literal["high", "medium", "low"]
    raw_graph: dict | None = None

    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    format: Literal["pdf", "markdown", "docx"]


class ExportJobOut(BaseModel):
    id: str
    document_id: str
    format: str
    status: str
    download_url: str | None = None

    class Config:
        from_attributes = True
