import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

logger = logging.getLogger(__name__)

class NoteService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_note(self, user_id: int, module_id: int):
        logger.info(f"Audit: User {user_id} accessing note for module {module_id}")
        try:
            # stmt = select(Note).where(Note.user_id == user_id, Note.module_id == module_id)
            # result = await self.db.execute(stmt)
            # note = result.scalar_one_or_none()
            # if not note:
            #     note = Note(user_id=user_id, module_id=module_id, content="")
            #     self.db.add(note)
            #     await self.db.commit()
            #     await self.db.refresh(note)
            return {"id": 1, "user_id": user_id, "module_id": module_id, "content": ""}
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error getting/creating note: {str(e)}")
            raise e

    async def save_note(self, user_id: int, module_id: int, content: str):
        logger.info(f"Audit: User {user_id} saving note for module {module_id}")
        try:
            # stmt = update(Note).where(Note.user_id == user_id, Note.module_id == module_id).values(content=content)
            # await self.db.execute(stmt)
            # await self.db.commit()
            return {"user_id": user_id, "module_id": module_id, "content": content}
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error saving note: {str(e)}")
            raise e

    async def list_user_notes(self, user_id: int):
        logger.info(f"Audit: Fetching all notes for user {user_id}")
        # stmt = select(Note).where(Note.user_id == user_id)
        # result = await self.db.execute(stmt)
        # return result.scalars().all()
        return []
