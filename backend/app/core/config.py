import os
from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "ApexOps — Motorsport Technology & Intelligence Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment & Reference date (20 October 2026)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    REFERENCE_DATE: str = os.getenv("REFERENCE_DATE", "2026-10-20")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{PROJECT_ROOT}/data/apexops.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "apexops-super-secure-production-ready-jwt-key-32chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # External APIs
    JOLPICA_BASE_URL: str = os.getenv("JOLPICA_BASE_URL", "https://api.jolpi.ca/ergast/f1")
    OPENF1_BASE_URL: str = os.getenv("OPENF1_BASE_URL", "https://api.openf1.org/v1")
    
    # Backups & Cache
    BACKUP_DIR: str = os.getenv("BACKUP_DIR", str(PROJECT_ROOT / "backups"))
    CACHE_DIR: str = os.getenv("CACHE_DIR", str(PROJECT_ROOT / "cache"))
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure required local directories exist
os.makedirs(PROJECT_ROOT / "data", exist_ok=True)
os.makedirs(settings.BACKUP_DIR, exist_ok=True)
os.makedirs(settings.CACHE_DIR, exist_ok=True)
