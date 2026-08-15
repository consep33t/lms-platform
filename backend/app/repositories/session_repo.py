from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentWatchProgress
from app.models.question import Question, QuestionOption
from app.models.progress import SessionProgress, UserAnswer, ProgressStatus


class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, session_id: int) -> ModuleSession | None:
        stmt = (
            select(ModuleSession)
            .options(
                selectinload(ModuleSession.contents),
                selectinload(ModuleSession.questions).selectinload(Question.options)
            )
            .where(ModuleSession.id == session_id, ModuleSession.is_deleted == False)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_or_create_session_progress(self, user_module_progress_id: int, session_id: int) -> SessionProgress:
        stmt = select(SessionProgress).where(
            SessionProgress.user_module_progress_id == user_module_progress_id,
            SessionProgress.session_id == session_id
        )
        res = await self.db.execute(stmt)
        prog = res.scalar_one_or_none()
        if not prog:
            prog = SessionProgress(
                user_module_progress_id=user_module_progress_id,
                session_id=session_id,
                status=ProgressStatus.in_progress
            )
            self.db.add(prog)
            await self.db.flush()
        return prog
