# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""vault endpoints"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_vault():
    """List vault"""
    return {"message": "vault endpoint"}
