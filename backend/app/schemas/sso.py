from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, List

class SSOProviderBase(BaseModel):
    name: str
    type: str  # "saml", "oidc", "ldap"
    configuration: Dict[str, Any]
    attribute_mapping: Dict[str, str]
    is_active: bool = True

class SSOProviderCreate(SSOProviderBase):
    pass

class SSOProviderUpdate(BaseModel):
    name: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    attribute_mapping: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class SSOProviderResponse(SSOProviderBase):
    id: int
    tenant_id: int

    class Config:
        from_attributes = True

class SSOLoginInitiateResponse(BaseModel):
    auth_url: HttpUrl

class SSOCallbackRequest(BaseModel):
    # for OIDC or SAML payloads
    payload: Dict[str, Any]

class LDAPSyncResponse(BaseModel):
    users_added: int
    users_updated: int
    users_deactivated: int
    sync_status: str
