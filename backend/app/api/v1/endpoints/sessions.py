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
    SessionTimeoutResponse
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
    service = SessionService(db)
    session_id = req.session_id or 1
    return await service.submit_session_quiz(session_id, current_user_id, req)


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
