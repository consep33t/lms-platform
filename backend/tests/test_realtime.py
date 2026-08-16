import pytest
import json
import sys
from unittest.mock import MagicMock

# Mock redis before importing app.core.websocket
sys.modules['redis'] = MagicMock()
sys.modules['redis.asyncio'] = MagicMock()

from app.core.websocket import RealtimeConnectionManager

class MockWebsocket:
    def __init__(self):
        self.accepted = False
        self.sent_messages = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, data: dict):
        self.sent_messages.append(data)

@pytest.fixture
def ws_manager():
    manager = RealtimeConnectionManager()
    manager.redis = None # Disable redis for local tests
    return manager

@pytest.mark.asyncio
async def test_channel_registration(ws_manager):
    ws = MockWebsocket()
    await ws_manager.connect(ws, "room_1")
    assert ws.accepted is True
    assert ws_manager.get_channel_count("room_1") == 1
    
    ws_manager.disconnect(ws, "room_1")
    assert ws_manager.get_channel_count("room_1") == 0

@pytest.mark.asyncio
async def test_connection_counting(ws_manager):
    ws1 = MockWebsocket()
    ws2 = MockWebsocket()
    
    await ws_manager.connect(ws1, "room_1")
    await ws_manager.connect(ws2, "room_1")
    
    assert ws_manager.get_channel_count("room_1") == 2
    
    ws_manager.disconnect(ws1, "room_1")
    assert ws_manager.get_channel_count("room_1") == 1
    ws_manager.disconnect(ws2, "room_1")
    assert ws_manager.get_channel_count("room_1") == 0

@pytest.mark.asyncio
async def test_broadcast_message_payloads(ws_manager):
    ws1 = MockWebsocket()
    ws2 = MockWebsocket()
    
    await ws_manager.connect(ws1, "room_broadcast")
    await ws_manager.connect(ws2, "room_broadcast")
    
    payload = {"user": "Alice", "msg": "Hi!"}
    await ws_manager.broadcast("room_broadcast", payload)
    
    assert ws1.sent_messages == [payload]
    assert ws2.sent_messages == [payload]
