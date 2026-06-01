from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    product: str
    title: str
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None

class OrderCreate(BaseModel):
    shippingAddress: ShippingAddress

class OrderUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: str
    orderNumber: str
    user: str
    items: List[OrderItem]
    totalAmount: float
    status: str
    shippingAddress: ShippingAddress
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class OrderListResponse(BaseModel):
    id: str
    orderNumber: str
    totalAmount: float
    status: str
    createdAt: datetime

class OrderStatsResponse(BaseModel):
    total: int
    pending: int
    processing: int
    shipped: int
    delivered: int
    cancelled: int