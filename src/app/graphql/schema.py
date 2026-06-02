import strawberry
from typing import Optional, List
from enum import Enum
from app.services.order_service import OrderService
from app.services.chat_service import ChatService
from app.repositories.user_repository import UserRepository
from app.repositories.product_repository import ProductRepository

@strawberry.enum
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

@strawberry.type
class Product:
    id: str
    title: str
    imageUrl: Optional[str] = None
    imageData: Optional[str] = None
    description: Optional[str] = None

@strawberry.type
class User:
    id: str
    username: str
    email: str

@strawberry.type
class OrderItem:
    title: str
    quantity: int
    price: float
    product: Product

@strawberry.type
class ShippingAddress:
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None

@strawberry.type
class Order:
    id: str
    orderNumber: str
    totalAmount: float
    status: OrderStatus
    createdAt: str
    user: User
    items: List[OrderItem]
    shippingAddress: ShippingAddress

@strawberry.type
class OrderStats:
    total: int
    pending: int
    processing: int
    shipped: int
    delivered: int
    cancelled: int
    totalRevenue: float = 0.0

@strawberry.type
class Message:
    id: str
    username: str
    text: str
    createdAt: str

@strawberry.input
class ShippingAddressInput:
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None

@strawberry.type
class Query:
    @strawberry.field
    def my_orders(self, info) -> List[Order]:
        # Obtener usuario del contexto
        user_id = info.context.get("user_id")
        if not user_id:
            raise Exception("No autenticado")
        
        orders = OrderService.get_user_orders(user_id)
        result = []
        for order in orders:
            user_doc = UserRepository.get_by_id(str(order.user))
            user_data = User(
                id=str(order.user),
                username=user_doc.username if user_doc else "",
                email=user_doc.email if user_doc else ""
            )
            
            items_data = []
            for item in order.items:
                product_doc = ProductRepository.get_by_id(item['product'])
                product_data = Product(
                    id=item['product'],
                    title=item.get('title', ''),
                    imageUrl=product_doc.image_url if product_doc else None,
                    imageData=product_doc.image_data if product_doc else None,
                    description=product_doc.description if product_doc else None
                )
                items_data.append(OrderItem(
                    title=item['title'],
                    quantity=item['quantity'],
                    price=item['price'],
                    product=product_data
                ))
            
            result.append(Order(
                id=order._id,
                orderNumber=order.order_number,
                totalAmount=order.total_amount,
                status=order.status,
                createdAt=order.created_at.isoformat(),
                user=user_data,
                items=items_data,
                shippingAddress=ShippingAddress(
                    street=order.shipping_address.get('street'),
                    city=order.shipping_address.get('city'),
                    state=order.shipping_address.get('state'),
                    zipCode=order.shipping_address.get('zipCode'),
                    country=order.shipping_address.get('country')
                )
            ))
        return result

    @strawberry.field
    def my_orders(self, info) -> List[Order]:
        # Obtener usuario del contexto
        user_id = info.context.get("user_id")
        if not user_id:
            raise Exception("No autenticado")

        orders = OrderService.get_user_orders(user_id)
        result = []
        for order in orders:
            user_doc = UserRepository.get_by_id(str(order.user))
            user_data = User(
                id=str(order.user),
                username=user_doc.username if user_doc else "",
                email=user_doc.email if user_doc else ""
            )
            
            items_data = []
            for item in order.items:
                product_doc = ProductRepository.get_by_id(item['product'])
                product_data = Product(
                    id=item['product'],
                    title=item.get('title', ''),
                    imageUrl=product_doc.image_url if product_doc else None,
                    imageData=product_doc.image_data if product_doc else None,
                    description=product_doc.description if product_doc else None
                )
                items_data.append(OrderItem(
                    title=item['title'],
                    quantity=item['quantity'],
                    price=item['price'],
                    product=product_data
                ))
            
            result.append(Order(
                id=order._id,
                orderNumber=order.order_number,
                totalAmount=order.total_amount,
                status=order.status,
                createdAt=order.created_at.isoformat(),
                user=user_data,
                items=items_data,
                shippingAddress=ShippingAddress(
                    street=order.shipping_address.get('street'),
                    city=order.shipping_address.get('city'),
                    state=order.shipping_address.get('state'),
                    zipCode=order.shipping_address.get('zipCode'),
                    country=order.shipping_address.get('country')
                )
            ))
        return result

    @strawberry.field
    def order(self, id: str) -> Optional[Order]:
        order = OrderService.get_order(id)
        if not order:
            return None
        
        user_doc = UserRepository.get_by_id(str(order.user))
        user_data = User(
            id=str(order.user),
            username=user_doc.username if user_doc else "",
            email=user_doc.email if user_doc else ""
        )
        
        items_data = []
        for item in order.items:
            product_doc = ProductRepository.get_by_id(item['product'])
            product_data = Product(
                id=item['product'],
                title=item.get('title', ''),
                imageUrl=product_doc.image_url if product_doc else None,
                imageData=product_doc.image_data if product_doc else None,
                description=product_doc.description if product_doc else None
            )
            items_data.append(OrderItem(
                title=item['title'],
                quantity=item['quantity'],
                price=item['price'],
                product=product_data
            ))
        
        return Order(
            id=order._id,
            orderNumber=order.order_number,
            totalAmount=order.total_amount,
            status=order.status,
            createdAt=order.created_at.isoformat(),
            user=user_data,
            items=items_data,
            shippingAddress=ShippingAddress(
                street=order.shipping_address.get('street'),
                city=order.shipping_address.get('city'),
                state=order.shipping_address.get('state'),
                zipCode=order.shipping_address.get('zipCode'),
                country=order.shipping_address.get('country')
            )
        )

    @strawberry.field
    def order_stats(self) -> OrderStats:
        stats = OrderService.get_order_stats()
        return OrderStats(**stats, totalRevenue=0.0)

    @strawberry.field
    def messages(self, limit: int = 50) -> List[Message]:
        messages = ChatService.get_recent_messages(limit)
        return [Message(
            id=msg._id,
            username=msg.username,
            text=msg.text,
            createdAt=msg.created_at.isoformat()
        ) for msg in messages]

schema = strawberry.Schema(query=Query)