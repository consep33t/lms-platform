from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, BigInteger, Enum, Float
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class FileType(str, enum.Enum):
    image = "image"
    video = "video"
    document = "document"
    audio = "audio"


class StorageDriver(str, enum.Enum):
    local = "local"
    s3 = "s3"


class MediaStatus(str, enum.Enum):
    uploading = "uploading"
    processing = "processing"
    ready = "ready"
    failed = "failed"


class OwnerType(str, enum.Enum):
    session_content = "session_content"
    avatar = "avatar"
    module_thumbnail = "module_thumbnail"
    certificate = "certificate"


class MediaFile(Base):
    __tablename__ = "media_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_type: Mapped[OwnerType] = mapped_column(Enum(OwnerType), nullable=False)
    owner_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_type: Mapped[FileType] = mapped_column(Enum(FileType), nullable=False)
    storage_driver: Mapped[StorageDriver] = mapped_column(Enum(StorageDriver), default=StorageDriver.local, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)  # relative path, driver-agnostic
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)  # for video/audio
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)  # for image/video
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)  # for image/video
    thumbnail_key: Mapped[str | None] = mapped_column(String(500), nullable=True)  # for video
    status: Mapped[MediaStatus] = mapped_column(Enum(MediaStatus), default=MediaStatus.uploading, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)