from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.config import settings
from app.security.jwt import PasswordHandler

# Conexión a MongoDB
client = MongoClient(settings.mongodb_uri)
db = client.get_database()

class User:
    """Modelo de Usuario en MongoDB"""
    
    collection = db['users']
    
    def __init__(self, username: str, email: str, password: str, role: str = 'user', 
                 is_active: bool = True, _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.username = username
        self.email = email.lower()
        self.password = PasswordHandler.hash_password(password)  # Hashear al crear
        self.role = role
        self.isActive = is_active
        self.createdAt = datetime.utcnow()
        self.updatedAt = datetime.utcnow()
    
    def to_dict(self, include_password: bool = False):
        """Convertir a diccionario para JSON"""
        doc = {
            '_id': str(self._id),
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'isActive': self.isActive,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }
        if include_password:
            doc['password'] = self.password
        return doc
    
    @classmethod
    def from_dict(cls, data: dict):
        """Crear instancia desde diccionario"""
        doc = data.copy()
        _id = doc.pop('_id', None)
        if _id and isinstance(_id, str):
            _id = ObjectId(_id)
        
        user = cls(
            username=doc.get('username'),
            email=doc.get('email'),
            password=doc.get('password'),
            role=doc.get('role', 'user'),
            is_active=doc.get('isActive', True),
            _id=_id
        )
        # No hashear nuevamente si la contraseña ya está hasheada
        if _id:  # Si viene de DB, ya está hasheada
            user.password = doc.get('password')
        user.createdAt = doc.get('createdAt', datetime.utcnow())
        user.updatedAt = doc.get('updatedAt', datetime.utcnow())
        return user
    
    def save(self):
        """Guardar usuario en BD"""
        self.updatedAt = datetime.utcnow()
        result = self.collection.insert_one(self.to_dict(include_password=True))
        self._id = result.inserted_id
        return self
    
    def update_in_db(self, data: dict):
        """Actualizar usuario en BD"""
        self.updatedAt = datetime.utcnow()
        update_data = {k: v for k, v in data.items() if v is not None}
        
        # Hashear contraseña si se proporciona
        if 'password' in update_data:
            update_data['password'] = PasswordHandler.hash_password(update_data['password'])
        
        self.collection.update_one(
            {'_id': self._id},
            {'$set': update_data}
        )
    
    @classmethod
    def find_by_id(cls, user_id: str):
        """Buscar usuario por ID"""
        try:
            obj_id = ObjectId(user_id)
            doc = cls.collection.find_one({'_id': obj_id})
            return cls.from_dict(doc) if doc else None
        except:
            return None
    
    @classmethod
    def find_by_email(cls, email: str):
        """Buscar usuario por email"""
        doc = cls.collection.find_one({'email': email.lower()})
        return cls.from_dict(doc) if doc else None
    
    @classmethod
    def find_by_username(cls, username: str):
        """Buscar usuario por username"""
        doc = cls.collection.find_one({'username': username})
        return cls.from_dict(doc) if doc else None
    
    @classmethod
    def find_one(cls, query: dict):
        """Buscar un usuario con filtro personalizado"""
        doc = cls.collection.find_one(query)
        return cls.from_dict(doc) if doc else None
    
    @classmethod
    def find_all(cls, query: dict = None, skip: int = 0, limit: int = 0):
        """Obtener todos los usuarios con filtro opcional"""
        query = query or {}
        docs = list(cls.collection.find(query).sort('createdAt', -1).skip(skip).limit(limit))
        return [cls.from_dict(doc) for doc in docs]
    
    @classmethod
    def count(cls, query: dict = None):
        """Contar documentos"""
        query = query or {}
        return cls.collection.count_documents(query)
    
    @classmethod
    def delete_by_id(cls, user_id: str):
        """Eliminar usuario por ID"""
        try:
            obj_id = ObjectId(user_id)
            result = cls.collection.delete_one({'_id': obj_id})
            return result.deleted_count > 0
        except:
            return False
