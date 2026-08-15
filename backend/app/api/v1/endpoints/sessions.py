from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.session_service import SessionService
from app.schemas.session import SessionResponse
from app.schemas.progress import WatchProgressRequest, SessionSubmitRequest, SessionSubmitResponse

router = APIRouter()


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: int, db: AsyncSession = Depends(get_db)):
    service = SessionService(db)
    return await service.get_session_detail(session_id)


@router.post("/contents/{content_id}/watch-progress")
async def update_watch_progress(
    content_id: int,
    req: WatchProgressRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    await service.update_watch_progress(content_id, req)
    return {"status": "ok"}


@router.post("/submit", response_model=SessionSubmitResponse)
async def submit_session_quiz(
    req: SessionSubmitRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = SessionService(db)
    return await service.submit_session_quiz(req)
