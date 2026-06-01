from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

# Configurar contexto de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class JWTHandler:
    """Manejador de JWT para autenticación"""
    
    @staticmethod
    def create_token(user_id: str, expires_delta: int = None) -> str:
        """Crear un token JWT para un usuario"""
        if expires_delta is None:
            expires_delta = settings.jwt_expires_in
        
        expire = datetime.utcnow() + timedelta(seconds=expires_delta)
        to_encode = {"id": user_id, "exp": expire}
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verificar y decodificar un token JWT"""
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm]
            )
            user_id: str = payload.get("id")
            if user_id is None:
                return None
            return {"id": user_id}
        except JWTError:
            return None

class PasswordHandler:
    """Manejador de contraseñas con bcrypt"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashear una contraseña"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verificar una contraseña contra su hash"""
        return pwd_context.verify(plain_password, hashed_password)
