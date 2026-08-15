from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.content import ContentType
from app.schemas.question import QuestionResponse


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


class SessionContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    order: int
    content_type: ContentType
    text_body: str | None = None
    media_file_id: int | None = None
    created_at: datetime


class SessionResponse(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    created_at: datetime
    updated_at: datetime


class SessionDetailResponse(SessionResponse):
    model_config = ConfigDict(from_attributes=True)

    contents: list[SessionContentResponse] = []
    questions: list[QuestionResponse] = []
