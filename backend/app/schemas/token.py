from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TokenGenerateRequest(BaseModel):
    module_id: int
    token_code: str | None = None  # if None, auto generate random 8 chars
    max_uses: int = 1  # 0 for unlimited
    expired_at: datetime


class TokenBulkGenerateRequest(BaseModel):
    module_id: int
    count: int = 1
    max_uses: int = 100
    days_valid: int = 30


class TokenVerifyRequest(BaseModel):
    token: str
    module_id: int | None = None


class TokenVerifyResponse(BaseModel):
    valid: bool
    module_id: int | None = None
    module_title: str | None = None
    message: str


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    token_code: str
    max_uses: int
    current_uses: int
    expired_at: datetime
    is_active: bool
    created_by: int
    created_at: datetime
