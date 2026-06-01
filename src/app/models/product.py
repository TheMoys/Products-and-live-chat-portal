from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.config import settings

# Conexión a MongoDB
client = MongoClient(settings.mongodb_uri)
db = client.get_database()

class Product:
    """Modelo de Producto en MongoDB"""
    
    collection = db['products']
    
    def __init__(self, title: str, price: float, description: str = None,
                 stock: int = 0, image_url: str = None, image_data: str = None,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.title = title
        self.description = description
        self.price = float(price)
        self.stock = int(stock)
        self.imageUrl = image_url
        self.imageData = image_data
        self.createdAt = datetime.utcnow()
        self.updatedAt = datetime.utcnow()
    
    def to_dict(self):
        """Convertir a diccionario para JSON"""
        return {
            '_id': str(self._id),
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'imageUrl': self.imageUrl,
            'imageData': self.imageData,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """Crear instancia desde diccionario"""
        doc = data.copy()
        _id = doc.pop('_id', None)
        if _id and isinstance(_id, str):
            _id = ObjectId(_id)
        
        product = cls(
            title=doc.get('title'),
            price=doc.get('price'),
            description=doc.get('description'),
            stock=doc.get('stock', 0),
            image_url=doc.get('imageUrl'),
            image_data=doc.get('imageData'),
            _id=_id
        )
        product.createdAt = doc.get('createdAt', datetime.utcnow())
        product.updatedAt = doc.get('updatedAt', datetime.utcnow())
        return product
    
    def save(self):
        """Guardar producto en BD"""
        result = self.collection.insert_one(self.to_dict())
        self._id = result.inserted_id
        return self
    
    def update_in_db(self, data: dict):
        """Actualizar producto en BD"""
        self.updatedAt = datetime.utcnow()
        update_data = {k: v for k, v in data.items() if v is not None}
        
        # Convertir nombres de campos de camelCase a snake_case si es necesario
        if 'imageUrl' in update_data:
            update_data['imageUrl'] = update_data.pop('imageUrl')
        if 'imageData' in update_data:
            update_data['imageData'] = update_data.pop('imageData')
        
        self.collection.update_one(
            {'_id': self._id},
            {'$set': update_data}
        )
    
    @classmethod
    def find_by_id(cls, product_id: str):
        """Buscar producto por ID"""
        try:
            obj_id = ObjectId(product_id)
            doc = cls.collection.find_one({'_id': obj_id})
            return cls.from_dict(doc) if doc else None
        except:
            return None
    
    @classmethod
    def find_all(cls, query: dict = None, skip: int = 0, limit: int = 0):
        """Obtener todos los productos con filtro opcional"""
        query = query or {}
        docs = list(cls.collection.find(query).sort('createdAt', -1).skip(skip).limit(limit))
        return [cls.from_dict(doc) for doc in docs]
    
    @classmethod
    def count(cls, query: dict = None):
        """Contar documentos"""
        query = query or {}
        return cls.collection.count_documents(query)
    
    @classmethod
    def delete_by_id(cls, product_id: str):
        """Eliminar producto por ID"""
        try:
            obj_id = ObjectId(product_id)
            result = cls.collection.delete_one({'_id': obj_id})
            return result.deleted_count > 0
        except:
            return False