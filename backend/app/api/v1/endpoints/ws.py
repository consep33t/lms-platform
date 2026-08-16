import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import manager
from app.core.security import decode_token

router = APIRouter()

async def get_user_from_token(token: str):
    if not token:
        return None
    try:
        payload = decode_token(token)
        return int(payload.get("sub"))
    except Exception:
        return None

@router.websocket("/session/{session_id}")
async def session_websocket(websocket: WebSocket, session_id: int, token: str = Query(None)):
    user_id = await get_user_from_token(token)
    channel = f"session:{session_id}:presence"
    disc_channel = f"session:{session_id}:discussions"
    
    await manager.connect(websocket, channel)
    await manager.connect(websocket, disc_channel)
    
    if user_id:
        await manager.broadcast(channel, {
            "type": "presence",
            "action": "join",
            "user_id": user_id,
            "session_id": session_id
        })
        
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # relay discussion updates
                if msg.get("type") == "discussion":
                    await manager.broadcast(disc_channel, {
                        "type": "discussion",
                        "data": msg.get("data"),
                        "user_id": user_id
                    })
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
        manager.disconnect(websocket, disc_channel)
        if user_id:
            await manager.broadcast(channel, {
                "type": "presence",
                "action": "leave",
                "user_id": user_id,
                "session_id": session_id
            })

@router.websocket("/study-rooms/{room_id}")
async def study_room_websocket(websocket: WebSocket, room_id: int, token: str = Query(None)):
    user_id = await get_user_from_token(token)
    channel = f"room:{room_id}"
    
    await manager.connect(websocket, channel)
    
    if user_id:
        await manager.broadcast(channel, {
            "type": "presence",
            "action": "join",
            "user_id": user_id,
            "room_id": room_id
        })
        
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "chat":
                    await manager.broadcast(channel, {
                        "type": "chat",
                        "message": msg.get("message"),
                        "user_id": user_id,
                        "room_id": room_id
                    })
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
        if user_id:
            await manager.broadcast(channel, {
                "type": "presence",
                "action": "leave",
                "user_id": user_id,
                "room_id": room_id
            })
