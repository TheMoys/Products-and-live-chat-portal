from app.models.order import Order
from bson import ObjectId

class OrderRepository:
    @staticmethod
    async def create(order: Order) -> Order:
        await order.save()
        return order

    @staticmethod
    def get_by_id(order_id: str) -> Order:
        return Order.find_by_id(order_id)

    @staticmethod
    def get_by_user(user_id: str) -> list:
        return Order.find_by_user(user_id)

    @staticmethod
    def get_all(query: dict = None) -> list:
        return Order.find_all(query)

    @staticmethod
    async def update(order_id: str, **fields) -> Order:
        order = Order.find_by_id(order_id)
        if order:
            order.update_in_db(**fields)
            order = Order.find_by_id(order_id)
        return order

    @staticmethod
    def delete(order_id: str) -> bool:
        return Order.delete_by_id(order_id)

    @staticmethod
    def count_all() -> int:
        # Importamos la función get_db directamente
        from app.config import get_db
        db = get_db()
        return db['orders'].count_documents({})

    @staticmethod
    def count_by_status(status: str) -> int:
        # Importamos la función get_db directamente
        from app.config import get_db
        db = get_db()
        return db['orders'].count_documents({'status': status})