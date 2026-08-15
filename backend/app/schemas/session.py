from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SessionBase(BaseModel):
    title: str
    description: str | None = None
    order: int = 0
    duration_minutes: int = 30


class SessionCreate(SessionBase):
    module_id: int


class SessionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None
    duration_minutes: int | None = None


class SessionResponse(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    created_at: datetime
    updated_at: datetime
