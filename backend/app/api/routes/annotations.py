from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.annotation import Highlight, Drawing
from app.schemas.annotation import (
    HighlightCreate, HighlightUpdate, HighlightOut,
    DrawingCreate, DrawingOut, AnnotationsOut,
)

router = APIRouter(prefix="/annotations", tags=["annotations"])


@router.get("/{doc_id}", response_model=AnnotationsOut)
async def get_annotations(doc_id: str, db: AsyncSession = Depends(get_db)):
    h_res = await db.execute(select(Highlight).where(Highlight.document_id == doc_id))
    d_res = await db.execute(select(Drawing).where(Drawing.document_id == doc_id))
    return AnnotationsOut(
        highlights=list(h_res.scalars().all()),
        drawings=list(d_res.scalars().all()),
    )


@router.post("/highlights", response_model=HighlightOut, status_code=201)
async def create_highlight(body: HighlightCreate, db: AsyncSession = Depends(get_db)):
    h = Highlight(
        document_id=body.document_id,
        page=body.page,
        rects=[r.model_dump() for r in body.rects],
        text=body.text,
        color=body.color,
        source="user",
        comment=body.comment,
    )
    db.add(h)
    await db.commit()
    await db.refresh(h)
    return h


@router.patch("/highlights/{highlight_id}", response_model=HighlightOut)
async def update_highlight(
    highlight_id: str, body: HighlightUpdate, db: AsyncSession = Depends(get_db)
):
    h = await db.get(Highlight, highlight_id)
    if not h:
        raise HTTPException(status_code=404, detail="Highlight not found")
    if body.color is not None:
        h.color = body.color
    if body.comment is not None:
        h.comment = body.comment
    await db.commit()
    await db.refresh(h)
    return h


@router.delete("/highlights/{highlight_id}", status_code=204)
async def delete_highlight(highlight_id: str, db: AsyncSession = Depends(get_db)):
    h = await db.get(Highlight, highlight_id)
    if not h:
        raise HTTPException(status_code=404, detail="Highlight not found")
    await db.delete(h)
    await db.commit()


@router.post("/drawings", response_model=DrawingOut, status_code=201)
async def upsert_drawing(body: DrawingCreate, db: AsyncSession = Depends(get_db)):
    # One drawing object per page — update if exists
    result = await db.execute(
        select(Drawing).where(
            Drawing.document_id == body.document_id,
            Drawing.page == body.page,
        )
    )
    drawing = result.scalar_one_or_none()
    if drawing:
        drawing.canvas_data = body.canvas_data
    else:
        drawing = Drawing(document_id=body.document_id, page=body.page, canvas_data=body.canvas_data)
        db.add(drawing)
    await db.commit()
    await db.refresh(drawing)
    return drawing


@router.delete("/drawings/{drawing_id}", status_code=204)
async def delete_drawing(drawing_id: str, db: AsyncSession = Depends(get_db)):
    d = await db.get(Drawing, drawing_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drawing not found")
    await db.delete(d)
    await db.commit()
