from fastapi import APIRouter, Depends, HTTPException, Query
from app.security.jwt import JWTHandler
from app.services.order_service import OrderService
from app.dependencies import get_current_user, get_current_admin_user
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse, OrderStatsResponse
from app.models.user import User

router = APIRouter(prefix="/api/orders", tags=["orders"])
jwt_handler = JWTHandler()

@router.post("", response_model=dict)
async def create_order(request: OrderCreate, current_user: User = Depends(get_current_user)):
    try:
        order = await OrderService.create_order_from_cart(
            user_id=str(current_user._id),
            shipping_address=request.shippingAddress.dict()
        )
        return {
            "status": "success",
            "data": {
                "id": order._id,
                "orderNumber": order.order_number,
                "totalAmount": order.total_amount,
                "status": order.status,
                "createdAt": order.created_at.isoformat()
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@router.get("/my-orders", response_model=dict)
async def get_user_orders(current_user: User = Depends(get_current_user)):
    try:
        orders = OrderService.get_user_orders(str(current_user._id))
        return {
            "status": "success",
            "data": [
                {
                    "_id": order._id,
                    "orderNumber": order.order_number,
                    "totalAmount": order.total_amount,
                    "status": order.status,
                    "createdAt": order.created_at.isoformat()
                }
                for order in orders
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=dict)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    try:
        order = OrderService.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check authorization
        if str(order.user) != str(current_user._id) and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "status": "success",
            "data": {
                "_id": order._id,
                "orderNumber": order.order_number,
                "items": order.items,
                "totalAmount": order.total_amount,
                "status": order.status,
                "shippingAddress": order.shipping_address,
                "createdAt": order.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=dict)
async def get_all_orders(status: str = Query(None), current_user: User = Depends(get_current_admin_user)):
    try:
        orders = OrderService.get_all_orders(status)
        return {
            "status": "success",
            "data": [
                {
                    "_id": order._id,
                    "orderNumber": order.order_number,
                    "user": str(order.user),
                    "totalAmount": order.total_amount,
                    "status": order.status,
                    "createdAt": order.created_at.isoformat()
                }
                for order in orders
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{order_id}/status", response_model=dict)
async def update_order_status(order_id: str, request: OrderUpdate, current_user: User = Depends(get_current_admin_user)):
    try:
        order = await OrderService.update_order_status(order_id, request.status)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {
            "status": "success",
            "data": {
                "_id": order._id,
                "orderNumber": order.order_number,
                "status": order.status,
                "updatedAt": order.updated_at.isoformat()
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=dict)
async def get_order_stats(current_user: User = Depends(get_current_admin_user)):
    try:
        stats = OrderService.get_order_stats()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))