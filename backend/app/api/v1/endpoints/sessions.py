from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.session_service import SessionService
from app.schemas.session import SessionDetailResponse
from app.schemas.progress import (
    WatchProgressRequest,
    SessionSubmitRequest,
    SessionSubmitResponse,
    SessionProgressResponse,
    QuizStepSubmitRequest,
    QuizStepSubmitResponse,
    SessionTimeoutRequest,
    SessionTimeoutResponse,
    QuizReviewResponse
)


router = APIRouter()


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = SessionService(db)
    return await service.get_session_flow_detail(session_id, current_user_id)


@router.get("/{session_id}/progress", response_model=SessionProgressResponse)
async def get_session_progress(
    session_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.get_user_session_progress(session_id, current_user_id)


@router.post("/{session_id}/quiz-step", response_model=QuizStepSubmitResponse)
async def submit_quiz_step(
    session_id: int,
    req: QuizStepSubmitRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.submit_quiz_step(session_id, current_user_id, req)


@router.post("/{session_id}/timeout", response_model=SessionTimeoutResponse)
async def handle_session_timeout(
    session_id: int,
    req: SessionTimeoutRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.handle_session_timeout(session_id, current_user_id, req)


@router.post("/{session_id}/submit", response_model=SessionSubmitResponse)
async def submit_session_quiz_direct(
    session_id: int,
    req: SessionSubmitRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.submit_session_quiz(session_id, current_user_id, req)


@router.post("/submit", response_model=SessionSubmitResponse)
async def submit_session_quiz_legacy(
    req: SessionSubmitRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Legacy submit endpoint (deprecated - use /{session_id}/submit instead)."""
    service = SessionService(db)
    # FIX: was hardcoded fallback to session_id=1 which is dangerous
    if not req.session_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="session_id wajib diisi pada endpoint legacy ini."
        )
    return await service.submit_session_quiz(req.session_id, current_user_id, req)


@router.post("/contents/{content_id}/watch-progress")
async def update_watch_progress(
    content_id: int,
    req: WatchProgressRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    await service.update_watch_progress(content_id, current_user_id, req)
    return {"status": "ok"}


@router.post("/{session_id}/flag")
async def record_anti_cheat_flag(
    session_id: int,
    flag_type: str = "tab_switch",
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.record_session_flag(session_id, current_user_id, flag_type)


@router.get("/{session_id}/review", response_model=QuizReviewResponse)
async def get_session_quiz_review(
    session_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.get_session_quiz_review(session_id, current_user_id)


