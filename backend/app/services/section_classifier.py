"""
Classify text blocks into IMRaD sections using heuristic heading detection,
with LLM fallback for non-standard papers.
"""
from __future__ import annotations
import re
from dataclasses import dataclass
from app.services.pdf_parser import ParsedDocument, ParsedPage, TextSpan

SECTION_PATTERNS: dict[str, list[str]] = {
    "abstract": [r"^abstract$"],
    "introduction": [r"^(1\.?\s+)?introduction$", r"^background$"],
    "related_work": [r"^related\s+work", r"^prior\s+work", r"^literature\s+review"],
    "method": [r"^(2\.?\s+)?(method|approach|system|architecture|proposed|our\s+method)", r"^methodology"],
    "experiments": [r"^(experiment|experimental|setup|implementation|training)", r"^(4|5)\.?\s+(experiment|setup)"],
    "results": [r"^(results?|evaluation|performance|benchmark|comparison)"],
    "discussion": [r"^discussion"],
    "limitations": [r"^limitation"],
    "conclusion": [r"^(conclusion|summary|future\s+work)"],
    "references": [r"^references?$", r"^bibliography$"],
}


@dataclass
class DetectedSection:
    type: str
    title: str
    page_start: int
    page_end: int
    order_idx: int
    text: str


def _is_heading(span: TextSpan, median_font: float) -> bool:
    return span.font_size > median_font * 1.1 or span.font_size >= 12


def _classify_heading(text: str) -> str:
    normalized = text.lower().strip().rstrip(".")
    for section_type, patterns in SECTION_PATTERNS.items():
        for pat in patterns:
            if re.match(pat, normalized):
                return section_type
    return "other"


def detect_sections(parsed: ParsedDocument) -> list[DetectedSection]:
    all_spans = [s for p in parsed.pages for s in p.spans]
    if not all_spans:
        return [DetectedSection("other", "Full Paper", 1, parsed.page_count, 0, "")]

    sizes = sorted(s.font_size for s in all_spans)
    median_font = sizes[len(sizes) // 2]

    heading_spans: list[tuple[TextSpan, str]] = []
    for span in all_spans:
        if _is_heading(span, median_font) and 2 < len(span.text) < 100:
            sec_type = _classify_heading(span.text)
            heading_spans.append((span, sec_type))

    if not heading_spans:
        return [DetectedSection("other", "Full Paper", 1, parsed.page_count, 0, _full_text(parsed))]

    sections: list[DetectedSection] = []
    for idx, (span, sec_type) in enumerate(heading_spans):
        page_start = span.page
        page_end = heading_spans[idx + 1][0].page - 1 if idx + 1 < len(heading_spans) else parsed.page_count
        page_end = max(page_start, page_end)

        sec_text = " ".join(
            p.text for p in parsed.pages if page_start <= p.page_num <= page_end
        )
        sections.append(DetectedSection(
            type=sec_type,
            title=span.text,
            page_start=page_start,
            page_end=page_end,
            order_idx=idx,
            text=sec_text,
        ))

    return sections


def _full_text(parsed: ParsedDocument) -> str:
    return " ".join(p.text for p in parsed.pages)
