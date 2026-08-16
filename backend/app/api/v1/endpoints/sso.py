from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Any
from app.schemas.sso import (
    SSOProviderCreate,
    SSOProviderResponse,
    SSOLoginInitiateResponse,
    SSOCallbackRequest,
    LDAPSyncResponse
)
from app.services.sso_service import sso_service

router = APIRouter()

@router.get("/providers", response_model=List[SSOProviderResponse])
def get_providers():
    return []

@router.post("/providers", response_model=SSOProviderResponse)
def create_provider(provider: SSOProviderCreate):
    return {
        "id": 1,
        "tenant_id": 1,
        "name": provider.name,
        "type": provider.type,
        "configuration": provider.configuration,
        "attribute_mapping": provider.attribute_mapping,
        "is_active": provider.is_active
    }

@router.get("/login/{provider_id}", response_model=SSOLoginInitiateResponse)
def login_initiate(provider_id: int):
    auth_url = sso_service.generate_auth_url(provider_id)
    return SSOLoginInitiateResponse(auth_url=auth_url)

@router.post("/saml/callback")
def saml_callback(request: SSOCallbackRequest):
    return {"status": "success", "message": "SAML login successful"}

@router.post("/oidc/callback")
def oidc_callback(request: SSOCallbackRequest):
    return {"status": "success", "message": "OIDC login successful"}

@router.post("/ldap/sync/{provider_id}", response_model=LDAPSyncResponse)
def sync_ldap(provider_id: int):
    result = sso_service.sync_ldap_directory(provider_id)
    return LDAPSyncResponse(**result)
