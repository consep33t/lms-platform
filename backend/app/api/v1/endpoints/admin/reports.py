from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.module import Module
from app.models.session import ModuleSession
from app.models.token import ModuleToken
from app.models.progress import UserModuleProgress, SessionProgress, ProgressStatus, Certificate

router = APIRouter()


@router.get("/dashboard")
@router.get("/dashboard-stats")
async def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.scalar(select(func.count(User.id)).where(User.is_deleted == False)) or 0
    active_users = await db.scalar(select(func.count(User.id)).where(User.is_deleted == False, User.is_active == True)) or 0
    total_modules = await db.scalar(select(func.count(Module.id)).where(Module.is_deleted == False)) or 0
    total_sessions = await db.scalar(select(func.count(ModuleSession.id)).where(ModuleSession.is_deleted == False)) or 0
    total_tokens = await db.scalar(select(func.count(ModuleToken.id))) or 0
    total_active_tokens = await db.scalar(select(func.count(ModuleToken.id)).where(ModuleToken.is_active == True)) or 0
    
    total_completions = await db.scalar(
        select(func.count(UserModuleProgress.id)).where(UserModuleProgress.status == ProgressStatus.completed)
    ) or 0
    
    avg_quiz = await db.scalar(
        select(func.avg(SessionProgress.score)).where(SessionProgress.status == ProgressStatus.completed)
    )
    avg_score = round(float(avg_quiz), 1) if avg_quiz is not None else 0.0

    total_certificates = await db.scalar(select(func.count(Certificate.id))) or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_modules": total_modules,
        "total_sessions": total_sessions,
        "total_tokens": total_tokens,
        "active_tokens": total_active_tokens,
        "total_completions": total_completions,
        "average_quiz_score": avg_score,
        "total_certificates_issued": total_certificates,
    }


@router.get("/module-completion")
async def get_module_completion_report(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(
            Module.id,
            Module.title,
            func.count(UserModuleProgress.id).label("total_enrolled"),
            func.sum(
                case(
                    (UserModuleProgress.status == ProgressStatus.completed, 1),
                    else_=0
                )
            ).label("total_completed")
        )
        .outerjoin(UserModuleProgress, Module.id == UserModuleProgress.module_id)
        .where(Module.is_deleted == False)
        .group_by(Module.id, Module.title)
    )
    res = await db.execute(stmt)
    records = []
    for row in res.all():
        records.append({
            "module_id": row.id,
            "module_title": row.title,
            "total_enrolled": row.total_enrolled,
            "total_completed": int(row.total_completed or 0),
        })
    return records
