from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CertificateBase(BaseModel):
    certificate_code: str
    issued_at: datetime
    meta_data: dict = {}


class CertificateListItem(CertificateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    module_title: str
    user_id: int
    user_name: str
    download_url: str


class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_code: str
    student_name: str
    module_title: str
    institution: str | None = None
    issued_at: datetime | None = None
    message: str


class CertificateResponse(CertificateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    module_id: int
    media_file_id: int | None = None
