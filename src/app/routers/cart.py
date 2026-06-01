from fastapi import APIRouter, Depends, HTTPException
from app.services.cart_service import CartService
from app.dependencies import get_current_user
from app.schemas.cart import AddToCartRequest, UpdateCartItemRequest, CartResponse
from app.models.user import User

router = APIRouter(prefix="/api/cart", tags=["cart"])

@router.get("", response_model=dict)
async def get_cart(current_user: User = Depends(get_current_user)):
    try:
        cart = await CartService.get_cart(str(current_user._id))
        return {
            "status": "success",
            "data": {
                "_id": cart._id,
                "items": cart.items,
                "createdAt": cart.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=dict)
async def add_to_cart(request: AddToCartRequest, current_user: User = Depends(get_current_user)):
    try:
        cart = await CartService.add_to_cart(
            user_id=str(current_user._id),
            product_id=request.product_id,
            quantity=request.quantity,
            price=request.price
        )
        return {
            "status": "success",
            "data": {
                "_id": cart._id,
                "items": cart.items
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}", response_model=dict)
async def update_cart_item(product_id: str, request: UpdateCartItemRequest, current_user: User = Depends(get_current_user)):
    try:
        cart = await CartService.update_cart_item(
            user_id=str(current_user._id),
            product_id=product_id,
            quantity=request.quantity
        )
        return {
            "status": "success",
            "data": {
                "_id": cart._id,
                "items": cart.items
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{product_id}", response_model=dict)
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    try:
        cart = await CartService.remove_from_cart(
            user_id=str(current_user._id),
            product_id=product_id
        )
        return {
            "status": "success",
            "data": {
                "_id": cart._id,
                "items": cart.items
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("", response_model=dict)
async def clear_cart(current_user: User = Depends(get_current_user)):
    try:
        cart = await CartService.clear_cart(str(current_user._id))
        return {
            "status": "success",
            "data": {"message": "Cart cleared"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))