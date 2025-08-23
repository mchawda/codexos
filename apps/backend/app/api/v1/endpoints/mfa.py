# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Multi-factor Authentication API endpoints
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.mfa_service import mfa_service, MFAMethod

router = APIRouter()


class MFASetupRequest(BaseModel):
    method: str = Field(..., description="MFA method (totp, sms, email)")
    phone_number: Optional[str] = Field(None, description="Phone number for SMS MFA")


class MFAVerifySetupRequest(BaseModel):
    code: str = Field(..., description="Verification code")


class MFAVerifyRequest(BaseModel):
    code: str = Field(..., description="MFA verification code")


class MFADisableRequest(BaseModel):
    password: str = Field(..., description="User password for verification")


@router.post("/setup", response_model=Dict[str, Any])
async def setup_mfa(
    request: MFASetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Setup MFA for the current user
    """
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled",
        )
    
    # Update phone number if provided
    if request.method == MFAMethod.SMS and request.phone_number:
        current_user.phone_number = request.phone_number
        await db.commit()
    
    try:
        result = await mfa_service.enable_mfa(db, current_user, request.method)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/verify-setup", response_model=Dict[str, Any])
async def verify_mfa_setup(
    request: MFAVerifySetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify MFA setup with the provided code
    """
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already verified",
        )
    
    success = await mfa_service.verify_mfa_setup(db, current_user, request.code)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )
    
    return {"status": "success", "message": "MFA enabled successfully"}


@router.post("/verify", response_model=Dict[str, Any])
async def verify_mfa(
    request: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify MFA code during login
    """
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled",
        )
    
    success, message = await mfa_service.verify_mfa(
        db,
        current_user,
        request.code,
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message or "Invalid verification code",
        )
    
    return {"status": "success", "message": message or "MFA verified"}


@router.post("/send-code", response_model=Dict[str, Any])
async def send_mfa_code(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send MFA code for login (SMS/Email methods)
    """
    result = await mfa_service.send_mfa_code(db, current_user)
    
    if not result.get("required"):
        return {"required": False}
    
    return {
        "required": True,
        "method": result["method"],
        "destination": result.get("destination"),
    }


@router.get("/status", response_model=Dict[str, Any])
async def get_mfa_status(
    current_user: User = Depends(get_current_user),
):
    """
    Get MFA status for the current user
    """
    return {
        "enabled": current_user.mfa_enabled,
        "method": current_user.mfa_method,
        "has_backup_codes": bool(current_user.mfa_backup_codes),
    }


@router.post("/disable", response_model=Dict[str, Any])
async def disable_mfa(
    request: MFADisableRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Disable MFA for the current user
    """
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled",
        )
    
    success = await mfa_service.disable_mfa(db, current_user, request.password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
    
    return {"status": "success", "message": "MFA disabled successfully"}


@router.post("/regenerate-backup-codes", response_model=Dict[str, Any])
async def regenerate_backup_codes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Regenerate backup codes for the current user
    """
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled",
        )
    
    try:
        codes = await mfa_service.regenerate_backup_codes(db, current_user)
        return {
            "backup_codes": codes,
            "message": "Save these codes in a secure place. Each code can only be used once.",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
