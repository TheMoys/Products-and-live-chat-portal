from datetime import datetime
from bson import ObjectId
from app.config import settings

db = settings.get_db()
orders_collection = db['orders']

class Order:
    def __init__(self, user_id: str, items: list, total_amount: float, 
                 shipping_address: dict = None, status: str = 'pending', 
                 order_number: str = None, _id: str = None):
        self._id = _id
        self.order_number = order_number
        self.user = ObjectId(user_id)
        self.items = items  # List of {product_id, title, quantity, price}
        self.total_amount = total_amount
        self.status = status  # pending, processing, shipped, delivered, cancelled
        self.shipping_address = shipping_address or {}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self, include_sensitive=True):
        return {
            '_id': str(self._id) if self._id else None,
            'orderNumber': self.order_number,
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
            'totalAmount': self.total_amount,
            'status': self.status,
            'shippingAddress': self.shipping_address,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        order = Order(
            user_id=str(data['user']) if isinstance(data['user'], ObjectId) else data['user'],
            items=data.get('items', []),
            total_amount=data.get('totalAmount', 0),
            shipping_address=data.get('shippingAddress', {}),
            status=data.get('status', 'pending'),
            order_number=data.get('orderNumber'),
            _id=str(data['_id']) if isinstance(data.get('_id'), ObjectId) else data.get('_id')
        )
        order.created_at = data.get('createdAt', datetime.utcnow())
        order.updated_at = data.get('updatedAt', datetime.utcnow())
        return order

    async def save(self):
        doc = self.to_dict()
        if self._id:
            result = orders_collection.update_one({'_id': ObjectId(self._id)}, {'$set': doc})
            return result.matched_count > 0
        else:
            # Generate order number
            count = orders_collection.count_documents({})
            self.order_number = f"ORD-{str(count + 1).zfill(6)}"
            doc['orderNumber'] = self.order_number
            result = orders_collection.insert_one(doc)
            self._id = str(result.inserted_id)
            return True

    @staticmethod
    def find_by_id(order_id: str):
        doc = orders_collection.find_one({'_id': ObjectId(order_id)})
        return Order.from_dict(doc) if doc else None

    @staticmethod
    def find_by_user(user_id: str):
        docs = list(orders_collection.find({'user': ObjectId(user_id)}).sort('createdAt', -1))
        return [Order.from_dict(doc) for doc in docs]

    @staticmethod
    def find_all(query: dict = None):
        query = query or {}
        docs = list(orders_collection.find(query).sort('createdAt', -1))
        return [Order.from_dict(doc) for doc in docs]

    def update_in_db(self, **fields):
        orders_collection.update_one(
            {'_id': ObjectId(self._id)},
            {'$set': {**fields, 'updatedAt': datetime.utcnow()}}
        )

    @staticmethod
    def delete_by_id(order_id: str):
        result = orders_collection.delete_one({'_id': ObjectId(order_id)})
        return result.deleted_count > 0