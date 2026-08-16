from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.study_room import StudyRoomCreate, StudyRoomResponse, StudyRoomListResponse, StudyRoomMessageCreate, StudyRoomMessageResponse
from app.services.study_room_service import study_room_service
from app.core.websocket import manager

router = APIRouter()

@router.post("", response_model=StudyRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_study_room(
    room_in: StudyRoomCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return await study_room_service.create_room(db, room_in, user_id)

@router.get("", response_model=StudyRoomListResponse)
async def list_study_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    rooms, total = await study_room_service.list_rooms(db, skip=skip, limit=limit)
    return {"items": rooms, "total": total}

@router.post("/{room_id}/join", status_code=status.HTTP_200_OK)
async def join_study_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    room = await study_room_service.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")
        
    await study_room_service.join_room(db, room_id, user_id)
    return {"message": "Joined room successfully"}

@router.post("/{room_id}/leave", status_code=status.HTTP_200_OK)
async def leave_study_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    await study_room_service.leave_room(db, room_id, user_id)
    return {"message": "Left room successfully"}

@router.post("/{room_id}/messages", response_model=StudyRoomMessageResponse)
async def post_message(
    room_id: int,
    message_in: StudyRoomMessageCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if message_in.room_id != room_id:
        raise HTTPException(status_code=400, detail="Room ID mismatch")
        
    message = await study_room_service.post_message(db, message_in, user_id)
    
    # Broadcast new message to the room via websocket
    await manager.broadcast(f"room:{room_id}", {
        "type": "chat",
        "id": message.id,
        "message_text": message.message_text,
        "message_type": message.message_type,
        "user_id": user_id,
        "created_at": message.created_at.isoformat()
    })
    
    return message

@router.get("/{room_id}/messages", response_model=List[StudyRoomMessageResponse])
async def get_messages(
    room_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Depending on rules, you might check if user_id is a member here.
    return await study_room_service.get_messages(db, room_id, skip, limit)
