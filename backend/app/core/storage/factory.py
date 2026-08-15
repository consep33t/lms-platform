from functools import lru_cache
from app.core.storage.base import StorageBackend


@lru_cache(maxsize=1)
def get_storage_backend() -> StorageBackend:
    """Factory — returns the configured storage driver based on STORAGE_DRIVER env.
    
    Single instance cached for app lifetime.
    """
    from app.core.config import settings

    driver = settings.STORAGE_DRIVER.lower()

    if driver == "local":
        from app.core.storage.local_driver import LocalDiskStorageBackend
        return LocalDiskStorageBackend(
            base_path=settings.STORAGE_LOCAL_BASE_PATH,
            secret_key=settings.STORAGE_SIGNING_SECRET,
            public_base_url=settings.STORAGE_PUBLIC_BASE_URL,
        )
    elif driver == "s3":
        from app.core.storage.s3_driver import S3StorageBackend
        return S3StorageBackend(
            endpoint_url=settings.S3_ENDPOINT_URL,
            access_key=settings.S3_ACCESS_KEY,
            secret_key=settings.S3_SECRET_KEY,
            bucket_name=settings.S3_BUCKET_NAME,
            use_ssl=settings.S3_USE_SSL,
        )
    else:
        raise ValueError(f"Unknown STORAGE_DRIVER: {driver!r}. Use 'local' or 's3'.")