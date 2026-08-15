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


class SlideItem(BaseModel):
    id: int
    step_number: int
    step_type: str  # text | image | video | quiz
    title: str
    text_body: str | None = None
    media_file_id: int | None = None
    quiz_group_id: int | None = None
    quiz_weight_percent: float = 0.0
    questions: list[QuestionResponse] = []


class SessionDetailResponse(SessionResponse):
    model_config = ConfigDict(from_attributes=True)

    contents: list[SessionContentResponse] = []
    questions: list[QuestionResponse] = []
    steps: list[SlideItem] = []
    total_steps: int = 0
    total_quizzes: int = 0
    duration_seconds: int = 1800
    remaining_seconds: int = 1800
    is_expired: bool = False
    current_step: int = 1
    completed_percent: float = 0.0
    accumulated_score: float = 0.0
    is_completed: bool = False
