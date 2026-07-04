from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class Rect(BaseModel):
    x: float
    y: float
    width: float
    height: float


class HighlightOut(BaseModel):
    id: str
    document_id: str
    page: int
    rects: list[Rect]
    text: str
    color: str
    source: Literal["ai", "user"]
    comment: str | None

    class Config:
        from_attributes = True


class SectionOut(BaseModel):
    id: str
    type: str
    title: str
    page_start: int
    page_end: int
    order_idx: int
    summary: str | None
    highlights: list[HighlightOut] = []

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    filename: str
    status: str
    error: str | None
    page_count: int | None
    title: str | None
    sections: list[SectionOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    filename: str


class ProcessingStatus(BaseModel):
    stage: str
    progress: float  # 0-1
    message: str
