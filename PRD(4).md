# Product Requirements Document (PRD)
## Project Codename: **Lucid** — AI Research Paper Companion
*(working title — rename before launch)*

**Version:** 0.1 (Draft for founder review)
**Date:** July 4, 2026
**Author:** Product/Tech Planning
**Focus:** This PRD is intentionally weighted toward the technical/architecture side per request. Business/GTM sections are kept brief for context only.

---

## 1. Executive Summary

Lucid is a web-first platform that turns a dense research paper into something a newcomer can actually read, question, mark up, and walk away from with real understanding. It combines five things that currently only exist **separately** across different competitor products:

1. A summarizer that auto-highlights the important sentences *inside the original paper* (not just a separate summary blob)
2. An AI-generated **flowchart/diagram** of the paper's method, pipeline, or argument structure
3. A grounded chatbot (RAG over the specific paper, with citations back to exact passages)
4. A real annotation workspace — highlights, sticky comments, and freehand pencil drawing directly on the PDF
5. One-click export of an "enriched" version of the paper (highlights + summary + notes + diagram baked in)

No single competitor (SciSpace, Explainpaper, NotebookLM, Scholarcy, Elicit, OpenRead, ChatPDF/UPDF, Kami) currently ships all five in one clean product — this is the whitespace Lucid targets. Section 4 documents this in detail.

---

## 2. Problem Statement

Research papers are written by experts, for experts. A student, junior engineer, journalist, or career-switcher hitting a paper for the first time faces three compounding barriers:

- **Density**: jargon, unexplained acronyms, and terse methodology sections
- **Structure blindness**: it's hard to see *how* a method flows (data → model → training → eval) just from prose
- **No safe way to interrogate it**: you can't "ask the paper a question" or mark it up the way you would a physical printout with a highlighter and pencil

