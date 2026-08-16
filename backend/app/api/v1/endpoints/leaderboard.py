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
    completed_modules_subq = (
        select(
            UserModuleProgress.user_id,
            func.count(UserModuleProgress.id).label("modules_completed")
        )
        .where(UserModuleProgress.status == ProgressStatus.completed)
        .group_by(UserModuleProgress.user_id)
        .subquery()
    )

    avg_score_subq = (
        select(
            UserModuleProgress.user_id,
            func.avg(SessionProgress.score).label("avg_score")
        )
        .join(SessionProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .where(SessionProgress.status == ProgressStatus.completed, SessionProgress.score.is_not(None))
        .group_by(UserModuleProgress.user_id)
        .subquery()
    )

    certs_subq = (
        select(
            Certificate.user_id,
            func.count(Certificate.id).label("total_certs")
        )
        .group_by(Certificate.user_id)
        .subquery()
    )

    stmt = (
        select(
            User.id,
            User.full_name,
            User.institution,
            func.coalesce(completed_modules_subq.c.modules_completed, 0).label("modules_completed"),
            func.coalesce(avg_score_subq.c.avg_score, 0.0).label("avg_score"),
            func.coalesce(certs_subq.c.total_certs, 0).label("total_certs")
        )
        .join(UserModuleProgress, User.id == UserModuleProgress.user_id)
        .outerjoin(completed_modules_subq, User.id == completed_modules_subq.c.user_id)
        .outerjoin(avg_score_subq, User.id == avg_score_subq.c.user_id)
        .outerjoin(certs_subq, User.id == certs_subq.c.user_id)
        .where(User.is_deleted == False, User.is_active == True)
        .distinct()
        .order_by(
            func.coalesce(completed_modules_subq.c.modules_completed, 0).desc(),
            func.coalesce(avg_score_subq.c.avg_score, 0.0).desc()
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
    """Papan peringkat pembelajar terbaik khusus untuk satu modul tertentu."""
    mod = await db.get(Module, module_id)
    if not mod or mod.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")

    stmt = (
        select(
            User.id,
            User.full_name,
            User.institution,
            UserModuleProgress.status,
            func.avg(SessionProgress.score).label("avg_score"),
            func.count(Certificate.id).label("total_certs")
        )
        .join(UserModuleProgress, User.id == UserModuleProgress.user_id)
        .outerjoin(SessionProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .outerjoin(Certificate, (Certificate.user_id == User.id) & (Certificate.module_id == module_id))
        .where(
            UserModuleProgress.module_id == module_id,
            User.is_deleted == False,
            User.is_active == True
        )
        .group_by(User.id, User.full_name, User.institution, UserModuleProgress.status)
        .order_by(
            case((UserModuleProgress.status == ProgressStatus.completed, 1), else_=0).desc(),
            func.avg(SessionProgress.score).desc()
        )
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()

    leaderboard = []
    for rank, r in enumerate(rows, start=1):
        avg_score = round(float(r.avg_score), 1) if r.avg_score is not None else 0.0
        is_comp = (r.status == ProgressStatus.completed)
        leaderboard.append(LeaderboardUserItem(
            rank=rank,
            user_id=r.id,
            user_name=r.full_name,
            institution=r.institution,
            modules_completed=1 if is_comp else 0,
            average_score=avg_score,
            total_certificates=int(r.total_certs or 0)
        ))

    return ModuleLeaderboardResponse(
        module_id=module_id,
        module_title=mod.title,
        total_participants=len(leaderboard),
        leaderboard=leaderboard
    )
