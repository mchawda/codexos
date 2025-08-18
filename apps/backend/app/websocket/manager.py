# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""WebSocket connection manager for real-time updates"""

from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections for real-time agent execution updates"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients"""
        for client_id, websocket in self.active_connections.items():
            await websocket.send_text(message)


# Global connection manager instance
manager = ConnectionManager()
