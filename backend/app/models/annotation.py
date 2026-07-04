import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Highlight(Base):
    __tablename__ = "highlights"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"))
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    rects: Mapped[list] = mapped_column(JSON, nullable=False)  # [{x,y,width,height}]
    text: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(String, default="#FFD700")
    source: Mapped[str] = mapped_column(String, default="user")  # 'ai' | 'user'
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Drawing(Base):
    __tablename__ = "drawings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"))
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    canvas_data: Mapped[str] = mapped_column(Text, nullable=False)  # Fabric.js JSON
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
