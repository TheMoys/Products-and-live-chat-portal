from app.repositories.user_repository import UserRepository
from app.security.jwt import JWTHandler, PasswordHandler
from app.config import settings
from typing import Optional, Tuple

class AuthService:
    """Servicio de autenticación"""
    
    @staticmethod
    def register(username: str, email: str, password: str, admin_code: Optional[str] = None) -> Tuple[str, dict]:
        """Registrar nuevo usuario"""
        # Validar que no exista
        if UserRepository.get_by_email(email) or UserRepository.get_by_username(username):
            raise ValueError("User already exists")
        
        # Determinar rol
        role = 'admin' if admin_code == settings.admin_code else 'user'
        
        # Hashear contraseña AQUÍ, antes de pasarla al modelo
        hashed_password = PasswordHandler.hash_password(password)
        
        # Crear usuario con contraseña ya hasheada
        user = UserRepository.create(username, email, hashed_password, role)
        
        # Generar token
        token = JWTHandler.create_token(str(user._id))
        
        return token, user.to_dict()
    
    @staticmethod
    def login(email_or_username: str, password: str) -> Tuple[str, dict]:
        """Login de usuario"""
        # Buscar usuario
        user = UserRepository.get_by_email(email_or_username) or UserRepository.get_by_username(email_or_username)
        
        if not user:
            raise ValueError("Invalid credentials")
        
        # Verificar contraseña
        if not PasswordHandler.verify_password(password, user.password):
            raise ValueError("Invalid credentials")
        
        # Generar token
        token = JWTHandler.create_token(str(user._id))
        
        return token, user.to_dict()
    
    @staticmethod
    def verify_token(token: str) -> Optional[str]:
        """Verificar token y retornar user_id"""
        payload = JWTHandler.verify_token(token)
        return payload.get('id') if payload else None