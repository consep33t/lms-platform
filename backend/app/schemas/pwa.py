from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str

class PushSubscriptionResponse(BaseModel):
    id: int
    user_id: int
    endpoint: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OfflineSyncEvent(BaseModel):
    id: str = Field(..., description="Unique event ID for idempotency")
    type: str = Field(..., description="Type of event: heartbeat, note, quiz_answer, etc.")
    timestamp: datetime
    payload: Dict[str, Any]

class OfflineSyncBatchRequest(BaseModel):
    events: List[OfflineSyncEvent]

class OfflineSyncBatchResponse(BaseModel):
    processed_count: int
    failed_count: int
    errors: Optional[Dict[str, str]] = None

class VapidKeyResponse(BaseModel):
    public_key: str
