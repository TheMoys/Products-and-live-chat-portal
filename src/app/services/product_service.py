from app.repositories.product_repository import ProductRepository
from typing import List, Optional

class ProductService:
    """Servicio de gestión de productos"""
    
    @staticmethod
    def create_product(title: str, price: float, description: str = None,
                      stock: int = 0, image_url: str = None, image_data: str = None) -> dict:
        """Crear nuevo producto"""
        product = ProductRepository.create(
            title=title,
            price=price,
            description=description,
            stock=stock,
            image_url=image_url,
            image_data=image_data
        )
        return product.to_dict()
    
    @staticmethod
    def get_product(product_id: str) -> Optional[dict]:
        """Obtener producto por ID"""
        product = ProductRepository.get_by_id(product_id)
        return product.to_dict() if product else None
    
    @staticmethod
    def get_all_products() -> List[dict]:
        """Obtener todos los productos"""
        products = ProductRepository.get_all()
        return [product.to_dict() for product in products]
    
    @staticmethod
    def update_product(product_id: str, data: dict) -> Optional[dict]:
        """Actualizar producto"""
        if not ProductRepository.get_by_id(product_id):
            return None
        
        ProductRepository.update(product_id, data)
        return ProductRepository.get_by_id(product_id).to_dict()
    
    @staticmethod
    def delete_product(product_id: str) -> bool:
        """Eliminar producto"""
        return ProductRepository.delete(product_id)
