from app.repositories.message_repository import MessageRepository
from app.models.message import Message

class ChatService:
    @staticmethod
    async def save_message(user_id: str, username: str, text: str):
        message = Message(
            user_id=user_id,
            username=username,
            text=text
        )
        return await MessageRepository.create(message)

    @staticmethod
    def get_recent_messages(limit: int = 50):
        return MessageRepository.get_recent(limit)

    @staticmethod
    def get_all_messages():
        return MessageRepository.get_all()

    @staticmethod
    def delete_message(message_id: str):
        return MessageRepository.delete(message_id)

    @staticmethod
    def get_chat_stats():
        return {
            'total_messages': MessageRepository.count_all()
        }