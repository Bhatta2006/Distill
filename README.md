# Lucid — AI Research Paper Companion

Turn dense research papers into something you can actually understand.

## Features

| Feature | How |
|---|---|
| **Auto-highlights** | AI marks the most important sentences *inside* the original PDF |
| **Method diagram** | Mermaid.js flowchart generated from the Methods section |
| **Grounded chat** | RAG chatbot — cites exact pages, never hallucinates outside the paper |
| **Annotation** | Highlight, sticky comment, freehand-draw on the PDF |
| **Export** | PDF (highlights baked in) · Markdown · DOCX |

---

## Deploy to Vercel (recommended)

### 1. Fork / clone the repo and import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → import `Bhatta2006/Distill`
2. Vercel auto-detects the `vercel.json` — no framework preset needed

### 2. Set environment variables in Vercel dashboard

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (see below) |
| `USE_CELERY` | `false` |
| `EMBEDDING_PROVIDER` | `voyage` |
| `VOYAGE_API_KEY` | From [dash.voyageai.com](https://dash.voyageai.com) (free tier) |
| `STORAGE_PATH` | `/tmp/lucid-uploads` |
| `FRONTEND_URL` | Your Vercel deployment URL e.g. `https://distill.vercel.app` |

### 3. Set up Neon Postgres

1. Create a free project at [neon.tech](https://neon.tech)
2. Enable the `pgvector` extension: `CREATE EXTENSION vector;`
3. Copy the **pooled** connection string into `DATABASE_URL`

### 4. Deploy

Vercel deploys automatically on every push to `main`.

> **API key**: Lucid prompts users for their Anthropic key on first open. It's stored in their browser's `localStorage` — never sent to your server.

---

## Run locally with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

---

## Run locally without Docker

```bash
# Start Postgres + Redis
docker-compose up db redis -d

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Celery worker (separate terminal)
celery -A app.workers.celery_app worker --loglevel=info

# Frontend
cd frontend
npm install && npm run dev
```

---

## Architecture

```
frontend (React + Vite + Tailwind)
  ├── PDF.js — renders PDF pages on canvas with bounding-box highlight overlay
  ├── Mermaid.js — renders AI-generated method flowcharts client-side
  ├── Zustand — document state, annotations, API key (localStorage-persisted)
  └── Polling / WebSocket — real-time processing progress

backend (FastAPI + Python)
  ├── Ingestion pipeline: parse → segment → summarize → diagram → embed
  │   Docker: Celery worker   |   Vercel: FastAPI BackgroundTasks
  ├── PyMuPDF — layout-aware PDF parsing with bounding-box coordinates
  ├── Sentence-transformers (Docker) / Voyage AI (Vercel) — embeddings for RAG
  └── Anthropic Claude — summaries, salience scoring, diagram extraction, chat

data
  ├── PostgreSQL + pgvector — documents, annotations, RAG chunks + embeddings
  ├── Redis — Celery queue (Docker only)
  └── /tmp or local path — uploaded PDFs and exports
```

## Processing pipeline

```
Upload PDF
  → parse (PyMuPDF, bounding boxes)
  → segment (IMRaD section detection)
  → summarize + highlight (LLM salience scoring)
  → diagram (JSON graph → Mermaid.js)
  → embed (sentence-transformers / Voyage AI → pgvector)
  → ready ✓
```

Progress streams in real-time via WebSocket (Docker) or 3-second polling (Vercel).

---

## Anthropic API key

On first open, Lucid shows a modal prompting for your `sk-ant-...` key.  
Stored in browser `localStorage` → sent as `X-API-Key` header → used only for Claude API calls.

Voyage AI key (`pa-...`) is optional and only needed for Vercel deployment (handles embeddings server-side without PyTorch).
