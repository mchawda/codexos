# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""users endpoints"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_users():
    """List users"""
    return {"message": "users endpoint"}
