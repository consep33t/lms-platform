from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.progress import ProgressStatus, FlagType


class WatchProgressRequest(BaseModel):
    session_progress_id: int | None = None
    session_id: int | None = None
    watched_percent: float
    is_completed: bool = False


class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: int


class QuestionFeedback(BaseModel):
    question_id: int
    selected_option_id: int
    is_correct: bool
    correct_option_id: int | None = None
    explanation: str | None = None


class SessionSubmitRequest(BaseModel):
    session_progress_id: int | None = None
    session_id: int | None = None
    answers: list[AnswerSubmit]
    time_spent_seconds: int = 0


class SessionSubmitResponse(BaseModel):
    session_id: int
    session_progress_id: int
    status: ProgressStatus
    score: float
    passed: bool
    correct_count: int
    total_questions: int
    feedback: list[QuestionFeedback] = []


class SessionProgressResponse(BaseModel):
    session_id: int
    is_unlocked: bool
    is_completed: bool
    score: float | None = None
    status: ProgressStatus | None = None


class UserModuleProgressItem(BaseModel):
    module_id: int
    module_title: str
    status: ProgressStatus
    progress_percent: float
    sessions_completed: int
    total_sessions: int
    average_score: float
    certificate_url: str | None = None


class SessionFlagCreate(BaseModel):
    session_progress_id: int
    flag_type: FlagType
