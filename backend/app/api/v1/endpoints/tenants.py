from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.tenant import TenantCreate, TenantResponse, TenantBrandingResponse, TenantUserAssignRequest, TenantUpdate
from app.services.tenant_service import tenant_service
from app.core.tenant_middleware import get_current_tenant

router = APIRouter()

@router.get("/current", response_model=Dict[str, Any])
async def get_current_tenant_info():
    tenant_id = get_current_tenant()
    if not tenant_id:
        raise HTTPException(status_code=404, detail="No tenant identified")
    return {"tenant": tenant_id}

@router.get("", response_model=List[Dict[str, Any]])
async def list_tenants(skip: int = 0, limit: int = 100):
    return await tenant_service.list_tenants(skip=skip, limit=limit)

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_tenant(tenant_in: TenantCreate):
    return await tenant_service.create_tenant(tenant_in)

@router.put("/{id}/branding", response_model=TenantBrandingResponse)
async def update_tenant_branding(id: str, branding: TenantBrandingResponse):
    return await tenant_service.update_tenant_branding(id, branding.model_dump())

@router.post("/{id}/users", response_model=Dict[str, Any])
async def assign_user(id: str, request: TenantUserAssignRequest):
    return await tenant_service.assign_user(id, request)
