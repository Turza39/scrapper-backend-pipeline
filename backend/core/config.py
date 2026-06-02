from __future__ import annotations

import os


class Settings:
    API_TITLE: str = os.getenv("API_TITLE", "Structured Data Extraction Engine")
    API_VERSION: str = os.getenv("API_VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    WHISPER_MODEL_NAME: str = os.getenv("WHISPER_MODEL_NAME", "base")


settings = Settings()
