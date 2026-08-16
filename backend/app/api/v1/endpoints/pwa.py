from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.schemas.pwa import (
    PushSubscriptionCreate,
    PushSubscriptionResponse,
    OfflineSyncBatchRequest,
    OfflineSyncBatchResponse,
    VapidKeyResponse
)
from app.services.pwa_service import PWAService
from app.core.database import get_db
from app.core.dependencies import get_current_user_id

router = APIRouter()

@router.get("/vapid-public-key", response_model=VapidKeyResponse)
async def get_vapid_public_key(
    db: AsyncSession = Depends(get_db)
) -> Any:
    service = PWAService(db)
    return {"public_key": service.get_vapid_public_key()}

@router.post("/push/subscribe", response_model=PushSubscriptionResponse)
async def subscribe_push(
    sub_in: PushSubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    service = PWAService(db)
    result = await service.subscribe_user_push(
        user_id=current_user_id,
        endpoint=sub_in.endpoint,
        p256dh=sub_in.p256dh,
        auth_key=sub_in.auth
    )
    return result

@router.post("/push/unsubscribe")
async def unsubscribe_push(
    endpoint: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    service = PWAService(db)
    await service.unsubscribe_user_push(endpoint=endpoint)
    return {"msg": "Unsubscribed successfully"}

@router.post("/sync/batch", response_model=OfflineSyncBatchResponse)
async def sync_batch(
    req_in: OfflineSyncBatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    service = PWAService(db)
    result = await service.process_offline_sync_batch(
        user_id=current_user_id,
        events=req_in.events
    )
    return result
