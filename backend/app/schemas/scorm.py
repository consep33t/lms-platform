from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class ScormPackageResponse(BaseModel):
    id: UUID
    title: str
    manifest_data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScormTrackingSyncRequest(BaseModel):
    cmi_data: Dict[str, Any]

class ScormTrackingResponse(BaseModel):
    id: UUID
    user_id: UUID
    package_id: UUID
    cmi_data: Dict[str, Any]
    progress: float
    completion_status: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class XAPIStatementCreate(BaseModel):
    actor: Dict[str, Any]
    verb: Dict[str, Any]
    object: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

class XAPIStatementResponse(BaseModel):
    id: UUID
    statement_data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
