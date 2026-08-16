from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional, Any
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "LMS Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "insecure_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "https://lms.consep33t.my.id"

    # Database (MSSQL)
    DB_SERVER: str = "localhost"
    DB_PORT: int = 1433
    DB_USER: str = "sa"
    DB_PASSWORD: str = "secret"
    DB_NAME: str = "lms_db"


    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_DRIVER: str = "local"  # local | s3
    STORAGE_LOCAL_BASE_PATH: str = "/data/uploads"
    STORAGE_PUBLIC_BASE_URL: str = "http://localhost:8000"
    STORAGE_SIGNING_SECRET: str = "storage_signing_secret_key"

    # S3/MinIO (optional)
    S3_ENDPOINT_URL: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    S3_USE_SSL: bool = False

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Upload limits (bytes)
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024     # 10 MB
    MAX_DOCUMENT_SIZE: int = 50 * 1024 * 1024  # 50 MB
    MAX_VIDEO_SIZE: int = 1024 * 1024 * 1024   # 1 GB

    # WhatsApp Gateway Integration
    WA_GATEWAY_URL: str = "http://192.168.10.100:3333"  # or http://localhost:3333
    WA_GATEWAY_ENABLED: bool = True

    # Email Gateway (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@lms.consep33t.my.id"
    SMTP_FROM_NAME: str = "LMS Enterprise Academy"
    EMAILS_ENABLED: bool = True

    # Google OAuth2
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://lms.consep33t.my.id"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, set)):
            return list(v)
        return ["http://localhost:5173", "https://lms.consep33t.my.id", "http://localhost:3000"]

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mssql+aioodbc://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"
            "?driver=ODBC+Driver+18+for+SQL+Server"
            "&TrustServerCertificate=yes"
        )


settings = Settings()