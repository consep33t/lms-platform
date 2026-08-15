from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "LMS Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database (MSSQL)
    DB_SERVER: str
    DB_PORT: int = 1433
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str = "lms_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_DRIVER: str = "local"  # local | s3
    STORAGE_LOCAL_BASE_PATH: str = "/data/uploads"
    STORAGE_PUBLIC_BASE_URL: str = "http://localhost:8000"
    STORAGE_SIGNING_SECRET: str

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
    MAX_IMAGE_SIZE: int = 5 * 1024 * 1024      # 5 MB
    MAX_DOCUMENT_SIZE: int = 20 * 1024 * 1024  # 20 MB
    MAX_VIDEO_SIZE: int = 500 * 1024 * 1024    # 500 MB

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mssql+aioodbc://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"
            "?driver=ODBC+Driver+18+for+SQL+Server"
            "&TrustServerCertificate=yes"
        )


settings = Settings()