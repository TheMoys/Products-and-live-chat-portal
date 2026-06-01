from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.models.cart import Cart

class CartService:
    @staticmethod
    async def get_cart(user_id: str):
        cart = CartRepository.get_by_user(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            await CartRepository.create(cart)
        return cart

    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int, price: float):
        product = ProductRepository.get_by_id(product_id)
        if not product:
            raise ValueError("Producto no encontrado")
        
        if product.stock < quantity:
            raise ValueError("Stock insuficiente")
        
        cart = CartRepository.get_by_user(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            await CartRepository.create(cart)
        
        # Check if item already in cart
        existing_item = next((item for item in cart.items if item['product'] == product_id), None)
        if existing_item:
            existing_item['quantity'] += quantity
        else:
            cart.items.append({
                'product': product_id,
                'title': product.title,
                'quantity': quantity,
                'price': price
            })
        
        await CartRepository.update(cart._id, cart.items)
        return cart

    @staticmethod
    async def update_cart_item(user_id: str, product_id: str, quantity: int):
        cart = CartRepository.get_by_user(user_id)
        if not cart:
            raise ValueError("Carrito no encontrado")
        
        item = next((item for item in cart.items if item['product'] == product_id), None)
        if not item:
            raise ValueError("Producto no en carrito")
        
        if quantity <= 0:
            cart.items = [item for item in cart.items if item['product'] != product_id]
        else:
            item['quantity'] = quantity
        
        await CartRepository.update(cart._id, cart.items)
        return cart

    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str):
        cart = CartRepository.get_by_user(user_id)
        if not cart:
            raise ValueError("Carrito no encontrado")
        
        cart.items = [item for item in cart.items if item['product'] != product_id]
        await CartRepository.update(cart._id, cart.items)
        return cart

    @staticmethod
    async def clear_cart(user_id: str):
        return await CartRepository.clear_by_user(user_id)