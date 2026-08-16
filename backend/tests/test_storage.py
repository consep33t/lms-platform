try:
    import pytest
    async_test = pytest.mark.asyncio
except (ImportError, AttributeError):
    async_test = lambda func: func

import hmac
import hashlib
import time
from app.core.storage.local_driver import LocalDiskStorageBackend


@async_test
async def test_signed_url_generation():

    driver = LocalDiskStorageBackend(
        base_path="/tmp/test_uploads",
        secret_key="my-test-signing-secret",
        public_base_url="http://localhost:8000"
    )
    key = "modules/1/video/sample.mp4"
    signed_url = await driver.get_signed_url(key, expires_in=300)

    assert "http://localhost:8000/files/modules/1/video/sample.mp4" in signed_url
    assert "signature=" in signed_url
    assert "expires=" in signed_url