Existing tools solve slices of this (SciSpace does citation-grounded chat; NotebookLM does mind maps of *topics*, not *method flowcharts*; Kami does freehand annotation but has no research-specific AI; OpenRead has generic "diagram drawing" but it's not a first-class, method-aware flowchart engine). Nobody combines simplification + visual structure + annotation + export in one reading surface.

---

## 3. Goals & Non-Goals

**Goals (v1 / MVP)**
- Upload a PDF (or arXiv/DOI link) and get a section-aware summary with in-line highlights within ~30–60 seconds for a typical paper (<40 pages)
- Auto-generate at least one accurate flowchart/diagram for the paper's method or pipeline
- Provide a chatbot that answers questions with citations to exact page/paragraph
- Let users highlight, comment, and freehand-draw on the PDF, with autosave
- Export an enriched PDF (or Markdown/DOCX) with highlights + summary + diagram appended
- Clean, distraction-free, minimal reading UI

**Non-goals (v1)**
- Full literature-review-across-hundreds-of-papers workflows (SciSpace/Elicit's core turf) — may become v2
- Manuscript writing / AI Writer for producing new papers
- LMS integrations (Google Classroom, Canvas) — Kami's turf, not core to this problem
- Real-time multi-user collaborative editing (single-user annotation first; collab is Phase 3)

---

## 4. Competitive Landscape (Research-Backed)

### 4.1 Feature Matrix

| Feature | SciSpace | Explainpaper | NotebookLM | Scholarcy | Elicit / Consensus | OpenRead | ChatPDF / UPDF | Kami | **Lucid (target)** |
|---|---|---|---|---|---|---|---|---|---|
| Section-aware summary | ✅ (Copilot/Agent) | ⚠️ basic gist, paid for detail | ⚠️ whole-notebook only | ✅ flashcard-style | ⚠️ cross-paper only | ✅ | ⚠️ generic | ❌ | ✅ |
| **Auto-highlighting inside original doc** | ❌ (separate summary) | ❌ (user highlights manually) | ❌ | ⚠️ flashcards, not inline | ❌ | ❌ | ❌ | ❌ (manual only) | ✅ **key differentiator** |
| Flowchart / method diagram | ❌ | ❌ | ⚠️ topic mind-map only, not method-flow | ❌ | ❌ | ⚠️ generic "diagram drawing" | ❌ | ❌ (manual drawing only) | ✅ **key differentiator** |
| Chat with citations | ✅ | ✅ | ✅ | ❌ | ✅ (cross-paper) | ✅ | ✅ | ❌ | ✅ |
| Freehand draw / pencil annotation | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ image editing only | ❌ | ✅ (core feature) | ✅ |
| Sticky comments / highlight-and-note | ⚠️ limited | ❌ | ❌ | ❌ | ❌ | ⚠️ notes only | ⚠️ limited | ✅ | ✅ |
| Export enriched/annotated paper | ⚠️ MD/DOCX summary only | ❌ | ⚠️ mind map download only | ✅ (flashcard export) | ❌ | ⚠️ | ❌ | ✅ (annotated PDF) | ✅ (summary+diagram+notes in one file) |
| Multi-paper literature review | ✅ strong | ❌ | ⚠️ multi-source Q&A | ⚠️ | ✅ strong | ⚠️ | ❌ | ❌ | 🔜 Phase 2 |
| Minimalist, reading-first UI | ⚠️ feature-dense | ✅ | ⚠️ notebook-dense | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ classroom-dense | ✅ design pillar |

*(✅ = strong/native, ⚠️ = partial/weak, ❌ = absent — based on public product documentation and third-party reviews as of mid-2026)*

### 4.2 What this tells us (the gap)
- **Summarization is a commodity.** Every competitor does some version of it. Winning on summarization alone is not defensible.
- **Nobody does inline auto-highlighting of the original PDF** the way a smart human reader would with a highlighter — they all produce a *separate* summary artifact instead.
- **Diagram generation is either absent or generic.** Tools like OpenRead or general AI diagram generators (Eraser, Miro AI, EdrawMax) can turn *text you type* into a flowchart, but none are purpose-built to read a paper's Methods section and output a faithful pipeline diagram. Recent academic work (e.g., "Flowchart2Mermaid," "AIBench: Visual-Logical Consistency in Academic Illustration Generation") confirms this is still an open, active research problem — which is both the opportunity and the technical risk (see Section 10).
- **Annotation-with-drawing tools (Kami, Hypothes.is) have zero AI/research-specific intelligence.** They're built for classrooms, not for someone trying to decode a transformer paper.
- **The "one download at the end" step is missing everywhere.** Users want to walk away with a single artifact, not five browser tabs.

This is Lucid's wedge: **own the single-paper deep-reading experience end-to-end**, then expand into multi-paper workflows later once the core loop is proven.

---

## 5. Target Users (brief)

| Persona | Need |
|---|---|
| CS/STEM undergrad or bootcamp learner | "Explain this like I'm new, and show me the pipeline" |
| Grad student / early PhD | Fast triage: is this paper relevant? What's the method? |
| Industry engineer/PM reading a paper for work | Skim the gist, verify claims, save notes for team |
| Journalist / policy analyst | Understand claims without domain background, cite accurately |
| Non-native English reader | Plain-language + visual explanation reduces language barrier |

---

## 6. Core Features — Technical Specification

### 6.1 Feature 1: Smart Summarizer with Auto-Highlighting

**User story:** "When I open a paper, I want the important sentences already highlighted *in the paper itself*, plus a short plain-language summary per section."

**How it works (pipeline):**
1. **Ingestion**: PDF → parsed via a layout-aware parser (see Section 9) that preserves section boundaries, paragraph order, figure/table anchors, and bounding-box coordinates for every text span (needed later to draw highlights back onto the rendered PDF).
2. **Section segmentation**: classify text blocks into IMRaD-style sections (Abstract, Intro, Related Work, Method, Experiments, Results, Discussion, Limitations, Conclusion, References) using a combination of heuristic (font size/heading detection) + LLM classification fallback for papers with non-standard structure.
3. **Salience scoring**: for each sentence, compute an "importance score" using a hybrid approach:
   - Extractive signal: TextRank/LexRank-style graph centrality over sentence embeddings (cheap, deterministic, no LLM cost)
   - Abstractive/semantic signal: LLM pass per section that returns the *indices* of sentences that carry the section's key claim, method step, number, or limitation (structured JSON output, not freeform text — see Section 9.4)
   - Merge both signals with a tunable weight; top-N% sentences per section (configurable, default ~15%) are marked as "highlight-worthy."
4. **Highlight rendering**: map highlighted sentences back to their bounding boxes in the original PDF using the coordinates captured in step 1, and render as a translucent highlight layer (non-destructive, toggleable, adjustable sensitivity slider: "show more/fewer highlights").
5. **Section summaries**: one 2–4 sentence plain-language summary per section, generated with a fixed prompt template and a strict "ELI-newcomer" style instruction, displayed in a collapsible side panel next to the reading pane.
6. **Jargon layer**: any technical term the model flags as non-obvious gets a lightweight inline tooltip definition (hover/tap), generated once per unique term and cached.

**Key technical risk:** highlight-to-coordinate mapping breaks on multi-column layouts, scanned/OCR'd PDFs, and rotated pages. Mitigation: use a PDF parsing library with strong multi-column support (see stack) and fall back to a "summary-only, no inline highlight" mode with a visible banner when confidence is low.

### 6.2 Feature 2: AI Flowchart / Diagram Maker

**User story:** "Show me the paper's method as a diagram, not just a paragraph."

**How it works:**
1. Identify diagram-worthy sections (typically Method/Approach/System/Architecture) using the section classifier from 6.1.
2. Run a dedicated "structure extraction" LLM pass that converts the prose into an explicit intermediate representation — a JSON graph of `{nodes: [{id, label, type: process|decision|io|start|end}], edges: [{from, to, label?}]}` — rather than asking the model to draw a diagram directly. This intermediate-JSON approach is the same pattern used in current diagram-AI tools (Eraser/DiagramGPT, Miro AI, EdrawMax) and academic systems like Flowchart2Mermaid, and it materially reduces hallucinated/garbled layouts vs. asking an LLM to emit diagram code freehand.
3. Convert the JSON graph to a diagram spec: **Mermaid.js flowchart syntax** as the primary target (renders natively in-browser, is editable as text, and is a widely supported interchange format), with Graphviz DOT as a secondary export option for complex graphs needing better auto-layout.
4. Render client-side (Mermaid.js in the browser) so diagrams are instantly editable — user can rename a node, delete a step, or drag to rearrange without a server round-trip; regeneration only needed for structural changes.
5. Offer 3 diagram types depending on paper type: **Pipeline/process flow** (most papers — data → model → output), **Architecture/block diagram** (systems papers), **Decision/experiment flow** (ML training loops, ablation studies).
6. Confidence flag: if the extraction pass has low confidence (e.g., very math-heavy theory paper with no clear procedural structure), Lucid should say so rather than force a flowchart — this is a known failure mode of text→diagram systems per recent literature (see AIBench paper on visual-logical consistency), and hallucinated structure is worse than no diagram.

### 6.3 Feature 3: Contextual Chatbot (Grounded Q&A)

**User story:** "Let me ask the paper questions and get answers I can trust, with a pointer back to where it says that."

**How it works:**
1. **Chunking**: paper text chunked by paragraph (not fixed-token windows) to preserve semantic units, each chunk tagged with section + page + bounding box.
2. **Embedding + retrieval**: chunks embedded (see stack) into a per-document vector index; on each user question, retrieve top-k relevant chunks (hybrid dense + keyword/BM25 retrieval for numbers/acronyms that embeddings handle poorly).
3. **Answer generation**: LLM answers using only retrieved chunks (strict RAG, not open-book model knowledge) with an explicit "answer only from the provided paper; say 'not stated in this paper' if not found" system instruction to reduce hallucination.
4. **Citation UI**: every claim in the chatbot's answer links to the exact highlighted passage; clicking scrolls/jumps the PDF viewer to that spot.
5. **Multi-turn memory**: conversation history retained per document session; follow-up questions re-run retrieval with the conversation context appended.
6. **Guardrail**: chatbot explicitly refuses to "fill in" missing methodology details or fabricate numbers not in the paper — a known complaint about competitor tools per user reviews (SciSpace users report it "can sometimes miss context" and recommend cross-checking).

### 6.4 Feature 4: Interactive Annotation Workspace (Highlight / Comment / Draw)

**User story:** "Let me mark this up like a printed paper — highlighter, sticky notes, and a pencil to circle/underline/sketch."

**How it works:**
1. Render PDF pages as a canvas-backed viewer (not just `<img>` or native browser PDF embed) so we can layer interactive elements precisely.
2. Three annotation layers, each independently toggleable and exportable:
   - **AI highlight layer** (from Feature 1, read-only unless user overrides)
   - **User highlight/comment layer** — click-drag to highlight any span, attach a sticky-note comment, choose highlight color
   - **Freehand draw layer** — pencil/pen tool with adjustable stroke width/opacity/color, eraser, shape tool (circle/box/arrow) for annotating figures, equations, and diagrams directly (same interaction pattern as Kami, which is the well-established reference implementation for PDF freehand annotation)
3. Each annotation stored as its own object (type, coordinates, page, color, timestamp, author) rather than flattening into the PDF immediately — this keeps annotations editable, undoable, and exportable as structured data (so the chatbot can also be asked "summarize my notes" later).
4. Autosave with debounce (~2s after last edit) plus offline-safe local buffering (IndexedDB) that syncs when back online, so users don't lose annotations mid-flight.
5. Vector tablet / stylus support (pressure-sensitivity optional, Phase 2) for iPad/tablet users who want a natural pencil feel.

### 6.5 Feature 5: Export Engine

**User story:** "Give me one file I can keep — the paper, but with the highlights, my notes, and the diagram baked in."

**How it works:**
1. Server-side render job that:
   - Flattens the AI highlight layer + user highlight/comment layer + freehand drawings onto the original PDF pages (using a PDF manipulation library — see stack)
   - Appends a "Summary & Key Takeaways" page (per-section summaries + jargon glossary generated in Feature 1)
   - Embeds the generated flowchart(s) as a rendered image (SVG→PNG) on a dedicated page
   - Adds a "My Notes" appendix listing all user comments with page references
2. Export formats: **PDF** (primary — most portable, preserves visual fidelity), **Markdown** (summary + notes + diagram as Mermaid code block, good for pasting into Notion/Obsidian), **DOCX** (for users who want to keep editing in Word).
3. Async job queue for export generation (can take a few seconds for long papers); user gets a notification/download link when ready rather than blocking the UI.

### 6.6 Feature 6: "Competitor Features in One Place" Hub

Interpreting this requirement technically: rather than literally re-implementing every competitor's entire feature set (scope explosion risk), Lucid should ship a **lightweight, opt-in module system** where the core five features above are the permanent spine, and the following commonly-requested-elsewhere capabilities are added as modular, toggle-able extensions once core retention is proven:

| Module (inspired by) | Feature | Priority |
|---|---|---|
| SciSpace / Elicit | Literature discovery — find related papers via semantic search | Phase 2 |
| Scholarcy | Auto-generated flashcards from key findings (spaced repetition) | Phase 2 |
| SciSpace | Multi-paper comparison table (methods/results side-by-side) | Phase 2 |
| NotebookLM | Audio "explain this paper to me" narrated overview | Phase 3 |
| SciSpace / Explainpaper | Multi-language translation of summaries/chat | Phase 2 |
| Elicit/Consensus | "What does the field agree on?" cross-paper consensus meter | Phase 3 |
| Zotero/Mendeley | Citation export (BibTeX/RIS) and reference manager sync | Phase 1.5 (low effort, high value) |

This keeps the MVP focused while giving a credible roadmap answer to "what about X competitor's feature."

### 6.7 Other Recommended Features (not explicitly requested, but needed for a competitive product)

- **Equation/figure explainer**: tap any equation or figure to get a plain-language breakdown (both SciSpace and Explainpaper users cite this as a top-used feature)
- **Reading progress + resume**: remember scroll position, highlight-review mode ("show me only what's highlighted") for quick re-review before a meeting/exam
- **Library/workspace**: organize uploaded papers into folders/projects
- **Sharing (read-only link)**: share your annotated paper + notes with a classmate/colleague without giving away your account
- **Privacy mode / local-only processing option** for unpublished/confidential drafts (important since users will upload pre-prints, internal reports, or NDA'd manuscripts — see Section 10 security notes)
- **Accessibility**: dyslexia-friendly font toggle, text-to-speech for section summaries, adjustable contrast (borrowing directly from what users praise in Kami's accessibility toolkit)

---

## 7. System Architecture

### 7.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Web App)                         │
│  React SPA — PDF Canvas Viewer | Annotation Layer | Chat Panel        │
│  | Mermaid.js Diagram Renderer | Export Modal                         │
└───────────────┬───────────────────────────────────┬───────────────────┘
                │ REST/GraphQL + WebSocket           │ Signed asset URLs
                ▼                                     ▼
┌──────────────────────────────┐        ┌────────────────────────────┐
│         API GATEWAY           │        │     OBJECT STORAGE (S3)    │
│  Auth, rate limiting, routing │        │  Original PDFs, exports,   │
└───────────────┬────────────────┘        │  rendered diagrams         │
                │                          └────────────────────────────┘
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                        APPLICATION SERVICES                        │
│ ┌─────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────┐ │
│ │ Document Svc│ │ Annotation Svc│ │  Chat/RAG Svc │ │Export Svc │ │
│ │ (upload,     │ │ (CRUD on      │ │ (retrieval +  │ │(async job │ │
│ │ parse status)│ │ highlights/   │ │  LLM answer   │ │ queue)    │ │
│ │              │ │ comments/draw)│ │  generation)  │ │           │ │
│ └─────────────┘ └───────────────┘ └───────────────┘ └───────────┘ │
└───────────────┬─────────────────────────┬─────────────────────────┘
                │                          │
                ▼                          ▼
┌────────────────────────────┐   ┌─────────────────────────────────┐
│   INGESTION / AI PIPELINE   │   │        DATA LAYER                │
│  (async workers, queue-based)│   │ Postgres (documents, users,      │
│  1. PDF parse + layout       │   │  annotations, jobs metadata)     │
│  2. Section segmentation     │   │ Vector DB (per-doc embeddings)   │
│  3. Salience scoring          │   │ Redis (cache, job queue,        │
│  4. Structure/graph extraction│   │  session state)                 │
│  5. Diagram spec generation   │   └─────────────────────────────────┘
│  6. Embedding + indexing      │
└───────────────┬────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LLM / MODEL LAYER (provider-agnostic)            │
│  Anthropic Claude API (primary) — summarization, structure         │
│  extraction, chat  |  Embedding model (retrieval)                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Why an async pipeline (not synchronous request/response)
Parsing + summarizing + structure-extraction + embedding a 20–40 page paper involves multiple sequential LLM calls. Doing this synchronously in an HTTP request is fragile (timeouts) and gives a bad UX (blank screen). Instead: upload triggers a job → user sees a **progressive reveal** UI (raw PDF appears immediately with a live viewer; highlights fade in per-section as they complete; diagram and chat become available once structure extraction + indexing finish). This also naturally handles retries and partial failures per stage without redoing the whole pipeline.

---

## 8. Tech Stack (Recommendation)

| Layer | Recommendation | Rationale |
|---|---|---|
| Frontend | **React + TypeScript**, Vite build | Ecosystem maturity, component reuse for the complex reading/annotation UI |
| PDF rendering | **PDF.js** (Mozilla) for base rendering + **custom canvas overlay** for highlights/annotations | PDF.js is the most battle-tested open-source PDF renderer with per-page coordinate access needed for precise highlight placement |
| Freehand drawing | **Fabric.js** or **Perfect Freehand** on an HTML canvas layer synced to PDF page coordinates | Purpose-built for vector-based freehand ink with smoothing, resizable/undo-able strokes |
| Diagram rendering | **Mermaid.js** (client-side render of generated flowchart syntax); Graphviz (server-side, via `viz.js` or a Graphviz binary) for complex layouts | Mermaid = editable text-based diagrams that render instantly in-browser; matches the approach used by comparable diagram-AI tools |
| State management | **Zustand** or Redux Toolkit | Lightweight, good fit for the annotation-layer state complexity |
| Backend API | **Node.js (NestJS)** or **Python (FastAPI)** | FastAPI recommended if the team is Python-heavy (simplifies sharing code with the ML pipeline); NestJS if team is JS-heavy |
| Async job queue | **Redis + BullMQ** (Node) or **Celery + Redis/RabbitMQ** (Python) | Needed for the multi-stage ingestion pipeline described in 7.2 |
| Relational DB | **PostgreSQL** | Documents, users, annotation metadata, billing |
| Vector DB | **pgvector** (Postgres extension) for MVP; migrate to **Qdrant/Pinecone/Weaviate** if per-document + cross-corpus search scales up in Phase 2 | pgvector avoids running a second database for v1; revisit once literature-discovery (Phase 2) needs cross-document semantic search at scale |
| Object storage | **AWS S3** (or GCS) | Original PDFs, exported files, cached diagram renders |
| PDF parsing (layout-aware) | **PyMuPDF (fitz)** or **Unstructured.io** for text+bbox extraction; **Grobid** as an option specifically for scholarly-paper structure (it's purpose-built for parsing academic paper sections/references) | Grobid is designed exactly for the IMRaD structure detection needed in Feature 1; combine with PyMuPDF for raw bbox/text extraction |
| OCR fallback | **Tesseract** or a cloud OCR API for scanned/image-based PDFs | Needed since a meaningful share of older/scanned papers aren't text-native |
| LLM provider | **Anthropic Claude API** (e.g., Claude Sonnet for most calls, a lighter/faster model for cheap per-sentence salience scoring, escalate to a stronger model for the structure-extraction/diagram step where accuracy matters most) | Model choice should be per-task, not one-size-fits-all — cheaper/faster models for high-volume low-stakes calls (per-sentence scoring), stronger reasoning models for the harder structural-extraction and chat-grounding tasks |
| Embeddings | **Voyage AI** embeddings (Anthropic's recommended embedding partner) or an open-source alternative (e.g., `bge-large`) | Needed for the RAG retrieval in Feature 3 |
| PDF generation/manipulation (export) | **pdf-lib** (Node) or **PyMuPDF/ReportLab** (Python) | For flattening annotation layers back into an exportable PDF |
| Auth | **Auth0 / Clerk / Supabase Auth** | Avoid building auth from scratch pre-PMF |
| Hosting/infra | **Vercel/Netlify** (frontend) + **AWS/GCP** (backend, workers) or a unified platform like **Render/Fly.io** for MVP simplicity | Optimize for shipping speed pre-PMF over infra sophistication |
| Observability | **Sentry** (errors), **PostHog** (product analytics), structured logs to a hosted log service | Need visibility into where the AI pipeline fails per stage |

---

## 9. AI/ML Pipeline — Deeper Notes

### 9.1 Prompting strategy
- Use **structured output (JSON mode / tool-use style function calling)** for every pipeline stage that feeds another system component (salience scores, section boundaries, diagram graph JSON). Never parse freeform LLM prose for anything the UI depends on programmatically — this is the single biggest reliability lever available.
- Keep prompts **task-narrow**: one prompt for "classify this block into a section type," a separate prompt for "extract the pipeline graph from this Methods text," rather than one mega-prompt trying to do everything — narrower prompts are more reliable and easier to eval/debug independently.

### 9.2 Cost control
LLM calls scale with paper length and are the primary variable cost. Mitigations:
- Cache aggressively: identical papers (by hash/DOI) uploaded by different users should reuse prior processing (subject to privacy settings — see Section 10)
- Use cheaper/faster models for high-frequency, low-complexity calls (sentence salience scoring, jargon detection) and reserve the strongest model for structure-extraction and chat answers
- Batch sentence-level scoring calls per section rather than per sentence

### 9.3 Evaluation
- Maintain a small internal benchmark set of ~30–50 papers across domains (ML, biology, social science, physics) with human-annotated "gold" highlights and method-flow diagrams to regression-test prompt/model changes before shipping
- Track hallucination rate on the chatbot specifically (does it ever answer from outside the paper?) as a first-class metric, not an afterthought

### 9.4 Known hard problems (be honest about these in planning)
- **Non-standard paper structure**: not every paper follows IMRaD (e.g., theory papers, position papers, humanities-adjacent papers). Section classifier needs a graceful fallback to "flat" mode.
- **Diagram fidelity**: current academic research (e.g., work on visual-logical consistency in AI-generated academic diagrams) confirms that LLM-drawn method diagrams can look plausible but misrepresent the actual logic/order of steps. Treat every generated diagram as a **draft the user can and should edit**, not a ground truth — and make the "confidence flag" from Section 6.2 a permanent, not cosmetic, part of the UX.
- **Multi-column/scanned PDFs**: highlight coordinate mapping is the most fragile part of Feature 1; budget real engineering time for this rather than assuming an off-the-shelf parser solves it fully.

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security/Privacy** | Papers may be unpublished drafts, theses, or confidential work — encrypt at rest and in transit; give users a "private/no-cache, no-training-use" toggle; support account-level delete (right to erasure) |
| **Performance** | First-page-visible in <2s after upload; full pipeline (summary+highlights+diagram+chat-ready) target <60s for a 30-page paper |
| **Scalability** | Ingestion pipeline must scale horizontally (stateless workers pulling from queue); vector DB choice should not block a later move to cross-corpus search |
| **Reliability** | Each pipeline stage should be independently retryable; partial success (e.g., summary ready, diagram failed) should still expose what's ready rather than blocking the whole doc |
| **Accessibility** | WCAG 2.1 AA target for core reading UI; keyboard navigation for annotation tools; screen-reader-friendly summary panel |
| **Cost predictability** | Per-document processing cost should be tracked and tied to plan tier (e.g., free tier = shorter papers/month cap, paid = higher/unlimited) |
| **Data portability** | Users can export all their data (annotations, notes) in an open format (JSON/Markdown) at any time — reduces lock-in fear, builds trust |

---

## 11. UI/UX Principles

1. **Reading pane is the hero.** Everything else (summary panel, chat, diagram) is a collapsible sidebar/drawer around the paper — never a modal that blocks the source text.
2. **Progressive disclosure of AI output.** Don't dump a wall of AI text on load; highlights fade in, summary panel starts collapsed with a one-line teaser per section.
3. **Every AI claim is clickable back to source.** Highlights, summaries, chat answers, and diagram nodes all deep-link to the exact spot in the original PDF — this is the trust mechanism that competitor reviews consistently flag as missing ("cross-check every AI answer against the original PDF").
4. **Annotation tools mirror physical intuition.** Highlighter = click-drag; pencil = draw freely; sticky note = click-to-place — no learning curve, borrowing directly from the well-validated Kami/physical-paper mental model.
5. **Minimal chrome, generous whitespace, single accent color** for highlights/interactive elements; avoid the "feature-dense toolbar" complaint leveled at SciSpace and Kami by users overwhelmed by 40+ visible tools.
6. **One primary CTA per screen state**: Upload → Read → (Ask/Annotate) → Export. The export button should always be visible, not buried.

---

## 12. MVP Scope vs. Roadmap

**Phase 1 (MVP, ~10–14 weeks with a small team):**
- Upload PDF/link → section-aware summary + inline auto-highlighting
- Single flowchart generation per paper (Method section only)
- Grounded chatbot with citations
- Highlight/comment/freehand annotation
- PDF export of enriched document
- Core minimalist UI

**Phase 1.5 (fast-follow, low effort/high value):**
- Citation export (BibTeX/RIS)
- Markdown/DOCX export options
- Jargon glossary + equation/figure explainer

**Phase 2 (~3–6 months post-launch):**
- Multi-paper comparison and literature discovery (semantic search)
- Flashcards + spaced repetition
- Translation/multi-language support
- Migrate vector search to a dedicated vector DB if cross-corpus features demand it

**Phase 3 (later):**
- Real-time multi-user collaboration on the same annotated paper
- Audio narrated overviews
- Cross-paper consensus/agreement meter
- Mobile app (tablet-first, for stylus annotation)

---

## 13. Success Metrics (Tech-Adjacent)

- **Time-to-first-highlight** (upload → first visible AI highlight): target <15s
- **Pipeline completion rate**: % of uploaded papers that successfully complete all stages without manual fallback
- **Chatbot grounding accuracy**: sampled human eval of "is every claim traceable to the source text?" — target >95%
- **Diagram acceptance rate**: % of generated diagrams users keep vs. discard/regenerate — proxy for structure-extraction quality
- **Export completion rate**: % of active sessions that end in a download — proxy for the feature actually closing the loop for users

---

## 14. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Diagram generation looks good but is logically wrong (known open research problem) | Confidence flagging, "editable draft" framing, internal eval benchmark (Section 9.3/9.4) |
| Highlight coordinate mapping fails on complex layouts | Prioritize a layout-aware parser, graceful degrade to summary-only mode |
| LLM cost scales faster than revenue | Per-task model tiering, aggressive caching, plan-based usage caps |
| Users upload confidential/unpublished work | Explicit privacy tier, no-training-use guarantee, encryption, clear data policy |
| Feature scope creep (trying to match every competitor feature at once) | Modular "hub" approach (Section 6.6) — core five features first, everything else opt-in and sequenced |

---

## 15. Open Questions for Founder Decision

1. Target wedge audience first: students/newcomers, or also working researchers doing literature review (affects Phase 2 prioritization)?
2. Pricing model: freemium by paper-count/month, or seat-based for teams/labs?
3. Build vs. buy for PDF layout parsing — Grobid self-hosted vs. a managed document-AI API?
4. How aggressive should the "no-training-use, private by default" privacy stance be as a marketing differentiator vs. competitors?

---

*End of document. This PRD is a planning draft — validate architecture assumptions (especially diagram-generation fidelity, Section 9.4) with a technical spike before committing to the full MVP timeline.*
