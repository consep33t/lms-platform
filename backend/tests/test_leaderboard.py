try:
    import pytest
except ImportError:
    pytest = None

from app.schemas.leaderboard import LeaderboardUserItem, GlobalLeaderboardResponse, ModuleLeaderboardResponse



def test_leaderboard_user_schema():
    item = LeaderboardUserItem(
        rank=1,
        user_id=10,
        user_name="Budi Santoso",
        institution="SMK TI Bandung",
        modules_completed=5,
        average_score=95.5,
        total_certificates=5
    )
    assert item.rank == 1
    assert item.average_score == 95.5

    response = GlobalLeaderboardResponse(
        total_participants=1,
        leaderboard=[item]
    )
    assert response.total_participants == 1
    assert len(response.leaderboard) == 1
    assert response.leaderboard[0].user_name == "Budi Santoso"
