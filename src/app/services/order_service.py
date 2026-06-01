from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.cart_repository import CartRepository
from app.models.order import Order
from bson import ObjectId

class OrderService:
    @staticmethod
    async def create_order_from_cart(user_id: str, shipping_address: dict):
        cart = CartRepository.get_by_user(user_id)
        
        if not cart or not cart.items:
            raise ValueError("Carrito vacío")
        
        # Check stock
        for item in cart.items:
            product = ProductRepository.get_by_id(item['product'])
            if not product or product.stock < item['quantity']:
                raise ValueError(f"Stock insuficiente para {item.get('title', 'producto')}")
        
        # Calculate total
        total_amount = sum(item['price'] * item['quantity'] for item in cart.items)
        
        # Create order
        order = Order(
            user_id=user_id,
            items=cart.items,
            total_amount=total_amount,
            shipping_address=shipping_address,
            status='pending'
        )
        
        await OrderRepository.create(order)
        
        # Update product stock
        for item in cart.items:
            product = ProductRepository.get_by_id(item['product'])
            if product:
                product.stock -= item['quantity']
                product.update_in_db(stock=product.stock)
        
        # Clear cart
        cart.items = []
        cart.update_in_db()
        
        return order

    @staticmethod
    def get_user_orders(user_id: str):
        return OrderRepository.get_by_user(user_id)

    @staticmethod
    def get_order(order_id: str):
        return OrderRepository.get_by_id(order_id)

    @staticmethod
    def get_all_orders(status: str = None):
        query = {}
        if status:
            query['status'] = status
        return OrderRepository.get_all(query)

    @staticmethod
    async def update_order_status(order_id: str, status: str):
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if status not in valid_statuses:
            raise ValueError(f"Estado inválido. Debe ser uno de: {', '.join(valid_statuses)}")
        
        return await OrderRepository.update(order_id, status=status)

    @staticmethod
    def delete_order(order_id: str):
        return OrderRepository.delete(order_id)

    @staticmethod
    def get_order_stats():
        total = OrderRepository.count_all()
        pending = OrderRepository.count_by_status('pending')
        processing = OrderRepository.count_by_status('processing')
        shipped = OrderRepository.count_by_status('shipped')
        delivered = OrderRepository.count_by_status('delivered')
        cancelled = OrderRepository.count_by_status('cancelled')
        
        return {
            'total': total,
            'pending': pending,
            'processing': processing,
            'shipped': shipped,
            'delivered': delivered,
            'cancelled': cancelled
        }