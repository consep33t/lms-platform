from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.models.user import User
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.progress import UserModuleProgress, SessionProgress, ProgressStatus, Certificate
from app.models.cohort import Cohort, CohortMember, ModuleAssignment
from app.schemas.user import UserResponse, UserUpdate, UserPasswordChange, UserDashboardResponse, LastActiveSession, UpcomingDeadlineItem
from app.schemas.progress import UserModuleProgressItem
from app.services.user_service import UserService



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
    user_svc = UserService(db)
    user = await user_svc.get_by_id(current_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    return await user_svc.update_profile(
        user=user,
        full_name=req.full_name,
        phone_number=req.phone_number,
        institution=req.institution,
        avatar_media_id=req.avatar_media_id,
    )


@router.put("/me/password")
async def change_my_password(
    req: UserPasswordChange,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_svc = UserService(db)
    user = await user_svc.get_by_id(current_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    success, message = await user_svc.change_password(
        user=user,
        current_password=req.current_password,
        new_password=req.new_password,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return {"message": message}



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
        # FIX: Only count sessions that are not deleted AND the session's parent module is published
        # This prevents drafted sessions from blocking 100% completion for users
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


@router.get("/me/dashboard", response_model=UserDashboardResponse)
async def get_my_dashboard_summary(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    from sqlalchemy.orm import selectinload

    # 1. Total enrolled modules
    stmt_enrolled = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.user_id == current_user_id)
    total_enrolled = (await db.execute(stmt_enrolled)).scalar() or 0

    # 2. Total completed modules
    stmt_completed = select(func.count(UserModuleProgress.id)).where(
        UserModuleProgress.user_id == current_user_id,
        UserModuleProgress.status == ProgressStatus.completed
    )
    total_completed = (await db.execute(stmt_completed)).scalar() or 0

    # 3. Total certificates issued
    stmt_certs = select(func.count(Certificate.id)).where(Certificate.user_id == current_user_id)
    total_certificates = (await db.execute(stmt_certs)).scalar() or 0

    # 4. Average score across completed sessions
    stmt_avg = (
        select(func.avg(SessionProgress.score))
        .join(UserModuleProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .where(
            UserModuleProgress.user_id == current_user_id,
            SessionProgress.status == ProgressStatus.completed
        )
    )
    avg_score_raw = (await db.execute(stmt_avg)).scalar()
    average_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 0.0

    # 5. Last active session for Resume Learning
    stmt_last_sp = (
        select(SessionProgress)
        .join(UserModuleProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .options(
            selectinload(SessionProgress.session).selectinload(ModuleSession.module),
            selectinload(SessionProgress.session).selectinload(ModuleSession.contents)
        )
        .where(
            UserModuleProgress.user_id == current_user_id,
            SessionProgress.status != ProgressStatus.completed
        )
        .order_by(SessionProgress.updated_at.desc())
    )
    last_sp = (await db.execute(stmt_last_sp)).scalars().first()

    last_active = None
    if last_sp and last_sp.session and last_sp.session.module:
        total_contents = len(last_sp.session.contents) if last_sp.session.contents else 1
        last_active = LastActiveSession(
            session_id=last_sp.session_id,
            session_title=last_sp.session.title,
            module_id=last_sp.session.module_id,
            module_title=last_sp.session.module.title,
            current_step=1,
            total_steps=total_contents,
            progress_percent=round(last_sp.score, 1)
        )

    # 6. Upcoming deadlines from Cohort assignments
    now = datetime.utcnow()
    stmt_deadlines = (
        select(ModuleAssignment)
        .join(CohortMember, ModuleAssignment.cohort_id == CohortMember.cohort_id)
        .options(
            selectinload(ModuleAssignment.cohort),
            selectinload(ModuleAssignment.module)
        )
        .where(
            CohortMember.user_id == current_user_id,
            ModuleAssignment.due_date >= now
        )
        .order_by(ModuleAssignment.due_date.asc())
    )
    assignment_records = (await db.execute(stmt_deadlines)).scalars().all()

    upcoming_deadlines: list[UpcomingDeadlineItem] = []
    for a in assignment_records:
        if a.due_date and a.cohort and a.module:
            days_left = max(0, (a.due_date - now).days)
            upcoming_deadlines.append(UpcomingDeadlineItem(
                cohort_id=a.cohort_id,
                cohort_name=a.cohort.name,
                module_id=a.module_id,
                module_title=a.module.title,
                due_date=a.due_date,
                days_left=days_left
            ))

    return UserDashboardResponse(
        total_enrolled=total_enrolled,
        total_completed=total_completed,
        total_certificates=total_certificates,
        average_score=average_score,
        last_active_session=last_active,
        upcoming_deadlines=upcoming_deadlines,
        recent_certificates_count=total_certificates
    )

