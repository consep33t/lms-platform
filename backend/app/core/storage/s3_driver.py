import asyncio
from typing import BinaryIO, Optional
from app.core.storage.base import StorageBackend


class S3StorageBackend(StorageBackend):
    """Production S3 / MinIO storage driver with streaming and presigned URLs.
    
    Compatible with AWS S3, MinIO, Cloudflare R2, and Ceph.
    """

    def __init__(
        self,
        endpoint_url: str | None,
        access_key: str | None,
        secret_key: str | None,
        bucket_name: str | None,
        use_ssl: bool = False,
    ):
        self.endpoint_url = endpoint_url
        self.access_key = access_key
        self.secret_key = secret_key
        self.bucket_name = bucket_name or "lms"
        self.use_ssl = use_ssl

    def _get_session(self):
        try:
            import aioboto3
            return aioboto3.Session(
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
            )
        except ImportError:
            raise RuntimeError("aioboto3 tidak terpasang. Jalankan: pip install aioboto3")

    async def save_stream(self, key: str, file_obj: BinaryIO, chunk_size: int = 1024 * 1024) -> int:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            mpu = await s3.create_multipart_upload(Bucket=self.bucket_name, Key=key)
            parts = []
            part_number = 1
            total = 0
            try:
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
            except Exception:
                await s3.abort_multipart_upload(
                    Bucket=self.bucket_name,
                    Key=key,
                    UploadId=mpu["UploadId"],
                )
                raise
        return total

    async def delete(self, key: str) -> None:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            await s3.delete_object(Bucket=self.bucket_name, Key=key)

    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in,
            )

    def get_absolute_path(self, key: str) -> Optional[str]:
        return None

    async def exists(self, key: str) -> bool:
        session = self._get_session()
        try:
            async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
                await s3.head_object(Bucket=self.bucket_name, Key=key)
                return True
        except Exception:
            return False
