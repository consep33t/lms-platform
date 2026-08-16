from datetime import datetime
from app.schemas.gamification import (
    BadgeResponse,
    UserBadgeResponse,
    UserXPResponse,
    UserStreakResponse,
    GamificationSummaryResponse
)

def test_badge_response_schema():
    badge = BadgeResponse(
        id=1,
        code="FIRST_MODULE_COMPLETED",
        title="Pembelajar Pemula",
        description="Menyelesaikan modul pertama Anda dengan gemilang.",
        xp_reward=100
    )
    assert badge.code == "FIRST_MODULE_COMPLETED"
    assert badge.xp_reward == 100

def test_user_streak_schema():
    streak = UserStreakResponse(
        user_id=42,
        current_streak=5,
        longest_streak=14,
        last_activity_date=datetime.now()
    )
    assert streak.current_streak == 5
    assert streak.longest_streak == 14
