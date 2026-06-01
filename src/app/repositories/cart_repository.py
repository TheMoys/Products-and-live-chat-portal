from app.models.cart import Cart
from bson import ObjectId

class CartRepository:
    @staticmethod
    async def create(cart: Cart) -> Cart:
        await cart.save()
        return cart

    @staticmethod
    def get_by_id(cart_id: str) -> Cart:
        return Cart.find_by_id(cart_id)

    @staticmethod
    def get_by_user(user_id: str) -> Cart:
        cart = Cart.find_by_user(user_id)
        if not cart:
            # Create new cart if doesn't exist
            cart = Cart(user_id=user_id)
        return cart

    @staticmethod
    async def update(cart_id: str, items: list) -> Cart:
        cart = Cart.find_by_id(cart_id)
        if cart:
            cart.items = items
            cart.update_in_db()
            cart = Cart.find_by_id(cart_id)
        return cart

    @staticmethod
    def delete(cart_id: str) -> bool:
        return Cart.delete_by_id(cart_id)

    @staticmethod
    async def clear_by_user(user_id: str):
        cart = Cart.find_by_user(user_id)
        if cart:
            cart.items = []
            cart.update_in_db()
        return cart