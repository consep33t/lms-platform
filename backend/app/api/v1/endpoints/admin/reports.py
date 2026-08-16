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


@router.get("/analytics")
@router.get("/overview")
@router.get("/metrics")
async def get_admin_analytics(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    from datetime import datetime, timedelta
    from sqlalchemy.orm import selectinload

    now = datetime.utcnow()

    # 1. 7-Day Enrollment Trend
    trend_data = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())

        stmt_day = select(func.count(UserModuleProgress.id)).where(
            UserModuleProgress.created_at >= day_start,
            UserModuleProgress.created_at <= day_end
        )
        count = (await db.execute(stmt_day)).scalar() or 0
        trend_data.append({
            "date": day_date.strftime("%d %b"),
            "count": count
        })

    # 2. Score Distribution
    stmt_dist = select(
        func.sum(case((SessionProgress.score < 50, 1), else_=0)).label("range_0_50"),
        func.sum(case(((SessionProgress.score >= 50) & (SessionProgress.score < 70), 1), else_=0)).label("range_51_70"),
        func.sum(case(((SessionProgress.score >= 70) & (SessionProgress.score < 85), 1), else_=0)).label("range_71_85"),
        func.sum(case((SessionProgress.score >= 85, 1), else_=0)).label("range_86_100"),
    ).where(SessionProgress.status == ProgressStatus.completed)
    dist_row = (await db.execute(stmt_dist)).one()

    score_distribution = [
        {"range": "0 - 50%", "count": int(dist_row.range_0_50 or 0), "label": "Perlu Bimbingan"},
        {"range": "51 - 70%", "count": int(dist_row.range_51_70 or 0), "label": "Cukup"},
        {"range": "71 - 85%", "count": int(dist_row.range_71_85 or 0), "label": "Baik (Lulus)"},
        {"range": "86 - 100%", "count": int(dist_row.range_86_100 or 0), "label": "Sangat Baik"},
    ]

    # 3. Top 5 Modules by Activity & Completion
    enrolled_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id).scalar_subquery()
    completed_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id, UserModuleProgress.status == ProgressStatus.completed).scalar_subquery()
    
    stmt_top = (
        select(
            Module.id,
            Module.title,
            enrolled_subq.label("enrolled"),
            completed_subq.label("completed")
        )
        .where(Module.is_deleted == False)
        .order_by(enrolled_subq.desc())
        .limit(5)
    )
    top_rows = (await db.execute(stmt_top)).all()
    top_modules = []
    for r in top_rows:
        enr = r.enrolled or 0
        comp = int(r.completed or 0)
        rate = round((comp / enr * 100), 1) if enr > 0 else 0.0
        top_modules.append({
            "id": r.id,
            "title": r.title,
            "enrolled": enr,
            "completed": comp,
            "completion_rate": rate
        })

    # 4. Recent Activities (Completed Sessions)
    stmt_recent = (
        select(SessionProgress)
        .join(UserModuleProgress, SessionProgress.user_module_progress_id == UserModuleProgress.id)
        .options(
            selectinload(SessionProgress.session).selectinload(ModuleSession.module),
            selectinload(SessionProgress.user_module_progress).selectinload(UserModuleProgress.user)
        )
        .where(SessionProgress.status == ProgressStatus.completed)
        .order_by(SessionProgress.completed_at.desc())
        .limit(6)
    )
    recent_records = (await db.execute(stmt_recent)).scalars().all()
    recent_activities = []
    for sp in recent_records:
        user_name = sp.user_module_progress.user.full_name if sp.user_module_progress and sp.user_module_progress.user else "Peserta"
        sess_title = sp.session.title if sp.session else "Sesi"
        mod_title = sp.session.module.title if sp.session and sp.session.module else "Modul"
        recent_activities.append({
            "user_name": user_name,
            "session_title": sess_title,
            "module_title": mod_title,
            "score": round(sp.score, 1),
            "completed_at": sp.completed_at
        })

    return {
        "enrollment_trend_7d": trend_data,
        "score_distribution": score_distribution,
        "top_modules": top_modules,
        "recent_activities": recent_activities
    }



@router.get("/module-completion")
async def get_module_completion_report(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    enrolled_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id).scalar_subquery()
    completed_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id, UserModuleProgress.status == ProgressStatus.completed).scalar_subquery()

    stmt = (
        select(
            Module.id,
            Module.title,
            enrolled_subq.label("total_enrolled"),
            completed_subq.label("total_completed")
        )
        .where(Module.is_deleted == False)
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


@router.get("/export/module-completion")
async def export_module_completion_csv(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    import io
    import csv
    from fastapi.responses import Response

    enrolled_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id).scalar_subquery()
    completed_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.module_id == Module.id, UserModuleProgress.status == ProgressStatus.completed).scalar_subquery()

    stmt = (
        select(
            Module.id,
            Module.title,
            enrolled_subq.label("total_enrolled"),
            completed_subq.label("total_completed")
        )
        .where(Module.is_deleted == False)
    )
    res = await db.execute(stmt)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID Modul", "Judul Modul", "Total Peserta Terdaftar", "Total Peserta Lulus", "Tingkat Kelulusan (%)"])

    for row in res.all():
        enrolled = row.total_enrolled or 0
        completed = int(row.total_completed or 0)
        rate = round((completed / enrolled) * 100, 1) if enrolled > 0 else 0.0
        writer.writerow([row.id, row.title, enrolled, completed, f"{rate}%"])

    csv_data = output.getvalue().encode("utf-8-sig")
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Laporan_Kelulusan_Modul.csv"}
    )


@router.get("/export/users")
async def export_user_progress_csv(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    import io
    import csv
    from fastapi.responses import Response

    enrolled_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.user_id == User.id).scalar_subquery()
    completed_subq = select(func.count(UserModuleProgress.id)).where(UserModuleProgress.user_id == User.id, UserModuleProgress.status == ProgressStatus.completed).scalar_subquery()

    stmt = (
        select(
            User.id,
            User.full_name,
            User.email,
            User.role,
            User.institution,
            enrolled_subq.label("total_enrolled"),
            completed_subq.label("total_completed")
        )
        .where(User.is_deleted == False)
        .order_by(User.id)
    )
    res = await db.execute(stmt)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID User", "Nama Lengkap", "Email", "Role", "Institusi", "Modul Diikuti", "Modul Selesai"])

    for row in res.all():
        writer.writerow([
            row.id,
            row.full_name,
            row.email,
            row.role.value if hasattr(row.role, 'value') else str(row.role),
            row.institution or "-",
            row.total_enrolled or 0,
            int(row.total_completed or 0),
        ])

    csv_data = output.getvalue().encode("utf-8-sig")
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Laporan_Pengguna_LMS.csv"}
    )

