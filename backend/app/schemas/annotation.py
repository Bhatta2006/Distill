from pydantic import BaseModel
from typing import Literal
from datetime import datetime
from app.schemas.document import Rect


class HighlightCreate(BaseModel):
    document_id: str
    page: int
    rects: list[Rect]
    text: str
    color: str = "#FFD700"
    comment: str | None = None


class HighlightUpdate(BaseModel):
    color: str | None = None
    comment: str | None = None


class HighlightOut(BaseModel):
    id: str
    document_id: str
    page: int
    rects: list[Rect]
    text: str
    color: str
    source: Literal["ai", "user"]
    comment: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class DrawingCreate(BaseModel):
    document_id: str
    page: int
    canvas_data: str  # Fabric.js JSON


class DrawingOut(BaseModel):
    id: str
    document_id: str
    page: int
    canvas_data: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnotationsOut(BaseModel):
    highlights: list[HighlightOut]
    drawings: list[DrawingOut]
