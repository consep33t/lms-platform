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