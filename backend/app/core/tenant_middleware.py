import contextvars
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

current_tenant = contextvars.ContextVar("current_tenant", default=None)

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID")
        
        if not tenant_id:
            host = request.headers.get("Host", "")
            if host:
                parts = host.split(".")
                if len(parts) > 2:
                    tenant_id = parts[0]
                    
        token = current_tenant.set(tenant_id)
        
        try:
            response = await call_next(request)
            return response
        finally:
            current_tenant.reset(token)

def get_current_tenant() -> str | None:
    return current_tenant.get()
