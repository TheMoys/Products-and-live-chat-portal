from datetime import datetime
from bson import ObjectId
from app.config import settings

db = settings.get_db()
carts_collection = db['carts']

class Cart:
    def __init__(self, user_id: str, items: list = None, _id: str = None):
        self._id = _id
        self.user = ObjectId(user_id)
        self.items = items or []  # List of {product_id, title, quantity, price}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            '_id': str(self._id) if self._id else None,
            'user': str(self.user),
            'items': [
                {
                    'product': str(item['product']) if isinstance(item['product'], ObjectId) else item['product'],
                    'title': item['title'],
                    'quantity': item['quantity'],
                    'price': item['price']
                }
                for item in self.items
            ],
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        cart = Cart(
            user_id=str(data['user']) if isinstance(data['user'], ObjectId) else data['user'],
            items=data.get('items', []),
            _id=str(data['_id']) if isinstance(data.get('_id'), ObjectId) else data.get('_id')
        )
        cart.created_at = data.get('createdAt', datetime.utcnow())
        cart.updated_at = data.get('updatedAt', datetime.utcnow())
        return cart

    async def save(self):
        doc = self.to_dict()
        if self._id:
            result = carts_collection.update_one({'_id': ObjectId(self._id)}, {'$set': doc})
            return result.matched_count > 0
        else:
            result = carts_collection.insert_one(doc)
            self._id = str(result.inserted_id)
            return True

    @staticmethod
    def find_by_user(user_id: str):
        doc = carts_collection.find_one({'user': ObjectId(user_id)})
        return Cart.from_dict(doc) if doc else None

    @staticmethod
    def find_by_id(cart_id: str):
        doc = carts_collection.find_one({'_id': ObjectId(cart_id)})
        return Cart.from_dict(doc) if doc else None

    def update_in_db(self):
        doc = self.to_dict()
        carts_collection.update_one(
            {'_id': ObjectId(self._id)},
            {'$set': {**doc, 'updatedAt': datetime.utcnow()}}
        )

    @staticmethod
    def delete_by_id(cart_id: str):
        result = carts_collection.delete_one({'_id': ObjectId(cart_id)})
        return result.deleted_count > 0