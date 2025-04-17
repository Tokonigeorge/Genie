# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.auth import AuthService
from app.schemas.auth import UserCreate, UserLogin, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, UserUpdate, OrganizationCreate
from app.models import User
from app.services.storage import StorageService


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
    
@router.patch("/users/me", response_model=UserResponse)
async def update_user(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        auth_service = AuthService(db)
        updated_user = await auth_service.update_user(current_user.id, user_data)
        return updated_user
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
        return {"message": "Password reset link has been sent"}
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        result = await auth_service.handle_email_verification(token)
        redirect_url = "/onboarding" if result["is_new_org"] else "/dashboard"
        return Response(
            status_code=302,
            headers={"Location": redirect_url}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/create-organization")
async def create_organization(
    name: str = Form(...),
    domain: str = Form(...),
    workspace_url: str = Form(...),
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        storage_service = StorageService()
        logo_url = None
        if logo:
            logo_url = await storage_service.upload_file(logo, "organization-logos")

        org_data = OrganizationCreate(
            name=name,
            domain=domain,
            workspace_url=workspace_url,
            logo_url=logo_url
        )
        
        auth_service = AuthService(db)
        result = await auth_service.create_organization(current_user.id, org_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))