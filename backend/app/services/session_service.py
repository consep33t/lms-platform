from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.repositories.session_repo import SessionRepository
from app.models.session import ModuleSession
from app.models.content import ContentWatchProgress
from app.models.progress import SessionProgress, UserModuleProgress, UserAnswer, ProgressStatus
from app.models.question import Question, QuestionOption
from app.schemas.progress import (
    SessionSubmitRequest,
    SessionSubmitResponse,
    QuestionFeedback,
    WatchProgressRequest,
    SessionProgressResponse
)


class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SessionRepository(db)

    async def get_session_detail(self, session_id: int) -> ModuleSession:
        session = await self.repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesi pembelajaran tidak ditemukan")
        return session

    async def get_user_session_progress(self, session_id: int, user_id: int) -> SessionProgressResponse:
        session = await self.get_session_detail(session_id)
        stmt = select(SessionProgress).where(
            SessionProgress.user_id == user_id,
            SessionProgress.session_id == session_id
        )
        res = await self.db.execute(stmt)
        progress = res.scalar_one_or_none()

        if not progress:
            return SessionProgressResponse(
                session_id=session_id,
                is_unlocked=True,
                is_completed=False,
                score=None,
                status=None
            )

        return SessionProgressResponse(
            session_id=session_id,
            is_unlocked=True,
            is_completed=(progress.status == ProgressStatus.completed),
            score=progress.score,
            status=progress.status
        )

    async def update_watch_progress(self, content_id: int, user_id: int, req: WatchProgressRequest) -> None:
        session_id = req.session_id
        if not session_id:
            # Find session_id from session_progress
            if req.session_progress_id:
                stmt_sp = select(SessionProgress.session_id).where(SessionProgress.id == req.session_progress_id)
                res_sp = await self.db.execute(stmt_sp)
                session_id = res_sp.scalar_one_or_none()

        if not session_id:
            return

        # Find or create SessionProgress
        stmt = select(SessionProgress).where(
            SessionProgress.user_id == user_id,
            SessionProgress.session_id == session_id
        )
        res = await self.db.execute(stmt)
        progress = res.scalar_one_or_none()

        if not progress:
            progress = SessionProgress(
                user_id=user_id,
                session_id=session_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(progress)
            await self.db.flush()

        stmt_wp = select(ContentWatchProgress).where(
            ContentWatchProgress.session_progress_id == progress.id,
            ContentWatchProgress.session_content_id == content_id
        )
        res_wp = await self.db.execute(stmt_wp)
        record = res_wp.scalar_one_or_none()

        if not record:
            record = ContentWatchProgress(
                session_progress_id=progress.id,
                session_content_id=content_id,
                watched_percent=req.watched_percent,
                is_completed=req.is_completed
            )
            self.db.add(record)
        else:
            record.watched_percent = max(record.watched_percent, req.watched_percent)
            if req.is_completed:
                record.is_completed = True

    async def submit_session_quiz(self, session_id: int, user_id: int, req: SessionSubmitRequest) -> SessionSubmitResponse:
        session = await self.get_session_detail(session_id)

        # 1. Find or initialize SessionProgress
        stmt_p = select(SessionProgress).where(
            SessionProgress.user_id == user_id,
            SessionProgress.session_id == session_id
        )
        res_p = await self.db.execute(stmt_p)
        progress = res_p.scalar_one_or_none()

        if not progress:
            progress = SessionProgress(
                user_id=user_id,
                session_id=session_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(progress)
            await self.db.flush()

        # 2. Evaluate answers
        correct_count = 0
        total_questions = len(session.questions) if session.questions else len(req.answers)
        feedback_list: list[QuestionFeedback] = []

        # Build questions lookup
        q_map = {q.id: q for q in session.questions}

        for ans in req.answers:
            q = q_map.get(ans.question_id)
            correct_opt_id = None
            explanation = None
            is_correct = False

            if q:
                explanation = q.explanation
                for opt in q.options:
                    if opt.is_correct:
                        correct_opt_id = opt.id
                    if opt.id == ans.selected_option_id and opt.is_correct:
                        is_correct = True

            if is_correct:
                correct_count += 1

            feedback_list.append(QuestionFeedback(
                question_id=ans.question_id,
                selected_option_id=ans.selected_option_id,
                is_correct=is_correct,
                correct_option_id=correct_opt_id,
                explanation=explanation
            ))

            # Store answer
            user_ans = UserAnswer(
                session_progress_id=progress.id,
                question_id=ans.question_id,
                selected_option_id=ans.selected_option_id,
                is_correct=is_correct,
                answered_at=datetime.utcnow()
            )
            self.db.add(user_ans)

        # 3. Calculate score & passing status
        score = (correct_count / total_questions * 100.0) if total_questions > 0 else 100.0
        passing_score = session.passing_score or 70.0
        passed = score >= passing_score

        progress.score = score
        progress.time_spent_seconds = req.time_spent_seconds or 0
        progress.status = ProgressStatus.completed if passed else ProgressStatus.in_progress
        if passed:
            progress.completed_at = datetime.utcnow()

        # 4. Sync module progress
        module_id = session.module_id
        stmt_mp = select(UserModuleProgress).where(
            UserModuleProgress.user_id == user_id,
            UserModuleProgress.module_id == module_id
        )
        res_mp = await self.db.execute(stmt_mp)
        module_progress = res_mp.scalar_one_or_none()

        if not module_progress:
            module_progress = UserModuleProgress(
                user_id=user_id,
                module_id=module_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(module_progress)

        # Check total completed sessions for this module
        stmt_all_sess = select(func.count(ModuleSession.id)).where(
            ModuleSession.module_id == module_id,
            ModuleSession.is_deleted == False
        )
        total_mod_sessions = (await self.db.execute(stmt_all_sess)).scalar() or 1

        stmt_comp_sess = select(func.count(SessionProgress.id)).where(
            SessionProgress.user_id == user_id,
            SessionProgress.status == ProgressStatus.completed,
            SessionProgress.session_id.in_(
                select(ModuleSession.id).where(ModuleSession.module_id == module_id)
            )
        )
        completed_mod_sessions = (await self.db.execute(stmt_comp_sess)).scalar() or 0

        if passed and progress.status == ProgressStatus.completed:
            completed_mod_sessions = max(completed_mod_sessions, 1)

        prog_pct = min(100.0, (completed_mod_sessions / total_mod_sessions) * 100.0)
        module_progress.status = ProgressStatus.completed if prog_pct >= 100.0 else ProgressStatus.in_progress
        if prog_pct >= 100.0 and not module_progress.completed_at:
            module_progress.completed_at = datetime.utcnow()

        return SessionSubmitResponse(
            session_id=session_id,
            session_progress_id=progress.id,
            status=progress.status,
            score=score,
            passed=passed,
            correct_count=correct_count,
            total_questions=total_questions,
            feedback=feedback_list
        )
