"""
Vercel Python serverless entry point.
Adds the backend directory to sys.path, then re-exports the FastAPI app
so Vercel's ASGI adapter can invoke it.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

from app.main import app  # noqa: E402, F401 — Vercel needs this name at module level
