from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.core.database import get_db
from app.models.user import User
from app.models.module import Module
from app.models.progress import UserModuleProgress, SessionProgress, ProgressStatus, Certificate
from app.schemas.leaderboard import LeaderboardUserItem, GlobalLeaderboardResponse, ModuleLeaderboardResponse

router = APIRouter()


@router.get("", response_model=GlobalLeaderboardResponse)
async def get_global_leaderboard(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Papan peringkat pembelajar terbaik global di seluruh modul LMS."""
    stmt = (
        select(
            User.id,
            User.full_name,
            User.institution,
            func.sum(case((UserModuleProgress.status == ProgressStatus.completed, 1), else_=0)).label("modules_completed"),
            func.avg(case((SessionProgress.status == ProgressStatus.completed, SessionProgress.score), else_=None)).label("avg_score"),
            func.count(Certificate.id.distinct()).label("total_certs")
        )
        .join(UserModuleProgress, User.id == UserModuleProgress.user_id)
        .outerjoin(SessionProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .outerjoin(Certificate, Certificate.user_id == User.id)
        .where(User.is_deleted == False, User.is_active == True)
        .group_by(User.id, User.full_name, User.institution)
        .order_by(
            func.sum(case((UserModuleProgress.status == ProgressStatus.completed, 1), else_=0)).desc(),
            func.avg(case((SessionProgress.status == ProgressStatus.completed, SessionProgress.score), else_=None)).desc()
        )
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()

    leaderboard = []
    for rank, r in enumerate(rows, start=1):
        avg_score = round(float(r.avg_score), 1) if r.avg_score is not None else 0.0
        leaderboard.append(LeaderboardUserItem(
            rank=rank,
            user_id=r.id,
            user_name=r.full_name,
            institution=r.institution,
            modules_completed=int(r.modules_completed or 0),
            average_score=avg_score,
            total_certificates=int(r.total_certs or 0)
        ))

    # Total active learners count
    total_participants = len(leaderboard)

    return GlobalLeaderboardResponse(
        total_participants=total_participants,
        leaderboard=leaderboard
    )


@router.get("/module/{module_id}", response_model=ModuleLeaderboardResponse)
async def get_module_leaderboard(
    module_id: int,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Papan peringkat peserta terbaik pada modul tertentu."""
    stmt_mod = select(Module).where(Module.id == module_id, Module.is_deleted == False)
    module = (await db.execute(stmt_mod)).scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")

    stmt = (
        select(
            User.id,
            User.full_name,
            User.institution,
            case((UserModuleProgress.status == ProgressStatus.completed, 1), else_=0).label("completed"),
            func.avg(case((SessionProgress.status == ProgressStatus.completed, SessionProgress.score), else_=None)).label("avg_score"),
            func.count(Certificate.id.distinct()).label("total_certs")
        )
        .join(UserModuleProgress, (User.id == UserModuleProgress.user_id) & (UserModuleProgress.module_id == module_id))
        .outerjoin(SessionProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .outerjoin(Certificate, (Certificate.user_id == User.id) & (Certificate.module_id == module_id))
        .where(User.is_deleted == False, User.is_active == True)
        .group_by(User.id, User.full_name, User.institution, UserModuleProgress.status)
        .order_by(
            case((UserModuleProgress.status == ProgressStatus.completed, 1), else_=0).desc(),
            func.avg(case((SessionProgress.status == ProgressStatus.completed, SessionProgress.score), else_=None)).desc()
        )
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()

    leaderboard = []
    for rank, r in enumerate(rows, start=1):
        avg_score = round(float(r.avg_score), 1) if r.avg_score is not None else 0.0
        leaderboard.append(LeaderboardUserItem(
            rank=rank,
            user_id=r.id,
            user_name=r.full_name,
            institution=r.institution,
            modules_completed=int(r.completed or 0),
            average_score=avg_score,
            total_certificates=int(r.total_certs or 0)
        ))

    return ModuleLeaderboardResponse(
        module_id=module.id,
        module_title=module.title,
        total_participants=len(leaderboard),
        leaderboard=leaderboard
    )
