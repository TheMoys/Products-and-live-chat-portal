from pymongo import MongoClient
from app.config import settings

# Conexión a MongoDB
client = MongoClient(settings.mongodb_uri)
db = client.get_database()

class BaseModel:
    """Clase base para modelos de MongoDB"""
    
    def __init__(self, collection_name: str):
        self.collection = db[collection_name]
    
    def to_dict(self):
        """Convertir documento a diccionario (excepto _id si es ObjectId)"""
        doc = dict(self.__dict__)
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])  # Convertir ObjectId a string
        return doc
