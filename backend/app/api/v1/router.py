from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, modules, sessions, media, notifications, certificates, leaderboard, search, discussions, notes, gamification, reviews, ws, study_rooms, ai, tenants, payments, scorm, sso, pwa

from app.api.v1.endpoints.admin import (
    users as admin_users,
    modules as admin_modules,
    sessions as admin_sessions,
    questions as admin_questions,
    tokens as admin_tokens,
    cohorts as admin_cohorts,
    reports as admin_reports,
    audit_logs as admin_audit_logs,
    announcements as admin_announcements,
)

from app.core.config import settings

api_router = APIRouter()

@api_router.get("/health", tags=["health"])
async def api_health():
    return {"status": "ok", "version": settings.APP_VERSION}

# Public / User endpoints
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(ws.router, prefix="/ws", tags=["ws"])
api_router.include_router(study_rooms.router, prefix="/study-rooms", tags=["study-rooms"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(scorm.router, prefix="/scorm", tags=["scorm"])
api_router.include_router(sso.router, prefix="/sso", tags=["sso"])
api_router.include_router(pwa.router, prefix="/pwa", tags=["pwa"])

# Admin endpoints
api_router.include_router(admin_users.router, prefix="/admin/users", tags=["admin-users"])
api_router.include_router(admin_modules.router, prefix="/admin/modules", tags=["admin-modules"])
api_router.include_router(admin_sessions.router, prefix="/admin/sessions", tags=["admin-sessions"])
api_router.include_router(admin_questions.router, prefix="/admin/questions", tags=["admin-questions"])
api_router.include_router(admin_tokens.router, prefix="/admin/tokens", tags=["admin-tokens"])
api_router.include_router(admin_cohorts.router, prefix="/admin/cohorts", tags=["admin-cohorts"])
api_router.include_router(admin_reports.router, prefix="/admin/reports", tags=["admin-reports"])
api_router.include_router(admin_audit_logs.router, prefix="/admin/audit-logs", tags=["admin-audit"])
api_router.include_router(admin_announcements.router, prefix="/admin/announcements", tags=["admin-announcements"])

