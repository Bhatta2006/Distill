"""
Per-section summarization + salience scoring for auto-highlighting.
Uses a cheap model for salience (high-volume) and a stronger one for summaries.
"""
from __future__ import annotations
import json
import re
from app.services.llm_client import chat_completion, structured_completion
from app.services.section_classifier import DetectedSection

SUMMARY_SYSTEM = """You are a research paper assistant. Write plain-language, jargon-free summaries
for non-expert readers. Be concise: 2-4 sentences maximum. Never use bullet points."""

SALIENCE_SYSTEM = """You extract the most important sentences from a section of a research paper.
Return a JSON object with a single key "indices" — a list of integer indices (0-based)
of the most important sentences. Select 10-20% of sentences that carry the key claim,
method step, number, or finding. Return ONLY valid JSON, no other text."""


def summarize_section(section: DetectedSection, api_key: str) -> str:
    if not section.text.strip():
        return ""
    truncated = section.text[:4000]  # keep context window manageable
    resp = chat_completion(
        api_key=api_key,
        messages=[{"role": "user", "content": f"Section: {section.title}\n\n{truncated}"}],
        system=SUMMARY_SYSTEM,
        model="claude-sonnet-4-6",
        max_tokens=256,
    )
    return resp.strip()


def score_salience(sentences: list[str], section_type: str, api_key: str) -> list[int]:
    """Return 0-based indices of sentences to highlight."""
    if not sentences:
        return []

    numbered = "\n".join(f"{i}: {s}" for i, s in enumerate(sentences))
    resp = structured_completion(
        api_key=api_key,
        messages=[{
            "role": "user",
            "content": (
                f"Section type: {section_type}\n\n"
                f"Sentences:\n{numbered[:3000]}\n\n"
                "Return the indices of the most important sentences as JSON: {\"indices\": [...]}"
            ),
        }],
        system=SALIENCE_SYSTEM,
        max_tokens=512,
    )

    try:
        # Be defensive — model may wrap JSON in markdown fences
        match = re.search(r'\{.*\}', resp, re.DOTALL)
        if match:
            data = json.loads(match.group())
            indices = [int(i) for i in data.get("indices", []) if 0 <= int(i) < len(sentences)]
            return indices
    except (json.JSONDecodeError, ValueError):
        pass

    return []


def split_sentences(text: str) -> list[str]:
    """Simple sentence splitter — good enough for scientific text."""
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    return [p.strip() for p in parts if len(p.strip()) > 20]
