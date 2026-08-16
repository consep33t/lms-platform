from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.module import ModuleStatus
from app.models.progress import ProgressStatus
from app.schemas.session import SessionResponse


class ModuleBase(BaseModel):
    title: str
    description: str | None = None
    status: ModuleStatus = ModuleStatus.draft
    passing_score: float = 70.0
    order: int = 0
    meta_data: dict = {}


class ModuleCreate(ModuleBase):
    thumbnail_media_id: int | None = None


class ModuleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: ModuleStatus | None = None
    thumbnail_media_id: int | None = None
    passing_score: float | None = None
    order: int | None = None
    meta_data: dict | None = None


class ModuleResponse(ModuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thumbnail_media_id: int | None = None
    created_by: int
    created_at: datetime
    updated_at: datetime


class ModuleDetailResponse(ModuleResponse):
    model_config = ConfigDict(from_attributes=True)

    sessions: list[SessionResponse] = []


class SessionProgressStatus(BaseModel):
    session_id: int
    title: str
    order: int
    duration_minutes: int
    is_completed: bool = False
    score: float | None = None


class ModuleUserStatusResponse(BaseModel):
    module_id: int
    is_unlocked: bool
    status: ProgressStatus
    progress_percent: float
    sessions_completed: int
    total_sessions: int
    average_score: float
    certificate_url: str | None = None
    sessions: list[SessionProgressStatus] = []


class ModuleRatingCreate(BaseModel):
    rating: int  # 1 to 5
    comment: str | None = None


class ModuleRatingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    user_id: int
    rating: int
    comment: str | None
    created_at: datetime
