from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.user
    is_active: bool = True
    meta_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("meta_data", mode="before")
    @classmethod
    def validate_meta_data(cls, v: Any) -> dict:
        if v is None:
            return {}
        if isinstance(v, dict):
            return v
        return {}


class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.user


class StudentRegisterRequest(BaseModel):
    full_name: str
    email: str  # Personal email (e.g. user@gmail.com)
    password: str
    phone_number: str | None = None
    institution: str | None = None


class GoogleRegisterRequest(BaseModel):
    email: str
    full_name: str
    google_id: str | None = None
    avatar_url: str | None = None
    institution: str | None = None


class StudentRegistrationResponse(BaseModel):
    id: int
    full_name: str
    personal_email: str
    custom_lms_email: str
    approval_status: str
    message: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    institution: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None
    avatar_media_id: int | None = None
    meta_data: dict | None = None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserRejectRequest(BaseModel):
    rejection_reason: str = "Data pendaftaran tidak memenuhi kriteria verifikasi."


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personal_email: Optional[str] = None
    custom_lms_email: Optional[str] = None
    is_approved: Optional[bool] = True
    approval_status: Optional[str] = "approved"
    registration_source: Optional[str] = "manual"
    phone_number: Optional[str] = None
    institution: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_at: Optional[datetime] = None
    avatar_media_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LastActiveSession(BaseModel):
    session_id: int
    session_title: str
    module_id: int
    module_title: str
    current_step: int
    total_steps: int
    progress_percent: float


class UpcomingDeadlineItem(BaseModel):
    cohort_id: int
    cohort_name: str
    module_id: int
    module_title: str
    due_date: datetime
    days_left: int


class UserDashboardResponse(BaseModel):
    total_enrolled: int
    total_completed: int
    total_certificates: int
    average_score: float
    last_active_session: LastActiveSession | None = None
    upcoming_deadlines: list[UpcomingDeadlineItem] = []
    recent_certificates_count: int = 0
