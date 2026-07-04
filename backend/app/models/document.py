import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("queued", "parsing", "segmenting", "summarizing", "diagramming", "embedding", "ready", "failed", name="doc_status"),
        default="queued",
    )
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sections: Mapped[list["Section"]] = relationship("Section", back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[list["Chunk"]] = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String, nullable=False)  # abstract|introduction|method|...
    title: Mapped[str] = mapped_column(String, nullable=False)
    page_start: Mapped[int] = mapped_column(Integer, nullable=False)
    page_end: Mapped[int] = mapped_column(Integer, nullable=False)
    order_idx: Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="sections")
    highlights: Mapped[list["Highlight"]] = relationship(
        "Highlight", primaryjoin="and_(Highlight.document_id==Section.document_id, "
        "Highlight.page>=Section.page_start, Highlight.page<=Section.page_end)",
        foreign_keys="Highlight.document_id",
        viewonly=True,
        overlaps="document",
    )


class Chunk(Base):
    """RAG chunks — paragraphs with embeddings."""
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"))
    section_type: Mapped[str] = mapped_column(String, nullable=False)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(384), nullable=True)  # all-MiniLM-L6-v2 dim

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
