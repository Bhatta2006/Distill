import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Diagram(Base):
    __tablename__ = "diagrams"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"), unique=True)
    type: Mapped[str] = mapped_column(String, default="pipeline")  # pipeline|architecture|experiment
    mermaid_code: Mapped[str] = mapped_column(Text, nullable=False)
    raw_graph: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    confidence: Mapped[str] = mapped_column(String, default="medium")  # high|medium|low
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
