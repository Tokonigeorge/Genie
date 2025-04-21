# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models import MemberRole, MemberStatus 
class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    supabase_user_id: UUID

class UserLogin(BaseModel):
    email: EmailStr
    password: str
class UserBase(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

# class UserResponse(UserBase):
#     created_at: datetime
#     organization_status: Optional[str] = None  # 'pending' or 'active'
    
#     class Config:
#         from_attributes = True

# class UserResponse(BaseModel):
#     id: UUID
#     email: EmailStr
#     full_name: Optional[str] = None
#     has_existing_org: bool
#     domain: str
#     organization_status: Optional[MemberStatus] = None # Include status

#     class Config:
#         orm_mode = True 
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    has_existing_org: bool
    domain: str
    organization_status: Optional[MemberStatus] = None

    class Config:
        from_attributes = True  # Use this for Pydantic v2
        # or use orm_mode = True for Pydantic v1

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    image_url: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    domain: str
    workspace_url: str
    logo_url: Optional[str] = None
    role: MemberRole

    class Config:
        from_attributes = True
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# app/schemas/organization.py
class OrganizationBase(BaseModel):
    name: str
    domain: str
    logo_url: Optional[str] = None
class OrganizationCreate(OrganizationBase):
    workspace_url: str

class OnboardingStatusResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    membership_status: Optional[MemberStatus] = None
    membership_role: Optional[MemberRole] = None
    organization_id: Optional[UUID] = None
    organization_name: Optional[str] = None
    organization_domain: Optional[str] = None
    domain_exists: Optional[bool] = None
    domain: Optional[str] = None