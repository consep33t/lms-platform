from abc import ABC, abstractmethod
from typing import BinaryIO, Optional


class StorageBackend(ABC):
    """Abstract interface for all storage drivers.
    
    All file I/O in the app MUST go through this interface.
    Never call open() or boto3 directly outside this package.
    """

    @abstractmethod
    async def save_stream(self, key: str, file_obj: BinaryIO, chunk_size: int = 1024 * 1024) -> int:
        """Save file via streaming chunks. Returns total bytes written."""

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete file by storage key."""

    @abstractmethod
    async def get_signed_url(self, key: str, expires_in: int = 300) -> str:
        """Generate a temporary signed URL for private file access."""

    @abstractmethod
    def get_absolute_path(self, key: str) -> Optional[str]:
        """Return absolute filesystem path (local driver only, for X-Accel-Redirect)."""

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if file exists in storage."""

    @abstractmethod
    async def generate_presigned_upload_url(self, key: str, content_type: str = "application/octet-stream", expires_in: int = 3600, metadata: dict | None = None) -> dict:
        """Generate a presigned URL for direct client uploads."""

    @abstractmethod
    async def create_multipart_upload(self, key: str, content_type: str = "application/octet-stream") -> str:
        """Initialize a multipart upload and return UploadId."""

    @abstractmethod
    async def generate_presigned_part_url(self, key: str, upload_id: str, part_number: int, expires_in: int = 3600) -> str:
        """Generate a presigned URL for a specific part upload."""

    @abstractmethod
    async def complete_multipart_upload(self, key: str, upload_id: str, parts: list[dict]) -> None:
        """Complete a multipart upload."""

    @abstractmethod
    async def abort_multipart_upload(self, key: str, upload_id: str) -> None:
        """Abort a multipart upload."""

    async def ensure_bucket_exists(self) -> bool:
        """
        Ensure the storage container (bucket/directory) exists.
        Default implementation returns True (no-op for local disk).
        S3 driver overrides this to create the MinIO/S3 bucket.
        """
        return True
