from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    text: str

class UserInfo(BaseModel):
    id: str
    username: str

class MessageResponse(BaseModel):
    id: str
    user: UserInfo
    username: str
    text: str
    createdAt: datetime

class ChatStatsResponse(BaseModel):
    total_messages: int