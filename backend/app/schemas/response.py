from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: Optional[T] = None
    meta: Optional[dict] = None
    error: Optional[dict] = None
