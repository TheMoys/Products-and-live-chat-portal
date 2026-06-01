from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from app.schemas.user import UserResponse, UserUpdateRequest, UserStatsResponse
from app.services.user_service import UserService
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/stats", response_model=UserStatsResponse)
async def get_stats(user = Depends(get_current_admin_user)):
    """Obtener estadísticas de usuarios (admin)"""
    try:
        stats = UserService.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener estadísticas"
        )

@router.get("/", response_model=List[dict])
async def get_all_users(
    search: str = Query(None),
    role: str = Query(None),
    user = Depends(get_current_admin_user)
):
    """Obtener todos los usuarios (admin)"""
    try:
        users = UserService.get_all_users(search=search, role=role)
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener usuarios"
        )

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str, user = Depends(get_current_admin_user)):
    """Obtener usuario específico (admin)"""
    try:
        user_data = UserService.get_user(user_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener usuario"
        )

@router.put("/{user_id}", response_model=dict)
async def update_user(user_id: str, request: UserUpdateRequest, user = Depends(get_current_admin_user)):
    """Actualizar usuario (admin)"""
    try:
        update_data = request.dict(exclude_unset=True)
        updated_user = UserService.update_user(user_id, update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar usuario"
        )

@router.delete("/{user_id}")
async def delete_user(user_id: str, user = Depends(get_current_admin_user)):
    """Eliminar usuario (admin)"""
    try:
        if not UserService.delete_user(user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return {"message": "Usuario eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar usuario"
        )

@router.patch("/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, user = Depends(get_current_admin_user)):
    """Cambiar estado activo/inactivo del usuario (admin)"""
    try:
        user_data = UserService.get_user(user_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        new_status = not user_data.get('isActive', True)
        updated_user = UserService.update_user(user_id, {'isActive': new_status})
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar estado del usuario"
        )
