from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class StudyRoomBase(BaseModel):
    title: str
    topic: Optional[str] = None
    max_participants: int = 20
    is_active: bool = True
    cohort_id: Optional[int] = None
    module_id: Optional[int] = None

class StudyRoomCreate(StudyRoomBase):
    pass

class StudyRoomResponse(StudyRoomBase):
    id: int
    created_by: int
    meta_data: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class StudyRoomListResponse(BaseModel):
    items: List[StudyRoomResponse]
    total: int

class StudyRoomMessageBase(BaseModel):
    message_text: str
    message_type: str = "chat"

class StudyRoomMessageCreate(StudyRoomMessageBase):
    room_id: int

class StudyRoomMessageResponse(StudyRoomMessageBase):
    id: int
    room_id: int
    user_id: int
    meta_data: Dict[str, Any] = {}
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
