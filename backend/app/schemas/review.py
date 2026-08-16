from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict

class ModuleReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ModuleReviewCreate(ModuleReviewBase):
    module_id: UUID

class ModuleReviewResponse(ModuleReviewBase):
    id: UUID
    user_id: UUID
    module_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ModuleRatingSummaryResponse(BaseModel):
    module_id: UUID
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[int, int]
    
    model_config = ConfigDict(from_attributes=True)
