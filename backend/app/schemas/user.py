from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.user
    is_active: bool = True


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
    is_active: bool | None = None
    role: UserRole | None = None
    avatar_media_id: int | None = None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserRejectRequest(BaseModel):
    rejection_reason: str = "Data pendaftaran tidak memenuhi kriteria verifikasi."


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personal_email: str | None = None
    custom_lms_email: str | None = None
    is_approved: bool = True
    approval_status: str = "approved"
    registration_source: str = "manual"
    phone_number: str | None = None
    institution: str | None = None
    rejection_reason: str | None = None
    approved_at: datetime | None = None
    avatar_media_id: int | None = None
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
