from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.progress import ProgressStatus, FlagType


class WatchProgressRequest(BaseModel):
    session_progress_id: int
    watched_percent: float
    is_completed: bool = False


class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: int


class SessionSubmitRequest(BaseModel):
    session_progress_id: int
    answers: list[AnswerSubmit]
    time_spent_seconds: int = 0


class SessionSubmitResponse(BaseModel):
    session_progress_id: int
    status: ProgressStatus
    score: float
    passed: bool
    correct_count: int
    total_questions: int


class SessionFlagCreate(BaseModel):
    session_progress_id: int
    flag_type: FlagType
