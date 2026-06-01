from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserUpdateRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(request: UserRegisterRequest):
    """Registrar nuevo usuario"""
    try:
        token, user = AuthService.register(
            username=request.username,
            email=request.email,
            password=request.password,
            admin_code=request.admin_code
        )
        return {"token": token, "user": user}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest):
    """Login de usuario"""
    try:
        token, user = AuthService.login(
            email_or_username=request.email_or_username,
            password=request.password
        )
        return {"token": token, "user": user}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )
