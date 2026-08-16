from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.study_room import StudyRoom, StudyRoomMember, StudyRoomMessage
from app.schemas.study_room import StudyRoomCreate, StudyRoomMessageCreate

class StudyRoomService:
    async def create_room(self, db: AsyncSession, room_data: StudyRoomCreate, user_id: int) -> StudyRoom:
        room = StudyRoom(
            **room_data.model_dump(),
            created_by=user_id
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)
        
        # Add creator as member
        member = StudyRoomMember(
            room_id=room.id,
            user_id=user_id,
            role="admin"
        )
        db.add(member)
        await db.commit()
        return room
        
    async def list_rooms(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Tuple[List[StudyRoom], int]:
        query = select(StudyRoom).where(StudyRoom.is_deleted == False).offset(skip).limit(limit)
        result = await db.execute(query)
        rooms = result.scalars().all()
        
        count_query = select(func.count(StudyRoom.id)).where(StudyRoom.is_deleted == False)
        count_result = await db.execute(count_query)
        total = count_result.scalar_one_or_none() or 0
        
        return rooms, total

    async def get_room(self, db: AsyncSession, room_id: int) -> StudyRoom | None:
        query = select(StudyRoom).where(StudyRoom.id == room_id, StudyRoom.is_deleted == False)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def join_room(self, db: AsyncSession, room_id: int, user_id: int) -> StudyRoomMember:
        # Check if already a member
        query = select(StudyRoomMember).where(
            StudyRoomMember.room_id == room_id,
            StudyRoomMember.user_id == user_id
        )
        result = await db.execute(query)
        member = result.scalar_one_or_none()
        
        if member:
            return member
            
        member = StudyRoomMember(room_id=room_id, user_id=user_id, role="member")
        db.add(member)
        await db.commit()
        await db.refresh(member)
        return member

    async def leave_room(self, db: AsyncSession, room_id: int, user_id: int):
        query = select(StudyRoomMember).where(
            StudyRoomMember.room_id == room_id,
            StudyRoomMember.user_id == user_id
        )
        result = await db.execute(query)
        member = result.scalar_one_or_none()
        if member:
            db.delete(member)
            await db.commit()
            
    async def post_message(self, db: AsyncSession, message_data: StudyRoomMessageCreate, user_id: int) -> StudyRoomMessage:
        message = StudyRoomMessage(
            room_id=message_data.room_id,
            user_id=user_id,
            message_text=message_data.message_text,
            message_type=message_data.message_type
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message

    async def get_messages(self, db: AsyncSession, room_id: int, skip: int = 0, limit: int = 50) -> List[StudyRoomMessage]:
        query = select(StudyRoomMessage).where(StudyRoomMessage.room_id == room_id).order_by(StudyRoomMessage.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        messages = result.scalars().all()
        # Return in ascending order for chat history
        return list(reversed(messages))

study_room_service = StudyRoomService()
