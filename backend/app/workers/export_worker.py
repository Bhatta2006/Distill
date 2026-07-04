from __future__ import annotations
import asyncio
from pathlib import Path
from sqlalchemy import select

from app.workers.celery_app import celery_app
from app.database import SessionLocal
from app.models.document import Document, Section
from app.models.annotation import Highlight, Drawing
from app.models.diagram import Diagram
from app.models.export import ExportJob
from app.services.export_service import export_pdf, export_markdown, export_docx
from app.config import get_settings


@celery_app.task(bind=True, name="run_export")
def run_export(self, job_id: str):
    asyncio.run(_run_export(job_id))


async def _run_export(job_id: str):
    async with SessionLocal() as db:
        job = await db.get(ExportJob, job_id)
        if not job:
            return
        job.status = "processing"
        await db.commit()

        try:
            doc = await db.get(Document, job.document_id)
            sections_r = await db.execute(
                select(Section).where(Section.document_id == job.document_id).order_by(Section.order_idx)
            )
            sections = list(sections_r.scalars().all())

            highlights_r = await db.execute(
                select(Highlight).where(Highlight.document_id == job.document_id)
            )
            highlights = list(highlights_r.scalars().all())

            drawings_r = await db.execute(
                select(Drawing).where(Drawing.document_id == job.document_id)
            )
            drawings = list(drawings_r.scalars().all())

            diagram_r = await db.execute(
                select(Diagram).where(Diagram.document_id == job.document_id)
            )
            diagram = diagram_r.scalar_one_or_none()

            settings = get_settings()
            out_dir = Path(settings.storage_path) / "exports"
            out_dir.mkdir(parents=True, exist_ok=True)

            if job.format == "pdf":
                out_path = str(out_dir / f"{job_id}.pdf")
                export_pdf(doc.file_path, highlights, drawings, sections, diagram, out_path)
            elif job.format == "markdown":
                out_path = str(out_dir / f"{job_id}.md")
                content = export_markdown(sections, diagram)
                Path(out_path).write_text(content, encoding="utf-8")
            elif job.format == "docx":
                out_path = str(out_dir / f"{job_id}.docx")
                export_docx(sections, diagram, out_path)

            job.status = "done"
            job.output_path = out_path
            await db.commit()

        except Exception as exc:
            job.status = "failed"
            job.error = str(exc)
            await db.commit()
            raise
