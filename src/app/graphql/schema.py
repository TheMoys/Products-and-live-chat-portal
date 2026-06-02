import strawberry
from typing import Optional, List
from enum import Enum
from app.services.order_service import OrderService
from app.services.chat_service import ChatService
from app.models.user import User as UserModel

@strawberry.enum
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

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

@strawberry.type
class ShippingAddress:
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

@strawberry.type
class Order:
    id: str
    orderNumber: str
    totalAmount: float
    status: str
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

@strawberry.type
class Query:
    @strawberry.field
    def all_orders(self, status: Optional[str] = None) -> List[Order]:
        orders = OrderService.get_all_orders(status)
        result = []
        for order in orders:
            result.append(Order(
                id=order._id,
                orderNumber=order.order_number,
                totalAmount=order.total_amount,
                status=order.status,
                createdAt=order.created_at.isoformat(),
                user=User(
                    id=str(order.user),
                    username="",
                    email=""
                ),
                items=[OrderItem(
                    title=item['title'],
                    quantity=item['quantity'],
                    price=item['price']
                ) for item in order.items],
                shippingAddress=ShippingAddress(
                    city=order.shipping_address.get('city'),
                    state=order.shipping_address.get('state'),
                    country=order.shipping_address.get('country')
                )
            ))
        return result

    @strawberry.field
    def my_orders(self, user_id: str) -> List[Order]:
        orders = OrderService.get_user_orders(user_id)
        result = []
        for order in orders:
            result.append(Order(
                id=order._id,
                orderNumber=order.order_number,
                totalAmount=order.total_amount,
                status=order.status,
                createdAt=order.created_at.isoformat(),
                user=User(
                    id=str(order.user),
                    username="",
                    email=""
                ),
                items=[OrderItem(
                    title=item['title'],
                    quantity=item['quantity'],
                    price=item['price']
                ) for item in order.items],
                shippingAddress=ShippingAddress(
                    city=order.shipping_address.get('city'),
                    state=order.shipping_address.get('state'),
                    country=order.shipping_address.get('country')
                )
            ))
        return result

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