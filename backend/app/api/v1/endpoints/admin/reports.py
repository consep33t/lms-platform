from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.module import Module
from app.models.token import ModuleToken
from app.models.progress import UserModuleProgress, ProgressStatus

router = APIRouter()


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.scalar(select(func.count(User.id)).where(User.is_deleted == False)) or 0
    total_modules = await db.scalar(select(func.count(Module.id)).where(Module.is_deleted == False)) or 0
    active_tokens = await db.scalar(select(func.count(ModuleToken.id)).where(ModuleToken.is_active == True)) or 0
    completed_modules = await db.scalar(select(func.count(UserModuleProgress.id)).where(UserModuleProgress.status == ProgressStatus.completed)) or 0

    return {
        "total_users": total_users,
        "total_modules": total_modules,
        "active_tokens": active_tokens,
        "completed_modules": completed_modules
    }
