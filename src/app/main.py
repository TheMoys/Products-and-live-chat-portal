from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, products, orders, cart, chat
from app.config import settings
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema
from app.socketio_config import sio
import json

# Crear aplicación FastAPI
app = FastAPI(
    title="Products and Live Chat Portal",
    version="2.0.0",
    description="Backend en Python con FastAPI"
)

# Envolver con Socket.io
app.sio = sio

# GraphQL
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://frontend:5173",
        "http://backend:3000",
        "http://0.0.0.0:5173",
        "http://0.0.0.0:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "cors": "enabled"
    }

# Socket.io events
@sio.event
async def connect(sid, environ, auth):
    print(f"Cliente conectado: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Cliente desconectado: {sid}")

@sio.event
async def message(sid, data):
    print(f"Mensaje recibido: {data}")
    await sio.emit('message', data, broadcast=True)

# Incluir routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)