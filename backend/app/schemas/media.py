from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.media import FileType, MediaStatus, OwnerType, StorageDriver


class MediaUploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_type: OwnerType
    file_type: FileType
    storage_driver: StorageDriver
    storage_key: str
    original_name: str
    mime_type: str
    size_bytes: int
    status: MediaStatus
    url: str | None = None
    created_at: datetime


class SignedUrlResponse(BaseModel):
    media_id: int
    signed_url: str
    expires_in_seconds: int
