from pydantic_settings import BaseSettings
from typing import Optional
import os

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
