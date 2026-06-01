from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# ============ SCHEMAS DE USER ============

class UserRegisterRequest(BaseModel):
    """Schema para registro de usuario"""
    username: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    admin_code: Optional[str] = None

class UserLoginRequest(BaseModel):
    """Schema para login"""
    email_or_username: str = Field(..., alias="emailOrUsername")
    password: str

class UserResponse(BaseModel):
    """Schema de respuesta de usuario (sin contraseña)"""
    _id: str
    username: str
    email: str
    role: str
    is_active: bool = Field(..., alias="isActive")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    """Schema de respuesta con token"""
    token: str
    user: dict

class UserUpdateRequest(BaseModel):
    """Schema para actualizar usuario"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

class UserStatsResponse(BaseModel):
    """Schema de estadísticas de usuarios"""
    total: int
    admins: int
    regular_users: int = Field(..., alias="regularUsers")
    new_users: int = Field(..., alias="newUsers")
    
    class Config:
        populate_by_name = True
