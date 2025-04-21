# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.auth import AuthService
from app.schemas.auth import UserCreate, UserLogin, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, UserUpdate, OrganizationCreate, OnboardingStatusResponse
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
        # The service method now returns the correct structure
        registered_info = await auth_service.register_user(user_data)
        return registered_info
    except ValueError as e:
        # Handle specific errors like "already exists"
        if "already exists" in str(e):
             raise HTTPException(status_code=409, detail=str(e)) # 409 Conflict
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e: # Catch unexpected errors
        print(f"Unexpected registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during registration.")
    
# @router.patch("/users/me", response_model=UserResponse)
# async def update_user(
#     user_data: UserUpdate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     try:
#         auth_service = AuthService(db)
#         updated_user = await auth_service.update_user(current_user.id, user_data)
#         return updated_user
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))

@router.patch("/users/me", response_model=UserResponse) # Or a more specific UserDetailResponse
async def update_user(
    user_data: UserUpdate, # Use the UserUpdate schema
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        auth_service = AuthService(db)
        # Pass the Pydantic model directly
        updated_user = await auth_service.update_user(current_user.id, user_data)
        # Map the updated User model back to a response schema if necessary
        # This might require fetching the latest org status again or having update_user return it
        # For simplicity now, just return basic user info - adjust as needed
        return UserResponse(
             id=updated_user.id,
             email=updated_user.email,
             full_name=updated_user.full_name,
             has_existing_org= bool(await auth_service._get_user_membership(updated_user.id)), # Re-check org status
             domain=updated_user.email.split('@')[1],
             organization_status=(await auth_service._get_user_membership(updated_user.id)).status if await auth_service._get_user_membership(updated_user.id) else None
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected user update error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during user update.")
    


@router.post("/login")
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        result = await auth_service.login_user(login_data)
        return result
    except ValueError as e:
        print(f"Login error details: {str(e)}")  # Add detailed logging
        raise HTTPException(
            status_code=401,
            detail=str(e) if str(e) else "Authentication failed"
        )
    except Exception as e:
        print(f"Unexpected login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during login"
        )
    
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
                # Debug: Print received data
        print(f"Received form data: name={name}, domain={domain}, workspace_url={workspace_url}")
        storage_service = StorageService()
      
        try:
            logo_url = await storage_service.upload_file(logo, "organization-logos")
        except Exception as upload_error:
            print(f"Logo upload error details: {str(upload_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to upload logo: {str(upload_error)}"
            )

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
    
@router.get("/onboarding-status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    current_user: User = Depends(get_current_user), # Protected route
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_service = AuthService(db)
        status = await auth_service.get_onboarding_status(current_user.id)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) # 404 if user not found by service
    except Exception as e: # Catch unexpected errors
        print(f"Unexpected onboarding status error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching onboarding status.")