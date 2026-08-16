import json
from typing import Dict, List, Any

class RealtimeConnectionManager:
    def __init__(self):
        # channel_name -> list of connections
        self.active_connections: Dict[str, List[Any]] = {}

    async def connect(self, websocket: Any, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: Any, channel: str):
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

    def get_connection_count(self, channel: str) -> int:
        return len(self.active_connections.get(channel, []))

    async def broadcast(self, message: dict, channel: str):
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                await connection.send_text(json.dumps(message))
