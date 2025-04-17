# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models import MemberRole
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

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
class UserResponse(BaseModel):
    user: UserBase
    has_existing_org: bool
    domain: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    domain: str
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
    logo_url: Optional[str] = None
class OrganizationResponse(OrganizationBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True