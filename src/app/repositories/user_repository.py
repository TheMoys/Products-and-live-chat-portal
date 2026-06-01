from app.models.user import User
from typing import List, Optional

class UserRepository:
    """Repositorio para operaciones de Usuario"""
    
    @staticmethod
    def create(username: str, email: str, password: str, role: str = 'user') -> User:
        """Crear nuevo usuario"""
        user = User(username=username, email=email, password=password, role=role)
        user.save()
        return user
    
    @staticmethod
    def get_by_id(user_id: str) -> Optional[User]:
        """Obtener usuario por ID"""
        return User.find_by_id(user_id)
    
    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """Obtener usuario por email"""
        return User.find_by_email(email)
    
    @staticmethod
    def get_by_username(username: str) -> Optional[User]:
        """Obtener usuario por username"""
        return User.find_by_username(username)
    
    @staticmethod
    def get_all(search: str = None, role: str = None, skip: int = 0, limit: int = 0) -> List[User]:
        """Obtener todos los usuarios con filtros opcionales"""
        query = {}
        
        if search:
            query['$or'] = [
                {'username': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}}
            ]
        
        if role:
            query['role'] = role
        
        return User.find_all(query, skip, limit)
    
    @staticmethod
    def update(user_id: str, data: dict) -> bool:
        """Actualizar usuario"""
        user = User.find_by_id(user_id)
        if not user:
            return False
        user.update_in_db(data)
        return True
    
    @staticmethod
    def delete(user_id: str) -> bool:
        """Eliminar usuario"""
        return User.delete_by_id(user_id)
    
    @staticmethod
    def count_all(role: str = None) -> int:
        """Contar usuarios totales"""
        query = {}
        if role:
            query['role'] = role
        return User.count(query)
    
    @staticmethod
    def count_recent(days: int = 30) -> int:
        """Contar usuarios creados en los últimos N días"""
        from datetime import datetime, timedelta
        threshold = datetime.utcnow() - timedelta(days=days)
        return User.count({'createdAt': {'$gte': threshold}})
