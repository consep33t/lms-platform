import json
import logging
import asyncio
from typing import Dict, List
from fastapi import WebSocket
from app.core.config import settings

try:
    from redis.asyncio import Redis
except ImportError:
    Redis = None

logger = logging.getLogger(__name__)

class RealtimeConnectionManager:
    def __init__(self):
        # channel_name -> list of websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Redis client for pub/sub (fallback/scaling)
        self.redis = None
        self.pubsub = None
        self._listening_task = None
        self._init_redis()

    def _init_redis(self):
        if Redis is None:
            return
        try:
            self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.error(f"Failed to initialize Redis for WebSocket: {e}")


    async def start_listening(self):
        if self.redis and not self.pubsub:
            try:
                self.pubsub = self.redis.pubsub()
                await self.pubsub.psubscribe("realtime:*")
                self._listening_task = asyncio.create_task(self._listen_to_redis())
            except Exception as e:
                logger.error(f"Failed to start Redis listener: {e}")

    async def stop_listening(self):
        if self.pubsub:
            await self.pubsub.punsubscribe("realtime:*")
            await self.pubsub.close()
            self.pubsub = None
        if self._listening_task:
            self._listening_task.cancel()
            self._listening_task = None

    async def _listen_to_redis(self):
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "pmessage":
                    channel = message["channel"].replace("realtime:", "")
                    try:
                        data = json.loads(message["data"])
                    except json.JSONDecodeError:
                        data = message["data"]
                    await self._local_broadcast(channel, data)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Redis listening error: {e}")

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"WebSocket connected to {channel}. Total in channel: {len(self.active_connections[channel])}")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]
            logger.info(f"WebSocket disconnected from {channel}.")

    async def _local_broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            # Create a copy of the list to iterate over
            connections = list(self.active_connections[channel])
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Error sending to websocket on channel {channel}: {e}")
                    self.disconnect(connection, channel)

    async def broadcast(self, channel: str, message: dict):
        # Broadcast locally first
        await self._local_broadcast(channel, message)
        
        # Then publish to Redis for other workers
        if self.redis:
            try:
                await self.redis.publish(f"realtime:{channel}", json.dumps(message))
            except Exception as e:
                logger.error(f"Redis publish error: {e}")

    def get_channel_count(self, channel: str) -> int:
        return len(self.active_connections.get(channel, []))

# Singleton instance
manager = RealtimeConnectionManager()
