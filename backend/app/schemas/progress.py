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


class SessionSubmitRequest(BaseModel):
    session_progress_id: int | None = None
    session_id: int | None = None
    answers: list[AnswerSubmit]
    time_spent_seconds: int = 0
    current_step: int | None = None


class SessionSubmitResponse(BaseModel):
    session_id: int
    session_progress_id: int
    status: ProgressStatus
    score: float
    passed: bool
    correct_count: int
    total_questions: int
    feedback: list[QuestionFeedback] = []
    completed_percent: float = 100.0


class QuizStepSubmitRequest(BaseModel):
    quiz_group_id: int = 1
    answers: list[AnswerSubmit]
    time_spent_seconds: int = 0
    current_step: int = 1


class QuizStepSubmitResponse(BaseModel):
    quiz_group_id: int
    step_correct_count: int
    step_total_questions: int
    step_score_earned: float
    step_weight_percent: float
    total_accumulated_score: float
    completed_percent: float


class SessionTimeoutRequest(BaseModel):
    current_step: int
    total_steps: int
    time_spent_seconds: int


class SessionTimeoutResponse(BaseModel):
    session_id: int
    status: ProgressStatus
    completed_percent: float
    final_score: float
    message: str


class SessionProgressResponse(BaseModel):
    session_id: int
    is_unlocked: bool
    is_completed: bool
    score: float | None = None
    status: ProgressStatus | None = None
    remaining_seconds: int = 1800
    is_expired: bool = False
    completed_percent: float = 0.0


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
