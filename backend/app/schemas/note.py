from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class UserNoteSave(BaseModel):
    session_id: int
    note_title: Optional[str] = None
    note_content: str
    meta_data: dict = {}

class UserNoteResponse(BaseModel):
    id: int
    user_id: int
    session_id: int
    note_title: Optional[str] = None
    note_content: Optional[str] = None
    meta_data: dict = {}
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
