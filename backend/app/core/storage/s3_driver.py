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
            upload_id: str | None = None
            parts = []
            part_number = 1
            total = 0
            try:
                mpu = await s3.create_multipart_upload(Bucket=self.bucket_name, Key=key)
                upload_id = mpu["UploadId"]  # Only set after successful create

                while True:
                    chunk = await file_obj.read(chunk_size)
                    if not chunk:
                        break
                    resp = await s3.upload_part(
                        Bucket=self.bucket_name,
                        Key=key,
                        PartNumber=part_number,
                        UploadId=upload_id,
                        Body=chunk,
                    )
                    parts.append({"PartNumber": part_number, "ETag": resp["ETag"]})
                    total += len(chunk)
                    part_number += 1

                await s3.complete_multipart_upload(
                    Bucket=self.bucket_name,
                    Key=key,
                    UploadId=upload_id,
                    MultipartUpload={"Parts": parts},
                )
            except Exception:
                # FIX: Only abort if create_multipart_upload succeeded (upload_id is set)
                if upload_id is not None:
                    try:
                        await s3.abort_multipart_upload(
                            Bucket=self.bucket_name,
                            Key=key,
                            UploadId=upload_id,
                        )
                    except Exception:
                        pass  # Abort failure should not mask original error
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

    async def ensure_bucket_exists(self) -> bool:
        """
        Create the bucket if it does not already exist.
        Safe to call multiple times (idempotent).
        Returns True if bucket is ready, False if check/create failed.
        """
        session = self._get_session()
        try:
            async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
                try:
                    await s3.head_bucket(Bucket=self.bucket_name)
                    return True  # Bucket already exists
                except Exception:
                    pass
                # Bucket does not exist — create it
                try:
                    await s3.create_bucket(Bucket=self.bucket_name)
                    # Configure CORS for resumable streaming and uploads
                    cors_configuration = {
                        'CORSRules': [{
                            'AllowedHeaders': ['*'],
                            'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                            'AllowedOrigins': ['*'],
                            'ExposeHeaders': ['ETag', 'Content-Range', 'Accept-Ranges', 'Content-Length'],
                            'MaxAgeSeconds': 3000
                        }]
                    }
                    await s3.put_bucket_cors(Bucket=self.bucket_name, CORSConfiguration=cors_configuration)
                    return True
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(
                        f"[S3] Gagal membuat bucket '{self.bucket_name}': {e}"
                    )
                    return False
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                f"[S3] ensure_bucket_exists gagal terhubung ke endpoint: {e}"
            )
            return False

    async def generate_presigned_upload_url(self, key: str, content_type: str = "application/octet-stream", expires_in: int = 3600, metadata: dict | None = None) -> dict:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            params = {"Bucket": self.bucket_name, "Key": key, "ContentType": content_type}
            if metadata:
                params["Metadata"] = metadata
            url = await s3.generate_presigned_url(
                "put_object",
                Params=params,
                ExpiresIn=expires_in,
            )
            return {"url": url, "method": "PUT", "headers": {"Content-Type": content_type}}

    async def create_multipart_upload(self, key: str, content_type: str = "application/octet-stream") -> str:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            resp = await s3.create_multipart_upload(
                Bucket=self.bucket_name, Key=key, ContentType=content_type
            )
            return resp["UploadId"]

    async def generate_presigned_part_url(self, key: str, upload_id: str, part_number: int, expires_in: int = 3600) -> str:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            return await s3.generate_presigned_url(
                "upload_part",
                Params={"Bucket": self.bucket_name, "Key": key, "UploadId": upload_id, "PartNumber": part_number},
                ExpiresIn=expires_in,
            )

    async def complete_multipart_upload(self, key: str, upload_id: str, parts: list[dict]) -> None:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            await s3.complete_multipart_upload(
                Bucket=self.bucket_name,
                Key=key,
                UploadId=upload_id,
                MultipartUpload={"Parts": parts},
            )

    async def abort_multipart_upload(self, key: str, upload_id: str) -> None:
        session = self._get_session()
        async with session.client("s3", endpoint_url=self.endpoint_url, use_ssl=self.use_ssl) as s3:
            await s3.abort_multipart_upload(
                Bucket=self.bucket_name, Key=key, UploadId=upload_id
            )

