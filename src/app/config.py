from pydantic_settings import BaseSettings
from typing import Optional
import os
from pymongo import MongoClient

class Settings(BaseSettings):
    """Configuración de la aplicación desde variables de entorno"""
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://uneat-mongodb:27017/portal-productos")
    jwt_secret: str = os.getenv("JWT_SECRET", "tu_clave_super_secreta_cambiame")
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 12 * 60 * 60  # 12 horas en segundos
    admin_code: str = os.getenv("ADMIN_CODE", "admin1234")
    port: int = int(os.getenv("PORT", 3000))
    
    class Config:
        env_file = ".env"

settings = Settings()

# Conexión a MongoDB
_mongodb_client = None

def get_mongodb_client():
    global _mongodb_client
    if _mongodb_client is None:
        _mongodb_client = MongoClient(settings.mongodb_uri)
    return _mongodb_client

def get_db():
    client = get_mongodb_client()
    return client.get_database()