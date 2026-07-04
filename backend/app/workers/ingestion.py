"""
Ingestion pipeline.

Two call paths:
  - Docker  (USE_CELERY=true):  Celery task kicks off asyncio.run(_ingest(...))
  - Vercel  (USE_CELERY=false): FastAPI BackgroundTasks calls run_ingestion(...)
"""
from __future__ import annotations
import asyncio
from sqlalchemy import select

from app.database import SessionLocal
from app.models.document import Document, Section, Chunk
from app.models.annotation import Highlight
from app.models.diagram import Diagram
from app.services.pdf_parser import parse_pdf, find_spans_for_sentence
from app.services.section_classifier import detect_sections
from app.services.summarizer import summarize_section, score_salience, split_sentences
from app.services.diagram_generator import generate_diagram
from app.services.embeddings import embed_texts


# ── Vercel entry (async, called via BackgroundTasks) ─────────────────────────

async def run_ingestion(document_id: str, api_key: str) -> None:
    """Awaitable — use with FastAPI BackgroundTasks when Celery is off."""
    await _ingest(document_id, api_key)


# ── Celery entry (only imported when USE_CELERY=true) ────────────────────────

def register_celery_task():
    from app.workers.celery_app import celery_app

    @celery_app.task(bind=True, name="ingest_document")
    def ingest_document(self, document_id: str, api_key: str):  # noqa: ANN001
        asyncio.run(_ingest(document_id, api_key))

    return ingest_document


# ── Core pipeline ─────────────────────────────────────────────────────────────

async def _ingest(document_id: str, api_key: str) -> None:
    async with SessionLocal() as db:
        doc = await db.get(Document, document_id)
        if not doc:
            return

        try:
            await _set_status(db, doc, "parsing")
            parsed = parse_pdf(doc.file_path)
            doc.page_count = parsed.page_count
            doc.title = parsed.title
            await db.flush()

            await _set_status(db, doc, "segmenting")
            raw_sections = detect_sections(parsed)
            db_sections: list[tuple[Section, object]] = []
            for rs in raw_sections:
                s = Section(
                    document_id=document_id,
                    type=rs.type,
                    title=rs.title,
                    page_start=rs.page_start,
                    page_end=rs.page_end,
                    order_idx=rs.order_idx,
                )
                db.add(s)
                db_sections.append((s, rs))
            await db.flush()

            await _set_status(db, doc, "summarizing")
            for section_obj, rs in db_sections:
                section_obj.summary = summarize_section(rs, api_key)
                sentences = split_sentences(rs.text)
                if sentences:
                    salient_idx = score_salience(sentences, rs.type, api_key)
                    page_spans = {
                        p.page_num: p.spans
                        for p in parsed.pages
                        if rs.page_start <= p.page_num <= rs.page_end
                    }
                    for idx in salient_idx:
                        sent = sentences[idx]
                        for page_num, spans in page_spans.items():
                            matched = find_spans_for_sentence(sent, spans)
                            if matched:
                                rects = [{"x": sp.x, "y": sp.y, "width": sp.width, "height": sp.height} for sp in matched]
                                db.add(Highlight(
                                    document_id=document_id,
                                    page=page_num,
                                    rects=rects,
                                    text=sent[:500],
                                    color="#FFD700",
                                    source="ai",
                                ))
                                break
            await db.flush()

            await _set_status(db, doc, "diagramming")
            method_sections = [(s, rs) for s, rs in db_sections if rs.type in ("method", "experiments", "introduction")]
            if method_sections:
                best = next((p for p in method_sections if p[1].type == "method"), method_sections[0])
                spec = generate_diagram(best[1].text, api_key)
                db.add(Diagram(
                    document_id=document_id,
                    type=spec.type,
                    mermaid_code=spec.mermaid_code,
                    raw_graph=spec.raw_graph,
                    confidence=spec.confidence,
                ))
                await db.flush()

            await _set_status(db, doc, "embedding")
            all_chunks: list[tuple[str, str, int]] = []
            for _, rs in db_sections:
                sentences = split_sentences(rs.text)
                for i in range(0, len(sentences), 3):
                    chunk_text = " ".join(sentences[i:i + 3]).strip()
                    if chunk_text:
                        all_chunks.append((chunk_text, rs.type, rs.page_start))

            if all_chunks:
                texts = [c[0] for c in all_chunks]
                embeddings = embed_texts(texts)
                for (text, sec_type, page), vec in zip(all_chunks, embeddings):
                    db.add(Chunk(document_id=document_id, section_type=sec_type, page=page, text=text, embedding=vec))

            doc.status = "ready"
            await db.commit()

        except Exception as exc:
            doc.status = "failed"
            doc.error = str(exc)
            await db.commit()
            raise


async def _set_status(db, doc: Document, status: str) -> None:
    doc.status = status
    await db.commit()
