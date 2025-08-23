# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Main API router for v1 endpoints"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, agents, rag, vault, marketplace, stripe, mfa

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
api_router.include_router(vault.router, prefix="/vault", tags=["vault"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
api_router.include_router(stripe.router, prefix="/stripe", tags=["payments"])
api_router.include_router(mfa.router, prefix="/mfa", tags=["mfa"])
