import pytest
from datetime import datetime, timezone
from app.schemas.pwa import OfflineSyncBatchRequest, PushSubscriptionCreate, OfflineSyncEvent
from app.services.pwa_service import PWAService
from unittest.mock import AsyncMock

def test_offline_sync_batch_request_schema():
    payload = {
        "events": [
            {
                "id": "event-1",
                "type": "progress_heartbeat",
                "timestamp": "2026-08-16T12:00:00Z",
                "payload": {"progress": 50}
            },
            {
                "id": "event-2",
                "type": "note_save",
                "timestamp": "2026-08-16T12:05:00Z",
                "payload": {"note": "hello"}
            },
            {
                "id": "event-3",
                "type": "quiz_answer",
                "timestamp": "2026-08-16T12:10:00Z",
                "payload": {"question_id": 1, "answer": "A"}
            }
        ]
    }
    
    req = OfflineSyncBatchRequest(**payload)
    assert len(req.events) == 3
    assert req.events[0].type == "progress_heartbeat"
    assert req.events[1].type == "note_save"
    assert req.events[2].type == "quiz_answer"

def test_push_subscription_create_schema():
    payload = {
        "endpoint": "https://push.example.com/xyz",
        "p256dh": "mock_p256dh_key",
        "auth": "mock_auth_key"
    }
    
    req = PushSubscriptionCreate(**payload)
    assert req.endpoint == "https://push.example.com/xyz"
    assert req.p256dh == "mock_p256dh_key"
    assert req.auth == "mock_auth_key"

@pytest.mark.asyncio
async def test_process_offline_sync_batch():
    db = AsyncMock()
    service = PWAService(db)
    
    events = [
        OfflineSyncEvent(
            id="evt1",
            type="heartbeat",
            timestamp=datetime.now(timezone.utc),
            payload={}
        ),
        OfflineSyncEvent(
            id="evt2",
            type="note",
            timestamp=datetime.now(timezone.utc),
            payload={}
        ),
        OfflineSyncEvent(
            id="evt3",
            type="quiz_answer",
            timestamp=datetime.now(timezone.utc),
            payload={}
        )
    ]
    
    res = await service.process_offline_sync_batch(user_id=1, events=events)
    assert res["processed_count"] == 3
    assert res["failed_count"] == 0
    assert res["errors"] is None
