from pydantic import BaseModel, HttpUrl, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    slug: str = Field(..., pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    domain: Optional[str] = None
    is_active: bool = True

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    domain: Optional[str] = None
    is_active: Optional[bool] = None

class TenantResponse(TenantBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TenantBrandingResponse(BaseModel):
    primary_color: str = Field(..., pattern=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
    secondary_color: str = Field(..., pattern=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

class TenantUserAssignRequest(BaseModel):
    user_id: str
    role: str = "user"
