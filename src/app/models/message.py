from datetime import datetime
from bson import ObjectId
from app.config import settings

db = settings.get_db()
messages_collection = db['messages']
messages_collection.create_index('createdAt', -1)

class Message:
    def __init__(self, user_id: str, username: str, text: str, _id: str = None):
        self._id = _id
        self.user = ObjectId(user_id)
        self.username = username
        self.text = text
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            '_id': str(self._id) if self._id else None,
            'user': str(self.user),
            'username': self.username,
            'text': self.text,
            'createdAt': self.created_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        msg = Message(
            user_id=str(data['user']) if isinstance(data['user'], ObjectId) else data['user'],
            username=data.get('username', ''),
            text=data.get('text', ''),
            _id=str(data['_id']) if isinstance(data.get('_id'), ObjectId) else data.get('_id')
        )
        msg.created_at = data.get('createdAt', datetime.utcnow())
        return msg

    async def save(self):
        doc = self.to_dict()
        result = messages_collection.insert_one(doc)
        self._id = str(result.inserted_id)
        return True

    @staticmethod
    def find_recent(limit: int = 50):
        docs = list(messages_collection.find().sort('createdAt', -1).limit(limit))
        return [Message.from_dict(doc) for doc in reversed(docs)]

    @staticmethod
    def find_all():
        docs = list(messages_collection.find().sort('createdAt', -1))
        return [Message.from_dict(doc) for doc in reversed(docs)]

    @staticmethod
    def delete_by_id(msg_id: str):
        result = messages_collection.delete_one({'_id': ObjectId(msg_id)})
        return result.deleted_count > 0