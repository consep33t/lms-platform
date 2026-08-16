import time
from functools import wraps
from typing import Callable, Any, Optional
from fastapi import Request, HTTPException
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
from app.core.cache import get_redis

# Simple in-memory fallback
_fallback_cache: dict[str, list[float]] = {}

class RateLimitExceeded(HTTPException):
    def __init__(self, detail: str = "Too Many Requests"):
        super().__init__(status_code=HTTP_429_TOO_MANY_REQUESTS, detail=detail)

def rate_limit(limit: int = 60, window: int = 60):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            request: Optional[Request] = kwargs.get("request")
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                return await func(*args, **kwargs)

            client_ip = request.client.host if request.client else "127.0.0.1"
            key = f"rate_limit:{client_ip}:{request.url.path}"
            current_time = time.time()
            
            redis = await get_redis()
            
            if redis:
                # Sliding window using Redis Sorted Set
                async with redis.pipeline(transaction=True) as pipe:
                    pipe.zremrangebyscore(key, 0, current_time - window)
                    pipe.zadd(key, {str(current_time): current_time})
                    pipe.zcard(key)
                    pipe.expire(key, window)
                    results = await pipe.execute()
                    
                request_count = results[2]
                if request_count > limit:
                    raise RateLimitExceeded()
            else:
                # Fallback to in-memory sliding window
                global _fallback_cache
                if key not in _fallback_cache:
                    _fallback_cache[key] = []
                
                _fallback_cache[key] = [ts for ts in _fallback_cache[key] if ts > current_time - window]
                _fallback_cache[key].append(current_time)
                
                if len(_fallback_cache[key]) > limit:
                    raise RateLimitExceeded()

            return await func(*args, **kwargs)
        return wrapper
    return decorator
