from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.chat_service import ChatService
from app.dependencies import get_current_user
from app.schemas.message import MessageCreate, MessageResponse
from app.models.user import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.get("/messages", response_model=dict)
async def get_messages(limit: int = Query(50, ge=1, le=500), current_user: User = Depends(get_current_user)):
    try:
        messages = ChatService.get_recent_messages(limit)
        return {
            "status": "success",
            "data": [
                {
                    "_id": msg._id,
                    "user": {
                        "id": str(msg.user),
                        "_id": str(msg.user),
                        "username": msg.username
                    },
                    "username": msg.username,
                    "text": msg.text,
                    "createdAt": msg.created_at.isoformat()
                }
                for msg in messages
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/messages", response_model=dict)
async def send_message(request: MessageCreate, current_user: User = Depends(get_current_user)):
    try:
        message = await ChatService.save_message(
            user_id=str(current_user._id),
            username=current_user.username,
            text=request.text
        )
        return {
            "status": "success",
            "data": {
                "_id": message._id,
                "user": {
                    "id": str(message.user),
                    "_id": str(message.user),
                    "username": message.username
                },
                "username": message.username,
                "text": message.text,
                "createdAt": message.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))