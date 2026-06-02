from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, products, orders, cart, chat
from app.config import settings
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema
from app.socketio_config import sio
import socketio  # Necesario para el adaptador ASGI
import json

# 1. Definir dependencias y contextos PRIMERO
async def get_graphql_context(request: Request):
    """Obtener contexto de autenticación para GraphQL"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = None
    
    if token:
        from app.security.jwt import JWTHandler
        try:
            # Recibimos el payload completo (el diccionario)
            token_payload = JWTHandler.verify_token(token)
            
            # Verificamos que sea un diccionario y extraemos el ID
            if isinstance(token_payload, dict):
                user_id = token_payload.get("id")
        except Exception as e:
            print(f"Error extrayendo ID del token: {e}")
            pass
    
    return {"user_id": user_id, "request": request}

# 2. Crear aplicación FastAPI
app = FastAPI(
    title="Products and Live Chat Portal",
    version="2.0.0",
    description="Backend en Python con FastAPI"
)

# 3. Configurar CORS
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

# 4. Configurar e incluir GraphQL (Una sola vez, con contexto)
graphql_app = GraphQLRouter(schema, context_getter=get_graphql_context)
app.include_router(graphql_app, prefix="/graphql")

# 5. Incluir routers REST
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(chat.router)

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

# 6. Integración ASGI correcta para Socket.IO y FastAPI
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    # IMPORTANTE: Debemos correr 'socket_app', no 'app'
    uvicorn.run(socket_app, host="0.0.0.0", port=settings.port)