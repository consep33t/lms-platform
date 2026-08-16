from pydantic import BaseModel


class LeaderboardUserItem(BaseModel):
    rank: int
    user_id: int
    user_name: str
    institution: str | None = None
    modules_completed: int
    average_score: float
    total_certificates: int


class GlobalLeaderboardResponse(BaseModel):
    total_participants: int
    leaderboard: list[LeaderboardUserItem]


class ModuleLeaderboardResponse(BaseModel):
    module_id: int
    module_title: str
    total_participants: int
    leaderboard: list[LeaderboardUserItem]
