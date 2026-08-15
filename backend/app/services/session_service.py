from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentWatchProgress
from app.models.question import Question, QuestionOption
from app.models.progress import UserModuleProgress, SessionProgress, UserAnswer, ProgressStatus
from app.schemas.session import SessionDetailResponse, SlideItem, SessionContentResponse
from app.schemas.question import QuestionResponse, QuestionOptionResponse
from app.schemas.progress import (
    WatchProgressRequest,
    SessionSubmitRequest,
    SessionSubmitResponse,
    SessionProgressResponse,
    QuestionFeedback,
    QuizStepSubmitRequest,
    QuizStepSubmitResponse,
    SessionTimeoutRequest,
    SessionTimeoutResponse
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

    async def get_or_create_session_progress(self, user_id: int, session: ModuleSession) -> tuple[UserModuleProgress, SessionProgress]:
        ump = await self.get_or_create_module_progress(user_id, session.module_id)
        stmt = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == ump.id,
            SessionProgress.session_id == session.id
        )
        sp = (await self.db.execute(stmt)).scalar_one_or_none()
        if not sp:
            sp = SessionProgress(
                user_module_progress_id=ump.id,
                session_id=session.id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(sp)
            await self.db.flush()
        elif not sp.started_at:
            sp.started_at = datetime.utcnow()
            await self.db.flush()

        return ump, sp

    async def get_session_flow_detail(self, session_id: int, user_id: int) -> SessionDetailResponse:
        session = await self.get_session_detail(session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session)

        # 1. Calculate Countdown Timer
        duration_seconds = session.duration_minutes * 60
        now = datetime.utcnow()
        started_at = sp.started_at or now
        expires_at = started_at + timedelta(seconds=duration_seconds)
        remaining_seconds = max(0, int((expires_at - now).total_seconds()))
        is_expired = (remaining_seconds <= 0) and (sp.status != ProgressStatus.completed)

        # 2. Build Slide Sequence & Interspersed Quizzes
        contents = sorted(session.contents, key=lambda c: c.order)
        questions = sorted(session.questions, key=lambda q: q.order)

        steps: list[SlideItem] = []
        step_counter = 1

        total_quizzes = max(1, len(questions))
        quiz_weight = round(100.0 / total_quizzes, 2)

        # Build interleaved content slides and quiz checkpoints
        q_idx = 0
        for c in contents:
            steps.append(SlideItem(
                id=c.id,
                step_number=step_counter,
                step_type=c.content_type.value,
                title=f"Materi #{step_counter}: {c.content_type.value.capitalize()} Slide",
                text_body=c.text_body,
                media_file_id=c.media_file_id
            ))
            step_counter += 1

            # Interleave a quiz after every content if questions are available
            if q_idx < len(questions):
                q_item = questions[q_idx]
                steps.append(SlideItem(
                    id=q_item.id + 10000,
                    step_number=step_counter,
                    step_type="quiz",
                    title=f"Checkpoint Kuis #{q_idx + 1} (Bobot: {quiz_weight}%)",
                    quiz_group_id=q_idx + 1,
                    quiz_weight_percent=quiz_weight,
                    questions=[QuestionResponse.model_validate(q_item)]
                ))
                step_counter += 1
                q_idx += 1

        # Add remaining questions if any
        while q_idx < len(questions):
            q_item = questions[q_idx]
            steps.append(SlideItem(
                id=q_item.id + 10000,
                step_number=step_counter,
                step_type="quiz",
                title=f"Checkpoint Kuis #{q_idx + 1} (Bobot: {quiz_weight}%)",
                quiz_group_id=q_idx + 1,
                quiz_weight_percent=quiz_weight,
                questions=[QuestionResponse.model_validate(q_item)]
            ))
            step_counter += 1
            q_idx += 1

        total_steps = len(steps)
        completed_percent = 100.0 if sp.status == ProgressStatus.completed else 0.0

        return SessionDetailResponse(
            id=session.id,
            module_id=session.module_id,
            title=session.title,
            description=session.description,
            order=session.order,
            duration_minutes=session.duration_minutes,
            created_at=session.created_at,
            updated_at=session.updated_at,
            contents=[SessionContentResponse.model_validate(c) for c in contents],
            questions=[QuestionResponse.model_validate(q) for q in questions],
            steps=steps,
            total_steps=total_steps,
            total_quizzes=total_quizzes,
            duration_seconds=duration_seconds,
            remaining_seconds=remaining_seconds,
            is_expired=is_expired,
            current_step=1,
            completed_percent=completed_percent,
            accumulated_score=sp.score,
            is_completed=(sp.status == ProgressStatus.completed)
        )

    async def submit_quiz_step(
        self, session_id: int, user_id: int, req: QuizStepSubmitRequest
    ) -> QuizStepSubmitResponse:
        session = await self.get_session_detail(session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session)

        # 1. Fetch questions for this session
        stmt_q = select(Question).options(selectinload(Question.options)).where(
            Question.session_id == session_id,
            Question.is_deleted == False
        )
        all_questions = list((await self.db.execute(stmt_q)).scalars().all())
        total_quizzes = max(1, len(all_questions))
        step_weight = 100.0 / total_quizzes

        step_correct_count = 0
        step_total_questions = len(req.answers)

        for ans in req.answers:
            q = next((item for item in all_questions if item.id == ans.question_id), None)
            if q:
                correct_opt = next((opt for opt in q.options if opt.is_correct), None)
                is_correct = bool(correct_opt and correct_opt.id == ans.selected_option_id)
                if is_correct:
                    step_correct_count += 1

                # Save / replace user answer record
                stmt_existing = select(UserAnswer).where(
                    UserAnswer.session_progress_id == sp.id,
                    UserAnswer.question_id == q.id
                )
                ua = (await self.db.execute(stmt_existing)).scalar_one_or_none()
                if not ua:
                    ua = UserAnswer(
                        session_progress_id=sp.id,
                        question_id=q.id,
                        selected_option_id=ans.selected_option_id,
                        is_correct=is_correct
                    )
                    self.db.add(ua)
                else:
                    ua.selected_option_id = ans.selected_option_id
                    ua.is_correct = is_correct

        # Dynamic Math Score for this Quiz Step:
        # (Correct Questions / Total Questions in step) * Step Weight
        if step_total_questions > 0:
            step_score_earned = round((step_correct_count / step_total_questions) * step_weight, 2)
        else:
            step_score_earned = 0.0

        # Calculate Total Accumulated Score across all questions answered in this session
        stmt_all_ua = select(UserAnswer).where(UserAnswer.session_progress_id == sp.id)
        all_ua_records = list((await self.db.execute(stmt_all_ua)).scalars().all())
        
        total_correct_in_session = sum(1 for ua in all_ua_records if ua.is_correct)
        total_questions_in_session = len(all_questions)
        
        if total_questions_in_session > 0:
            total_accumulated_score = round((total_correct_in_session / total_questions_in_session) * 100.0, 2)
        else:
            total_accumulated_score = 0.0

        sp.score = total_accumulated_score
        sp.time_spent_seconds += req.time_spent_seconds

        # Calculate step completion percent
        completed_percent = min(100.0, round((req.current_step / max(1, len(all_questions) + len(session.contents))) * 100.0, 1))

        return QuizStepSubmitResponse(
            quiz_group_id=req.quiz_group_id,
            step_correct_count=step_correct_count,
            step_total_questions=step_total_questions,
            step_score_earned=step_score_earned,
            step_weight_percent=step_weight,
            total_accumulated_score=total_accumulated_score,
            completed_percent=completed_percent
        )

    async def handle_session_timeout(
        self, session_id: int, user_id: int, req: SessionTimeoutRequest
    ) -> SessionTimeoutResponse:
        session = await self.get_session_detail(session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session)

        completed_percent = 0.0
        if req.total_steps > 0:
            completed_percent = min(100.0, round((req.current_step / req.total_steps) * 100.0, 1))

        sp.time_spent_seconds += req.time_spent_seconds
        sp.completed_at = datetime.utcnow()

        if completed_percent >= 100.0 and sp.score >= 70.0:
            sp.status = ProgressStatus.completed

        message = f"Batas waktu sesi ({session.duration_minutes} menit) telah berakhir. Anda menyelesaikan {completed_percent}% dari seluruh slide pembelajaran dengan skor {sp.score}%."

        return SessionTimeoutResponse(
            session_id=session_id,
            status=sp.status,
            completed_percent=completed_percent,
            final_score=sp.score,
            message=message
        )

    async def submit_session_quiz(
        self, session_id: int, user_id: int, req: SessionSubmitRequest
    ) -> SessionSubmitResponse:
        session = await self.get_session_detail(session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session)

        # 1. Fetch questions
        stmt_q = select(Question).options(selectinload(Question.options)).where(
            Question.session_id == session_id,
            Question.is_deleted == False
        )
        questions = list((await self.db.execute(stmt_q)).scalars().all())
        if not questions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sesi ini tidak memiliki soal kuis")

        total_questions = len(questions)
        correct_count = 0
        feedback_list: list[QuestionFeedback] = []
        user_answer_map = {ans.question_id: ans.selected_option_id for ans in req.answers}

        # Clear previous answers
        stmt_del = select(UserAnswer).where(UserAnswer.session_progress_id == sp.id)
        for ea in (await self.db.execute(stmt_del)).scalars().all():
            await self.db.delete(ea)

        # Evaluate each question
        for q in questions:
            correct_option = next((opt for opt in q.options if opt.is_correct), None)
            selected_opt_id = user_answer_map.get(q.id)

            is_correct = False
            if correct_option and selected_opt_id == correct_option.id:
                is_correct = True
                correct_count += 1

            self.db.add(UserAnswer(
                session_progress_id=sp.id,
                question_id=q.id,
                selected_option_id=selected_opt_id,
                is_correct=is_correct
            ))

            feedback_list.append(QuestionFeedback(
                question_id=q.id,
                selected_option_id=selected_opt_id or 0,
                is_correct=is_correct
            ))

        # Dynamic Math: Each question is (100 / total_questions)%
        final_score = round((correct_count / total_questions) * 100.0, 2)
        passed = final_score >= 70.0

        sp.score = final_score
        sp.time_spent_seconds += req.time_spent_seconds
        sp.completed_at = datetime.utcnow()
        if passed:
            sp.status = ProgressStatus.completed

        # Check Module Completion
        stmt_all_sess = select(ModuleSession).where(
            ModuleSession.module_id == session.module_id,
            ModuleSession.is_deleted == False
        )
        all_sessions = list((await self.db.execute(stmt_all_sess)).scalars().all())
        stmt_comp_sp = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == ump.id,
            SessionProgress.status == ProgressStatus.completed
        )
        completed_sp_count = len(list((await self.db.execute(stmt_comp_sp)).scalars().all()))

        if completed_sp_count >= len(all_sessions) and len(all_sessions) > 0:
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
            feedback=feedback_list,
            completed_percent=100.0
        )

    async def get_user_session_progress(self, session_id: int, user_id: int) -> SessionProgressResponse:
        session = await self.get_session_detail(session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session)

        duration_seconds = session.duration_minutes * 60
        now = datetime.utcnow()
        started_at = sp.started_at or now
        expires_at = started_at + timedelta(seconds=duration_seconds)
        remaining_seconds = max(0, int((expires_at - now).total_seconds()))
        is_expired = (remaining_seconds <= 0) and (sp.status != ProgressStatus.completed)

        return SessionProgressResponse(
            session_id=session_id,
            is_unlocked=True,
            is_completed=(sp.status == ProgressStatus.completed),
            score=sp.score,
            status=sp.status,
            remaining_seconds=remaining_seconds,
            is_expired=is_expired,
            completed_percent=100.0 if sp.status == ProgressStatus.completed else 0.0
        )

    async def update_watch_progress(self, content_id: int, user_id: int, req: WatchProgressRequest):
        stmt_c = select(SessionContent).where(SessionContent.id == content_id)
        content = (await self.db.execute(stmt_c)).scalar_one_or_none()
        if not content:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konten tidak ditemukan")
        session_item = await self.get_session_detail(content.session_id)
        ump, sp = await self.get_or_create_session_progress(user_id, session_item)

        stmt_wp = select(ContentWatchProgress).where(
            ContentWatchProgress.session_progress_id == sp.id,
            ContentWatchProgress.session_content_id == content_id
        )
        wp = (await self.db.execute(stmt_wp)).scalar_one_or_none()
        if not wp:
            wp = ContentWatchProgress(
                session_progress_id=sp.id,
                session_content_id=content_id,
                watched_percent=req.watched_percent,
                is_completed=req.is_completed
            )
            self.db.add(wp)
        else:
            wp.watched_percent = max(wp.watched_percent, req.watched_percent)
            if req.is_completed:
                wp.is_completed = True
