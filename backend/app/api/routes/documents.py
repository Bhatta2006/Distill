from __future__ import annotations
import uuid
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.api.deps import get_api_key
from app.models.document import Document, Section
from app.models.annotation import Highlight
from app.models.diagram import Diagram
from app.schemas.document import DocumentOut, SectionOut, HighlightOut
from app.schemas.chat import DiagramOut
from app.config import get_settings

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(get_api_key),
):
    settings = get_settings()
    upload_dir = Path(settings.storage_path)
    upload_dir.mkdir(parents=True, exist_ok=True)

    doc_id = str(uuid.uuid4())
    suffix = Path(file.filename or "upload.pdf").suffix or ".pdf"
    file_path = str(upload_dir / f"{doc_id}{suffix}")

    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    Path(file_path).write_bytes(content)

    doc = Document(id=doc_id, filename=file.filename or "document.pdf", file_path=file_path)
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    if settings.use_celery:
        # Docker path: hand off to Celery worker
        from app.workers.ingestion import register_celery_task
        ingest_document = register_celery_task()
        ingest_document.delay(doc_id, api_key)
    else:
        # Vercel path: run in FastAPI BackgroundTasks (same process)
        from app.workers.ingestion import run_ingestion
        background_tasks.add_task(run_ingestion, doc_id, api_key)

    return _doc_to_schema(doc)


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await _get_or_404(db, doc_id)
    sections = await _load_sections_with_highlights(db, doc_id)
    return _doc_to_schema(doc, sections)


@router.get("/{doc_id}/file")
async def get_document_file(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await _get_or_404(db, doc_id)
    if not Path(doc.file_path).exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.filename)


@router.get("/{doc_id}/diagram", response_model=DiagramOut)
async def get_diagram(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Diagram).where(Diagram.document_id == doc_id))
    diagram = result.scalar_one_or_none()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not yet generated")
    return diagram


# ── helpers ──────────────────────────────────────────────────────────────────

async def _get_or_404(db: AsyncSession, doc_id: str) -> Document:
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


async def _load_sections_with_highlights(db: AsyncSession, doc_id: str) -> list[Section]:
    s_result = await db.execute(
        select(Section).where(Section.document_id == doc_id).order_by(Section.order_idx)
    )
    sections = list(s_result.scalars().all())

    h_result = await db.execute(select(Highlight).where(Highlight.document_id == doc_id))
    highlights = list(h_result.scalars().all())

    by_page: dict[int, list[Highlight]] = {}
    for h in highlights:
        by_page.setdefault(h.page, []).append(h)

    for s in sections:
        s._highlights = [
            h for page in range(s.page_start, s.page_end + 1)
            for h in by_page.get(page, [])
        ]
    return sections


def _doc_to_schema(doc: Document, sections: list[Section] | None = None) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        filename=doc.filename,
        status=doc.status,
        error=doc.error,
        page_count=doc.page_count,
        title=doc.title,
        sections=[
            SectionOut(
                id=s.id,
                type=s.type,
                title=s.title,
                page_start=s.page_start,
                page_end=s.page_end,
                order_idx=s.order_idx,
                summary=s.summary,
                highlights=[
                    HighlightOut(
                        id=h.id,
                        document_id=h.document_id,
                        page=h.page,
                        rects=h.rects,
                        text=h.text,
                        color=h.color,
                        source=h.source,
                        comment=h.comment,
                    )
                    for h in getattr(s, "_highlights", [])
                ],
            )
            for s in (sections or [])
        ],
        created_at=doc.created_at,
    )
