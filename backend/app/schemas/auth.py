# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str]
    created_at: datetime
    organization_status: Optional[str] = None  # 'pending' or 'active'
    
    class Config:
        from_attributes = True

# app/schemas/organization.py
class OrganizationBase(BaseModel):
    name: str
    domain: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True