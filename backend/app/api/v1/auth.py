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
    
@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        await auth_service.initiate_password_reset(request.email)
        return {"message": "If an account exists with this email, a password reset link has been sent"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    @router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        await auth_service.complete_password_reset(request.token, request.new_password)
        return {"message": "Password has been reset successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verify")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        result = await auth_service.handle_email_verification(token)
        # Redirect to appropriate frontend route
        redirect_url = (
            f"/onboarding" if result["is_new_org"] 
            else "/dashboard"
        )
        return Response(
            status_code=302,
            headers={"Location": redirect_url}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))