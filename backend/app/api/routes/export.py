from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.export import ExportJob
from app.models.document import Document
from app.schemas.chat import ExportRequest, ExportJobOut
from app.workers.export_worker import run_export

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/{doc_id}", response_model=ExportJobOut, status_code=202)
async def trigger_export(
    doc_id: str, body: ExportRequest, db: AsyncSession = Depends(get_db)
):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status != "ready":
        raise HTTPException(status_code=409, detail="Document not yet ready")

    job = ExportJob(document_id=doc_id, format=body.format)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    run_export.delay(job.id)
    return _job_schema(job)


@router.get("/jobs/{job_id}", response_model=ExportJobOut)
async def get_export_job(job_id: str, db: AsyncSession = Depends(get_db)):
    job = await db.get(ExportJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")
    return _job_schema(job)


@router.get("/jobs/{job_id}/download")
async def download_export(job_id: str, db: AsyncSession = Depends(get_db)):
    job = await db.get(ExportJob, job_id)
    if not job or job.status != "done" or not job.output_path:
        raise HTTPException(status_code=404, detail="Export not ready")
    if not Path(job.output_path).exists():
        raise HTTPException(status_code=404, detail="Export file missing")

    media_types = {"pdf": "application/pdf", "markdown": "text/markdown", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    return FileResponse(
        job.output_path,
        media_type=media_types.get(job.format, "application/octet-stream"),
        filename=f"lucid-export.{job.format}",
    )


def _job_schema(job: ExportJob) -> ExportJobOut:
    download_url = f"/api/export/jobs/{job.id}/download" if job.status == "done" else None
    return ExportJobOut(id=job.id, document_id=job.document_id, format=job.format, status=job.status, download_url=download_url)
