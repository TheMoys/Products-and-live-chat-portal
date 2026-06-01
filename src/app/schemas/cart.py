from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CartItem(BaseModel):
    product: str
    title: str
    quantity: int
    price: float

class CartResponse(BaseModel):
    id: str
    user: str
    items: List[CartItem]
    createdAt: datetime
    updatedAt: datetime

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int
    price: float

class UpdateCartItemRequest(BaseModel):
    quantity: int