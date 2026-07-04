"""
Two-step diagram generation:
1. LLM extracts a JSON graph {nodes, edges} from the method section prose.
2. We convert that to Mermaid.js flowchart syntax.
"""
from __future__ import annotations
import json
import re
from dataclasses import dataclass
from app.services.llm_client import structured_completion

EXTRACT_SYSTEM = """You are a scientific diagram extractor. Given a Methods/Approach section
from a research paper, extract the pipeline or architecture as a JSON graph.

Return ONLY a valid JSON object in this exact shape:
{
  "type": "pipeline" | "architecture" | "experiment",
  "confidence": "high" | "medium" | "low",
  "nodes": [
    {"id": "n1", "label": "short label", "type": "process" | "decision" | "io" | "start" | "end"}
  ],
  "edges": [
    {"from": "n1", "to": "n2", "label": "optional edge label"}
  ]
}

If the section is too math-heavy or has no clear procedural structure, set confidence to "low"
and still return a minimal graph. Return ONLY the JSON object, no prose."""


@dataclass
class DiagramSpec:
    type: str
    confidence: str
    mermaid_code: str
    raw_graph: dict


def generate_diagram(method_text: str, api_key: str) -> DiagramSpec:
    truncated = method_text[:5000]
    resp = structured_completion(
        api_key=api_key,
        messages=[{"role": "user", "content": f"Methods section:\n\n{truncated}"}],
        system=EXTRACT_SYSTEM,
        model="claude-sonnet-4-6",
        max_tokens=2048,
    )

    graph = _parse_graph(resp)
    mermaid = _to_mermaid(graph)
    return DiagramSpec(
        type=graph.get("type", "pipeline"),
        confidence=graph.get("confidence", "medium"),
        mermaid_code=mermaid,
        raw_graph=graph,
    )


def _parse_graph(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    # Fallback: return a stub graph
    return {
        "type": "pipeline",
        "confidence": "low",
        "nodes": [{"id": "n1", "label": "Could not extract diagram", "type": "process"}],
        "edges": [],
    }


def _to_mermaid(graph: dict) -> str:
    lines = ["flowchart TD"]
    node_type_map = {
        "start": lambda lbl: f'(["{lbl}"])',
        "end": lambda lbl: f'(["{lbl}"])',
        "decision": lambda lbl: f'{{"{lbl}"}}',
        "io": lambda lbl: f'[/"{lbl}"/]',
        "process": lambda lbl: f'["{lbl}"]',
    }

    for node in graph.get("nodes", []):
        nid = _safe_id(node["id"])
        lbl = node.get("label", nid)
        ntype = node.get("type", "process")
        shape_fn = node_type_map.get(ntype, node_type_map["process"])
        lines.append(f"    {nid}{shape_fn(lbl)}")

    for edge in graph.get("edges", []):
        src = _safe_id(edge["from"])
        dst = _safe_id(edge["to"])
        lbl = edge.get("label", "")
        arrow = f" -->|{lbl}| " if lbl else " --> "
        lines.append(f"    {src}{arrow}{dst}")

    return "\n".join(lines)


def _safe_id(s: str) -> str:
    return re.sub(r'\W+', '_', s)
