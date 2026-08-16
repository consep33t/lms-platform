import logging
from typing import Optional
from redis.asyncio import Redis, from_url
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: Optional[Redis] = None

# Default TTL values (in seconds)
CACHE_TTL_SHORT = 60          # 1 minute - hot data
CACHE_TTL_MEDIUM = 300        # 5 minutes - session data
CACHE_TTL_LONG = 3600         # 1 hour - semi-static data
CACHE_TTL_DAY = 86400         # 24 hours - slow-changing data


async def get_redis() -> Optional[Redis]:
    """Return a Redis connection, or None if Redis is unavailable (graceful degradation)."""
    global _redis
    try:
        if _redis is None:
            _redis = from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=False,
            )
        # Quick ping to verify connection is alive
        await _redis.ping()
        return _redis
    except Exception as e:
        logger.warning(f"[Cache] Redis tidak tersedia, melanjutkan tanpa cache: {e}")
        _redis = None
        return None


async def cache_get(key: str) -> Optional[str]:
    """Get a cached value. Returns None if Redis is down or key missing."""
    redis = await get_redis()
    if redis is None:
        return None
    try:
        return await redis.get(key)
    except Exception as e:
        logger.warning(f"[Cache] cache_get error untuk key '{key}': {e}")
        return None


async def cache_set(key: str, value: str, ttl: int = CACHE_TTL_MEDIUM) -> bool:
    """Set a cached value with TTL. Returns False if Redis is down."""
    redis = await get_redis()
    if redis is None:
        return False
    try:
        await redis.set(key, value, ex=ttl)
        return True
    except Exception as e:
        logger.warning(f"[Cache] cache_set error untuk key '{key}': {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete a cached key. Returns False if Redis is down."""
    redis = await get_redis()
    if redis is None:
        return False
    try:
        await redis.delete(key)
        return True
    except Exception as e:
        logger.warning(f"[Cache] cache_delete error untuk key '{key}': {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching a pattern. Returns count deleted."""
    redis = await get_redis()
    if redis is None:
        return 0
    try:
        keys = await redis.keys(pattern)
        if keys:
            return await redis.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"[Cache] cache_delete_pattern error untuk pattern '{pattern}': {e}")
        return 0


async def close_redis() -> None:
    global _redis
    if _redis:
        try:
            await _redis.close()
        except Exception:
            pass
        _redis = None