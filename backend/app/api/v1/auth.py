# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db
from app.services.auth import AuthService
from app.schemas.auth import UserCreate, UserLogin, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        user = await auth_service.register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        result = await auth_service.login_user(login_data)
        return {
            "user": result["user"],
            "organization_status": result["organization_status"],
            "session": result["session"]
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))