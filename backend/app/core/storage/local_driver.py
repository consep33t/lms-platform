import asyncio
import hashlib
import hmac
import os
import time
from typing import BinaryIO, Optional
from urllib.parse import urlencode

from app.core.storage.base import StorageBackend


class LocalDiskStorageBackend(StorageBackend):
    """Default storage driver — saves files to local disk.
    
    Files are served via Nginx X-Accel-Redirect for efficiency.
    Python only verifies signatures, Nginx streams bytes.
    """

    def __init__(self, base_path: str, secret_key: str, public_base_url: str):
        self.base_path = base_path
        self.secret_key = secret_key
        self.public_base_url = public_base_url.rstrip("/")

    def _resolve_path(self, key: str) -> str:
        base = os.path.abspath(self.base_path)
        full_path = os.path.abspath(os.path.join(base, key))
        if os.path.commonpath([base, full_path]) != base:
            raise ValueError("Path traversal attempt detected")
        return full_path

    async def save_stream(self, key: str, file_obj: BinaryIO, chunk_size: int = 1024 * 1024) -> int:
        """Stream file to disk chunk by chunk — avoids loading large videos into RAM."""
        full_path = self._resolve_path(key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        total = 0
        loop = asyncio.get_event_loop()
        with open(full_path, "wb") as out:
            while True:
                chunk = await file_obj.read(chunk_size)
                if not chunk:
                    break
                await loop.run_in_executor(None, out.write, chunk)
                total += len(chunk)
        os.chmod(full_path, 0o644)
        return total

    async def delete(self, key: str) -> None:
        full_path = self._resolve_path(key)
        if os.path.exists(full_path):
            await asyncio.get_event_loop().run_in_executor(None, os.remove, full_path)

    async def get_signed_url(self, key: str, expires_in: int = 300) -> str:
        expires = int(time.time()) + expires_in
        signature = hmac.new(
            self.secret_key.encode(),
            f"{key}:{expires}".encode(),
            hashlib.sha256
        ).hexdigest()
        query = urlencode({"expires": expires, "signature": signature})
        return f"{self.public_base_url}/files/{key}?{query}"

    def get_absolute_path(self, key: str) -> Optional[str]:
        return self._resolve_path(key)

    async def exists(self, key: str) -> bool:
        return os.path.exists(self._resolve_path(key))

    async def generate_presigned_upload_url(self, key: str, content_type: str = "application/octet-stream", expires_in: int = 3600, metadata: dict | None = None) -> dict:
        expires = int(time.time()) + expires_in
        signature = hmac.new(
            self.secret_key.encode(),
            f"upload:{key}:{expires}".encode(),
            hashlib.sha256
        ).hexdigest()
        query = urlencode({"expires": expires, "signature": signature})
        return {
            "url": f"{self.public_base_url}/upload/{key}?{query}",
            "method": "PUT",
            "headers": {"Content-Type": content_type}
        }

    async def create_multipart_upload(self, key: str, content_type: str = "application/octet-stream") -> str:
        return f"local-upload-{key}-{int(time.time())}"

    async def generate_presigned_part_url(self, key: str, upload_id: str, part_number: int, expires_in: int = 3600) -> str:
        expires = int(time.time()) + expires_in
        signature = hmac.new(
            self.secret_key.encode(),
            f"upload_part:{upload_id}:{part_number}:{expires}".encode(),
            hashlib.sha256
        ).hexdigest()
        query = urlencode({"expires": expires, "signature": signature})
        return f"{self.public_base_url}/upload/{key}/parts/{part_number}?upload_id={upload_id}&{query}"

    async def complete_multipart_upload(self, key: str, upload_id: str, parts: list[dict]) -> None:
        pass

    async def abort_multipart_upload(self, key: str, upload_id: str) -> None:
        pass