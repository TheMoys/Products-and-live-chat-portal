from app.repositories.user_repository import UserRepository
from typing import List, Optional

class UserService:
    """Servicio de gestión de usuarios"""
    
    @staticmethod
    def get_user(user_id: str) -> Optional[dict]:
        """Obtener usuario por ID"""
        user = UserRepository.get_by_id(user_id)
        return user.to_dict() if user else None
    
    @staticmethod
    def get_all_users(search: str = None, role: str = None) -> List[dict]:
        """Obtener todos los usuarios"""
        users = UserRepository.get_all(search=search, role=role)
        return [user.to_dict() for user in users]
    
    @staticmethod
    def update_user(user_id: str, data: dict) -> Optional[dict]:
        """Actualizar usuario"""
        # Validar que no exista otro usuario con el mismo email/username
        user = UserRepository.get_by_id(user_id)
        if not user:
            return None
        
        if 'username' in data:
            existing = UserRepository.get_by_username(data['username'])
            if existing and str(existing._id) != user_id:
                raise ValueError("Username already exists")
        
        if 'email' in data:
            existing = UserRepository.get_by_email(data['email'])
            if existing and str(existing._id) != user_id:
                raise ValueError("Email already exists")
        
        UserRepository.update(user_id, data)
        return UserRepository.get_by_id(user_id).to_dict()
    
    @staticmethod
    def delete_user(user_id: str) -> bool:
        """Eliminar usuario"""
        return UserRepository.delete(user_id)
    
    @staticmethod
    def get_stats() -> dict:
        """Obtener estadísticas de usuarios"""
        total = UserRepository.count_all()
        admins = UserRepository.count_all(role='admin')
        regular_users = total - admins
        new_users = UserRepository.count_recent(days=30)
        
        return {
            'total': total,
            'admins': admins,
            'regularUsers': regular_users,
            'newUsers': new_users
        }
