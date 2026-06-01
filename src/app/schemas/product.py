from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ============ SCHEMAS DE PRODUCT ============

class ProductCreate(BaseModel):
    """Schema para crear producto"""
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    image_data: Optional[str] = Field(None, alias="imageData")
    
    class Config:
        populate_by_name = True

class ProductUpdate(BaseModel):
    """Schema para actualizar producto"""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    image_data: Optional[str] = Field(None, alias="imageData")
    
    class Config:
        populate_by_name = True

class ProductResponse(BaseModel):
    """Schema de respuesta de producto"""
    _id: str
    title: str
    description: Optional[str]
    price: float
    stock: int
    image_url: Optional[str] = Field(..., alias="imageUrl")
    image_data: Optional[str] = Field(..., alias="imageData")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
