from __future__ import annotations
import asyncio
import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, get_db
from app.models.document import Document
from app.api.routes import documents, annotations, chat, export
from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Lucid API", version="1.0.0", lifespan=lifespan)

# ── CORS ─────────────────────────────────────────────────────────────────────
def _allowed_origins() -> list[str]:
    base = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://distill.vercel.app",
    ]
    # Allow any *.vercel.app preview URL
    if extra := get_settings().frontend_url:
        base.append(extra)
    return base

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,   # we use header-based auth, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api")
app.include_router(annotations.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(export.router, prefix="/api")


# ── WebSocket: real-time status (Docker). Vercel clients fall back to polling. ──

STAGE_PROGRESS = {
    "queued": 0.05, "parsing": 0.15, "segmenting": 0.30,
    "summarizing": 0.55, "diagramming": 0.75, "embedding": 0.90,
    "ready": 1.0, "failed": 1.0,
}
STAGE_MESSAGES = {
    "queued": "Queued for processing…", "parsing": "Parsing PDF layout…",
    "segmenting": "Detecting sections…", "summarizing": "Summarizing & highlighting…",
    "diagramming": "Generating method diagram…", "embedding": "Indexing for chat…",
    "ready": "Ready!", "failed": "Processing failed.",
}


@app.websocket("/ws/documents/{doc_id}")
async def ws_document_status(
    websocket: WebSocket, doc_id: str, db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    try:
        last_status = None
        while True:
            doc = await db.get(Document, doc_id)
            if not doc:
                await websocket.send_text(json.dumps({"error": "Document not found"}))
                break
            if doc.status != last_status:
                last_status = doc.status
                await websocket.send_text(json.dumps({
                    "stage": doc.status,
                    "progress": STAGE_PROGRESS.get(doc.status, 0),
                    "message": STAGE_MESSAGES.get(doc.status, doc.status),
                }))
            if doc.status in ("ready", "failed"):
                break
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass


@app.get("/health")
def health():
    return {"status": "ok"}
