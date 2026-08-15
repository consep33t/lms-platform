"""S3/MinIO storage driver — dormant by default, activate via STORAGE_DRIVER=s3.

This driver is already wired up and ready. To activate:
1. Set STORAGE_DRIVER=s3 in .env
2. Set S3_ENDPOINT_URL, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME in .env
3. No other code changes needed.
"""
from typing import BinaryIO, Optional

from app.core.storage.base import StorageBackend


class S3StorageBackend(StorageBackend):
    def __init__(
        self,
        endpoint_url: str,
        access_key: str,
        secret_key: str,
        bucket_name: str,
        use_ssl: bool = False,
    ):
        self.endpoint_url = endpoint_url
        self.access_key = access_key
        self.secret_key = secret_key
        self.bucket_name = bucket_name
        self.use_ssl = use_ssl
        self._client = None

    async def _get_client(self):
        if self._client is None:
            try:
                import aioboto3
                session = aioboto3.Session(
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                )
                self._client = session.client(
                    "s3",
                    endpoint_url=self.endpoint_url,
                    use_ssl=self.use_ssl,
                )
            except ImportError:
                raise RuntimeError("aioboto3 not installed. Run: pip install aioboto3")
        return self._client

    async def save_stream(self, key: str, file_obj: BinaryIO, chunk_size: int = 1024 * 1024) -> int:
        client = await self._get_client()
        async with client as s3:
            # Stream multipart upload
            mpu = await s3.create_multipart_upload(Bucket=self.bucket_name, Key=key)
            parts = []
            part_number = 1
            total = 0
            while True:
                chunk = await file_obj.read(chunk_size)
                if not chunk:
                    break
                resp = await s3.upload_part(
                    Bucket=self.bucket_name,
                    Key=key,
                    PartNumber=part_number,
                    UploadId=mpu["UploadId"],
                    Body=chunk,
                )
                parts.append({"PartNumber": part_number, "ETag": resp["ETag"]})
                total += len(chunk)
                part_number += 1
            await s3.complete_multipart_upload(
                Bucket=self.bucket_name,
                Key=key,
                UploadId=mpu["UploadId"],
                MultipartUpload={"Parts": parts},
            )
        return total

    async def delete(self, key: str) -> None:
        client = await self._get_client()
        async with client as s3:
            await s3.delete_object(Bucket=self.bucket_name, Key=key)

    async def get_signed_url(self, key: str, expires_in: int = 300) -> str:
        client = await self._get_client()
        async with client as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in,
            )

    def get_absolute_path(self, key: str) -> Optional[str]:
        return None  # Not applicable for S3

    async def exists(self, key: str) -> bool:
        client = await self._get_client()
        try:
            async with client as s3:
                await s3.head_object(Bucket=self.bucket_name, Key=key)
                return True
        except Exception:
            return False