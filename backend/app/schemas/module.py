from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.module import ModuleStatus
from app.schemas.session import SessionResponse


class ModuleBase(BaseModel):
    title: str
    description: str | None = None
    status: ModuleStatus = ModuleStatus.draft
    passing_score: float = 70.0
    order: int = 0


class ModuleCreate(ModuleBase):
    thumbnail_media_id: int | None = None


class ModuleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: ModuleStatus | None = None
    thumbnail_media_id: int | None = None
    passing_score: float | None = None
    order: int | None = None


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
