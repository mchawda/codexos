# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""User schemas for API validation"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None
    role: UserRole = UserRole.DEVELOPER


class UserCreate(UserBase):
    """Schema for creating a new user"""

    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating user information"""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=8)


class UserInDBBase(UserBase):
    """Base user schema from database"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    organization_id: Optional[UUID] = None


class User(UserInDBBase):
    """User schema for API responses"""

    pass


class UserInDB(UserInDBBase):
    """User schema with hashed password"""

    hashed_password: str


class UserLogin(BaseModel):
    """Schema for user login"""

    username: str
    password: str


class Token(BaseModel):
    """JWT token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""

    user_id: Optional[str] = None
    username: Optional[str] = None
    scopes: list[str] = []
