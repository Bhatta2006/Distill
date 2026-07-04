from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://lucid:lucid@localhost:5432/lucid"
    redis_url: str = "redis://localhost:6379/0"
    storage_path: str = "./data/uploads"
    max_upload_mb: int = 50

    # Deployment mode
    use_celery: bool = True          # False on Vercel (BackgroundTasks instead)
    frontend_url: str = ""           # Set in Vercel env for CORS

    # Embeddings
    # "local"  — sentence-transformers, runs in-process (Docker only)
    # "voyage" — Voyage AI API, required for Vercel (no PyTorch budget)
    embedding_provider: str = "local"
    embedding_model: str = "all-MiniLM-L6-v2"  # used when provider=local
    voyage_api_key: str = ""                     # used when provider=voyage

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
