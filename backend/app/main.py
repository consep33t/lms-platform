from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.cache import get_redis, close_redis
from app.api.v1.router import api_router


import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ─── Startup ────────────────────────────────────────────────────────────
    logger.info("🚀 LMS Backend starting up...")

    # 1. Redis — graceful degradation already handled inside get_redis()
    redis = await get_redis()
    if redis:
        logger.info("✅ Redis terhubung")
    else:
        logger.warning("⚠️  Redis tidak tersedia — cache dinonaktifkan")

    # 2. Storage — ensure MinIO bucket exists if S3 driver is active
    if settings.STORAGE_DRIVER == "s3":
        from app.core.storage.factory import get_storage_backend
        storage = get_storage_backend()
        bucket_ready = await storage.ensure_bucket_exists()
        if bucket_ready:
            logger.info(f"✅ MinIO bucket '{settings.S3_BUCKET_NAME}' siap")
        else:
            logger.error(f"❌ MinIO bucket '{settings.S3_BUCKET_NAME}' gagal dibuat — upload akan error!")

    yield

    # ─── Shutdown ───────────────────────────────────────────────────────────
    await close_redis()
    logger.info("👋 LMS Backend shutdown selesai")


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}