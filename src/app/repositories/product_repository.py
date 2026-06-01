from app.models.product import Product
from typing import List, Optional

class ProductRepository:
    """Repositorio para operaciones de Producto"""
    
    @staticmethod
    def create(title: str, price: float, description: str = None,
               stock: int = 0, image_url: str = None, image_data: str = None) -> Product:
        """Crear nuevo producto"""
        product = Product(
            title=title,
            price=price,
            description=description,
            stock=stock,
            image_url=image_url,
            image_data=image_data
        )
        product.save()
        return product
    
    @staticmethod
    def get_by_id(product_id: str) -> Optional[Product]:
        """Obtener producto por ID"""
        return Product.find_by_id(product_id)
    
    @staticmethod
    def get_all(skip: int = 0, limit: int = 0) -> List[Product]:
        """Obtener todos los productos"""
        return Product.find_all({}, skip, limit)
    
    @staticmethod
    def update(product_id: str, data: dict) -> bool:
        """Actualizar producto"""
        product = Product.find_by_id(product_id)
        if not product:
            return False
        product.update_in_db(data)
        return True
    
    @staticmethod
    def delete(product_id: str) -> bool:
        """Eliminar producto"""
        return Product.delete_by_id(product_id)
    
    @staticmethod
    def count_all() -> int:
        """Contar productos totales"""
        return Product.count()
