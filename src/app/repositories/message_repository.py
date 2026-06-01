from app.models.message import Message

class MessageRepository:
    @staticmethod
    async def create(message: Message) -> Message:
        await message.save()
        return message

    @staticmethod
    def get_recent(limit: int = 50) -> list:
        return Message.find_recent(limit)

    @staticmethod
    def get_all() -> list:
        return Message.find_all()

    @staticmethod
    def delete(message_id: str) -> bool:
        return Message.delete_by_id(message_id)

    @staticmethod
    def count_all() -> int:
        from app.config import settings
        db = settings.get_db()
        return db['messages'].count_documents({})