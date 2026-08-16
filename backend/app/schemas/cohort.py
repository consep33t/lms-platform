from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CohortBase(BaseModel):
    name: str
    description: str | None = None


class CohortCreate(CohortBase):
    pass


class CohortUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CohortMemberAdd(BaseModel):
    user_ids: list[int]


class CohortMemberItem(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone_number: str | None = None
    institution: str | None = None
    joined_at: datetime


class ModuleAssignmentCreate(BaseModel):
    module_id: int
    due_date: datetime | None = None


class ModuleAssignmentResponse(BaseModel):
    id: int
    module_id: int
    module_title: str
    cohort_id: int | None = None
    due_date: datetime | None = None
    assigned_by: int
    created_at: datetime


class CohortResponse(CohortBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_count: int = 0
    assignment_count: int = 0
    created_at: datetime
    updated_at: datetime
