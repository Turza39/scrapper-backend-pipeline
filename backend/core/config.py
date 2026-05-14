import os
from typing import Optional

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/extraction_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_TITLE: str = "Data Extraction Engine"
    API_VERSION: str = "0.1.0"
    REQUEST_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    
settings = Settings()
