from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentWatchProgress
from app.models.question import Question, QuestionOption
from app.models.progress import UserModuleProgress, SessionProgress, UserAnswer, ProgressStatus
from app.schemas.session import SessionDetailResponse
from app.schemas.progress import (
    WatchProgressRequest,
    SessionSubmitRequest,
    SessionSubmitResponse,
    SessionProgressResponse,
    QuestionFeedback
)


class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_session_detail(self, session_id: int) -> ModuleSession:
        stmt = (
            select(ModuleSession)
            .options(
                selectinload(ModuleSession.contents),
                selectinload(ModuleSession.questions).selectinload(Question.options)
            )
            .where(ModuleSession.id == session_id, ModuleSession.is_deleted == False)
        )
        res = await self.db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesi tidak ditemukan")
        return session

    async def get_or_create_module_progress(self, user_id: int, module_id: int) -> UserModuleProgress:
        stmt = select(UserModuleProgress).where(
            UserModuleProgress.user_id == user_id,
            UserModuleProgress.module_id == module_id
        )
        ump = (await self.db.execute(stmt)).scalar_one_or_none()
        if not ump:
            ump = UserModuleProgress(
                user_id=user_id,
                module_id=module_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(ump)
            await self.db.flush()
        return ump

    async def get_user_session_progress(self, session_id: int, user_id: int) -> SessionProgressResponse:
        session_item = await self.get_session_detail(session_id)
        ump = await self.get_or_create_module_progress(user_id, session_item.module_id)

        stmt = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == ump.id,
            SessionProgress.session_id == session_id
        )
        sp = (await self.db.execute(stmt)).scalar_one_or_none()

        if not sp:
            return SessionProgressResponse(
                session_id=session_id,
                is_unlocked=True,
                is_completed=False,
                score=None,
                status=ProgressStatus.not_started
            )

        return SessionProgressResponse(
            session_id=session_id,
            is_unlocked=True,
            is_completed=(sp.status == ProgressStatus.completed),
            score=sp.score,
            status=sp.status
        )

    async def submit_session_quiz(
        self, session_id: int, user_id: int, req: SessionSubmitRequest
    ) -> SessionSubmitResponse:
        session_item = await self.get_session_detail(session_id)
        ump = await self.get_or_create_module_progress(user_id, session_item.module_id)

        # 1. Fetch all questions and options for this session
        stmt_q = select(Question).options(selectinload(Question.options)).where(
            Question.session_id == session_id,
            Question.is_deleted == False
        )
        res_q = await self.db.execute(stmt_q)
        questions = list(res_q.scalars().all())

        if not questions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sesi ini tidak memiliki soal kuis")

        total_questions = len(questions)
        correct_count = 0
        feedback_list: list[QuestionFeedback] = []

        # Map user answers
        user_answer_map = {ans.question_id: ans.selected_option_id for ans in req.answers}

        # 2. Get or create SessionProgress
        stmt_sp = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == ump.id,
            SessionProgress.session_id == session_id
        )
        sp = (await self.db.execute(stmt_sp)).scalar_one_or_none()

        if not sp:
            sp = SessionProgress(
                user_module_progress_id=ump.id,
                session_id=session_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(sp)
            await self.db.flush()

        # Delete previous answers if any
        stmt_del = select(UserAnswer).where(UserAnswer.session_progress_id == sp.id)
        existing_ans = (await self.db.execute(stmt_del)).scalars().all()
        for ea in existing_ans:
            await self.db.delete(ea)

        # 3. Evaluate each question (WITHOUT LEAKING CORRECT ANSWERS)
        for q in questions:
            options = q.options
            correct_option = next((opt for opt in options if opt.is_correct), None)
            selected_opt_id = user_answer_map.get(q.id)

            is_correct = False
            if correct_option and selected_opt_id == correct_option.id:
                is_correct = True
                correct_count += 1

            # Save answer to DB
            user_ans_record = UserAnswer(
                session_progress_id=sp.id,
                question_id=q.id,
                selected_option_id=selected_opt_id,
                is_correct=is_correct
            )
            self.db.add(user_ans_record)

            # Do NOT leak correct option id or explanation
            feedback_list.append(QuestionFeedback(
                question_id=q.id,
                selected_option_id=selected_opt_id or 0,
                is_correct=is_correct
            ))

        # 4. Calculate Final Score (passing score 70%)
        passing_score = 70.0
        final_score = round((correct_count / total_questions) * 100.0, 2)
        passed = final_score >= passing_score

        sp.score = final_score
        sp.time_spent_seconds += req.time_spent_seconds
        sp.completed_at = datetime.utcnow()
        if passed:
            sp.status = ProgressStatus.completed

        # 5. Check Overall Module Completion
        stmt_all_sess = select(ModuleSession).where(
            ModuleSession.module_id == session_item.module_id,
            ModuleSession.is_deleted == False
        )
        all_sessions = list((await self.db.execute(stmt_all_sess)).scalars().all())
        total_mod_sessions = len(all_sessions)

        stmt_comp_sp = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == ump.id,
            SessionProgress.status == ProgressStatus.completed
        )
        completed_sp_count = len(list((await self.db.execute(stmt_comp_sp)).scalars().all()))

        if completed_sp_count >= total_mod_sessions and total_mod_sessions > 0:
            ump.status = ProgressStatus.completed
            ump.completed_at = datetime.utcnow()

        return SessionSubmitResponse(
            session_id=session_id,
            session_progress_id=sp.id,
            status=sp.status,
            score=final_score,
            passed=passed,
            correct_count=correct_count,
            total_questions=total_questions,
            feedback=feedback_list
        )

    async def update_watch_progress(
        self, content_id: int, user_id: int, req: WatchProgressRequest
    ):
        stmt_c = select(SessionContent).where(SessionContent.id == content_id)
        content = (await self.db.execute(stmt_c)).scalar_one_or_none()
        if not content:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konten tidak ditemukan")

        session_item = await self.get_session_detail(content.session_id)
        ump = await self.get_or_create_module_progress(user_id, session_item.module_id)

        stmt_wp = select(ContentWatchProgress).where(
            ContentWatchProgress.user_id == user_id,
            ContentWatchProgress.session_content_id == content_id
        )
        wp = (await self.db.execute(stmt_wp)).scalar_one_or_none()

        if not wp:
            wp = ContentWatchProgress(
                user_id=user_id,
                session_content_id=content_id,
                last_position_seconds=int(req.watched_percent),
                is_completed=req.is_completed
            )
            self.db.add(wp)
        else:
            wp.last_position_seconds = int(req.watched_percent)
            if req.is_completed:
                wp.is_completed = True
