from datetime import datetime
from pydantic import BaseModel, ConfigDict


class QuestionOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False
    order: int = 0


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    option_text: str
    order: int


class QuestionOptionAdminResponse(QuestionOptionResponse):
    is_correct: bool


class QuestionBase(BaseModel):
    question_text: str
    explanation: str | None = None
    points: int = 1
    order: int = 0
    is_reusable: bool = False


class QuestionCreate(QuestionBase):
    session_id: int
    options: list[QuestionOptionCreate]


class QuestionUpdate(BaseModel):
    question_text: str | None = None
    explanation: str | None = None
    points: int | None = None
    order: int | None = None
    is_reusable: bool | None = None


class QuestionResponse(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    options: list[QuestionOptionResponse]
    created_at: datetime
    updated_at: datetime


class QuestionAdminResponse(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    options: list[QuestionOptionAdminResponse]
    created_at: datetime
    updated_at: datetime
