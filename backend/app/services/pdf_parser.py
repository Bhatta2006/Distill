"""
PDF parsing via PyMuPDF. Extracts text with bounding boxes, page count, and
raw text per page. Multi-column detection uses basic horizontal-band clustering.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from pathlib import Path
import fitz  # PyMuPDF


@dataclass
class TextSpan:
    text: str
    page: int
    x: float
    y: float
    width: float
    height: float
    font_size: float


@dataclass
class ParsedPage:
    page_num: int  # 1-indexed
    text: str
    spans: list[TextSpan] = field(default_factory=list)


@dataclass
class ParsedDocument:
    page_count: int
    pages: list[ParsedPage]
    title: str | None = None


def parse_pdf(path: str | Path) -> ParsedDocument:
    doc = fitz.open(str(path))
    pages: list[ParsedPage] = []
    title: str | None = None

    # Try to extract title from metadata or first large-text span
    meta_title = doc.metadata.get("title", "").strip()
    if meta_title:
        title = meta_title

    for page_num, page in enumerate(doc, start=1):
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        spans: list[TextSpan] = []
        page_text_parts: list[str] = []

        for block in blocks:
            if block["type"] != 0:  # skip images
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if not text:
                        continue
                    bbox = span["bbox"]  # (x0, y0, x1, y1) in PDF points
                    ts = TextSpan(
                        text=text,
                        page=page_num,
                        x=bbox[0],
                        y=bbox[1],
                        width=bbox[2] - bbox[0],
                        height=bbox[3] - bbox[1],
                        font_size=span["size"],
                    )
                    spans.append(ts)
                    page_text_parts.append(text)

        if page_num == 1 and not title and spans:
            # Largest font span on page 1 is likely the title
            biggest = max(spans, key=lambda s: s.font_size, default=None)
            if biggest and biggest.font_size > 14:
                title = biggest.text[:200]

        pages.append(ParsedPage(page_num=page_num, text=" ".join(page_text_parts), spans=spans))

    doc.close()
    return ParsedDocument(page_count=len(pages), pages=pages, title=title)


def extract_full_text(parsed: ParsedDocument) -> str:
    return "\n\n".join(p.text for p in parsed.pages)


def find_spans_for_sentence(sentence: str, page_spans: list[TextSpan]) -> list[TextSpan]:
    """Fuzzy match a sentence back to its bounding-box spans on a page."""
    needle = sentence.lower().strip()
    matched: list[TextSpan] = []
    window: list[TextSpan] = []
    window_text = ""

    for span in page_spans:
        window.append(span)
        window_text += " " + span.text.lower()
        window_text = window_text.strip()

        if needle in window_text:
            matched = list(window)
            window = []
            window_text = ""
            continue

        # Keep window size reasonable
        if len(window) > 40:
            window.pop(0)
            window_text = " ".join(s.text.lower() for s in window)

    return matched
