from socketio import AsyncServer
from fastapi import FastAPI

sio = AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['*'],
    ping_timeout=60,
    ping_interval=25
)

def create_socketio_app(app: FastAPI):
    """Envuelve la app FastAPI con Socket.io"""
    return sio.attach(app)