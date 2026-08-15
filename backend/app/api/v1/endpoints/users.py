from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.models.user import User
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.progress import UserModuleProgress, SessionProgress, ProgressStatus
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.progress import UserModuleProgressItem

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == current_user_id, User.is_deleted == False)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")
    return user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    req: UserUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == current_user_id, User.is_deleted == False)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    if req.full_name is not None:
        user.full_name = req.full_name
    return user


@router.get("/me/progress", response_model=list[UserModuleProgressItem])
async def get_my_learning_progress(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Fetch all published modules
    stmt_m = select(Module).where(Module.status == ModuleStatus.published, Module.is_deleted == False).order_by(Module.order)
    res_m = await db.execute(stmt_m)
    modules = list(res_m.scalars().all())

    items: list[UserModuleProgressItem] = []

    for mod in modules:
        # Total sessions in this module
        stmt_ts = select(func.count(ModuleSession.id)).where(
            ModuleSession.module_id == mod.id,
            ModuleSession.is_deleted == False
        )
        total_sessions = (await db.execute(stmt_ts)).scalar() or 0

        # Find user_module_progress
        stmt_ump = select(UserModuleProgress).where(
            UserModuleProgress.user_id == current_user_id,
            UserModuleProgress.module_id == mod.id
        )
        res_ump = await db.execute(stmt_ump)
        ump = res_ump.scalar_one_or_none()

        completed_count = 0
        avg_score = 0.0

        if ump:
            stmt_cs = select(
                func.count(SessionProgress.id),
                func.avg(SessionProgress.score)
            ).where(
                SessionProgress.user_module_progress_id == ump.id,
                SessionProgress.status == ProgressStatus.completed
            )
            res_cs = await db.execute(stmt_cs)
            row = res_cs.one()
            completed_count = row[0] or 0
            avg_score = float(row[1]) if row[1] is not None else 0.0

        prog_percent = round((completed_count / total_sessions * 100.0), 1) if total_sessions > 0 else 0.0
        prog_status = ProgressStatus.completed if prog_percent >= 100.0 else (ProgressStatus.in_progress if prog_percent > 0 else ProgressStatus.not_started)

        items.append(UserModuleProgressItem(
            module_id=mod.id,
            module_title=mod.title,
            status=prog_status,
            progress_percent=prog_percent,
            sessions_completed=completed_count,
            total_sessions=total_sessions,
            average_score=round(avg_score, 1),
            certificate_url=f"/certificates/mod_{mod.id}_user_{current_user_id}.pdf" if prog_percent >= 100.0 else None
        ))

    return items
