from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.session_repo import SessionRepository
from app.models.session import ModuleSession
from app.models.content import ContentWatchProgress
from app.models.progress import SessionProgress, UserAnswer, ProgressStatus
from app.models.question import QuestionOption
from app.schemas.progress import SessionSubmitRequest, SessionSubmitResponse, WatchProgressRequest


class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SessionRepository(db)

    async def get_session_detail(self, session_id: int) -> ModuleSession:
        session = await self.repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesi pembelajaran tidak ditemukan")
        return session

    async def update_watch_progress(self, content_id: int, req: WatchProgressRequest) -> None:
        stmt = select(ContentWatchProgress).where(
            ContentWatchProgress.session_progress_id == req.session_progress_id,
            ContentWatchProgress.session_content_id == content_id
        )
        res = await self.db.execute(stmt)
        record = res.scalar_one_or_none()

        if not record:
            record = ContentWatchProgress(
                session_progress_id=req.session_progress_id,
                session_content_id=content_id,
                watched_percent=req.watched_percent,
                is_completed=req.is_completed
            )
            self.db.add(record)
        else:
            record.watched_percent = max(record.watched_percent, req.watched_percent)
            if req.is_completed:
                record.is_completed = True

    async def submit_session_quiz(self, req: SessionSubmitRequest) -> SessionSubmitResponse:
        stmt = select(SessionProgress).where(SessionProgress.id == req.session_progress_id)
        res = await self.db.execute(stmt)
        progress = res.scalar_one_or_none()
        if not progress:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress sesi tidak ditemukan")

        correct_count = 0
        total_questions = len(req.answers)

        for ans in req.answers:
            # Check correctness from DB
            stmt_opt = select(QuestionOption).where(
                QuestionOption.id == ans.selected_option_id,
                QuestionOption.question_id == ans.question_id
            )
            res_opt = await self.db.execute(stmt_opt)
            option = res_opt.scalar_one_or_none()

            is_correct = option.is_correct if option else False
            if is_correct:
                correct_count += 1

            user_ans = UserAnswer(
                session_progress_id=progress.id,
                question_id=ans.question_id,
                selected_option_id=ans.selected_option_id,
                is_correct=is_correct,
                answered_at=datetime.utcnow()
            )
            self.db.add(user_ans)

        score = (correct_count / total_questions * 100.0) if total_questions > 0 else 100.0
        passed = score >= 70.0  # standard passing score

        progress.score = score
        progress.time_spent_seconds = req.time_spent_seconds
        progress.status = ProgressStatus.completed if passed else ProgressStatus.in_progress
        progress.completed_at = datetime.utcnow() if passed else None

        return SessionSubmitResponse(
            session_progress_id=progress.id,
            status=progress.status,
            score=score,
            passed=passed,
            correct_count=correct_count,
            total_questions=total_questions
        )
