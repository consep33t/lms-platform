from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class BadgeResponse(BaseModel):
    id: int
    code: str
    title: str
    description: Optional[str] = None
    icon_media_id: Optional[int] = None
    xp_reward: int = 50
    criteria_type: str = "completion"
    meta_data: dict = {}
    
    model_config = ConfigDict(from_attributes=True)

class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    badge: Optional[BadgeResponse] = None
    unlocked_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserXPResponse(BaseModel):
    user_id: int
    total_xp: int
    level: int = 1
    next_level_xp: int = 100
    
    model_config = ConfigDict(from_attributes=True)

class UserStreakResponse(BaseModel):
    user_id: int
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class GamificationSummaryResponse(BaseModel):
    user_id: int
    xp: UserXPResponse
    streak: UserStreakResponse
    recent_badges: List[UserBadgeResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
