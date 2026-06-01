from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/")
async def get_all_products():
    """Obtener todos los productos (público)"""
    try:
        products = ProductService.get_all_products()
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener productos"
        )

@router.post("/", response_model=dict)
async def create_product(request: ProductCreate, user = Depends(get_current_user)):
    """Crear nuevo producto (autenticado)"""
    try:
        product = ProductService.create_product(
            title=request.title,
            price=request.price,
            description=request.description,
            stock=request.stock,
            image_url=request.image_url,
            image_data=request.image_data
        )
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear producto"
        )

@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: str, request: ProductUpdate, user = Depends(get_current_user)):
    """Actualizar producto (autenticado)"""
    try:
        update_data = request.dict(exclude_unset=True)
        updated_product = ProductService.update_product(product_id, update_data)
        
        if not updated_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        return updated_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar producto"
        )

@router.delete("/{product_id}")
async def delete_product(product_id: str, user = Depends(get_current_user)):
    """Eliminar producto (autenticado)"""
    try:
        if not ProductService.delete_product(product_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        return {"message": "Producto eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar producto"
        )
