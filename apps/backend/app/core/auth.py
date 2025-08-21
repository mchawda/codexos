# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Enhanced authentication with multi-tenancy and RBAC
Supports Auth0 and other OAuth providers
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import structlog

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserStatus
from app.models.tenant import Tenant, TenantStatus
from app.models.rbac import Permission
from app.models.audit import AuditLog, AuditEventType

logger = structlog.get_logger()

# OAuth2 schemes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)


class AuthService:
    """Enhanced authentication service with multi-tenancy"""
    
    @staticmethod
    def create_access_token(
        user_id: str,
        tenant_id: Optional[str] = None,
        permissions: Optional[List[str]] = None,
        **kwargs
    ) -> str:
        """Create JWT access token with permissions"""
        to_encode = {
            "sub": user_id,
            "tenant_id": tenant_id,
            "permissions": permissions or [],
            "type": "access",
            **kwargs
        }
        
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(user_id: str, tenant_id: Optional[str] = None) -> str:
        """Create JWT refresh token"""
        to_encode = {
            "sub": user_id,
            "tenant_id": tenant_id,
            "type": "refresh"
        }
        
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )


# Dependency functions
async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user with tenant context"""
    # Try bearer token first, then oauth2
    if bearer and bearer.credentials:
        token = bearer.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode token
    auth_service = AuthService()
    try:
        payload = auth_service.decode_token(token)
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get user with tenant
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check user status
    if user.status != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account is {user.status}"
        )
    
    # Store request context for audit logging
    request.state.user = user
    request.state.token_payload = payload
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


async def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Tenant:
    """Get current tenant from user context"""
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a tenant"
        )
    
    result = await db.execute(
        select(Tenant).where(Tenant.id == current_user.tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check tenant status
    if tenant.status != TenantStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tenant is {tenant.status}"
        )
    
    return tenant


class PermissionChecker:
    """Permission dependency for route protection"""
    
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action
    
    async def __call__(
        self,
        request: Request,
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        """Check if user has required permission"""
        # Super admin bypass
        if current_user.is_superuser:
            return current_user
        
        # Check user permissions
        if not current_user.has_permission(self.resource, self.action):
            # Log unauthorized access attempt
            await self._log_access_denied(request, current_user, db)
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {self.resource}:{self.action}"
            )
        
        return current_user
    
    async def _log_access_denied(
        self,
        request: Request,
        user: User,
        db: AsyncSession
    ):
        """Log access denied event"""
        try:
            audit_log = AuditLog(
                tenant_id=user.tenant_id,
                user_id=user.id,
                event_category="authorization",
                event_type=AuditEventType.ACCESS_DENIED.value,
                event_name=f"Access denied to {self.resource}:{self.action}",
                action=self.action,
                outcome="failure",
                resource_type=self.resource,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                api_endpoint=str(request.url),
                api_method=request.method,
            )
            db.add(audit_log)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to log access denied: {e}")


# Convenience permission decorators
def require_permission(resource: str, action: str):
    """Decorator to require specific permission"""
    return Depends(PermissionChecker(resource, action))


# Role-based dependencies
async def require_tenant_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require tenant admin role"""
    if not current_user.is_superuser and not current_user.is_tenant_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant admin access required"
        )
    return current_user


async def require_super_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require super admin role"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user


# API Key authentication
async def get_user_from_api_key(
    api_key: str,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Authenticate user from API key"""
    from app.models.user import APIKey
    from app.core.encryption import encryption_service
    
    # Hash the API key
    key_hash = encryption_service.hash_api_key(api_key)
    
    # Find API key
    result = await db.execute(
        select(APIKey).where(
            and_(
                APIKey.key_hash == key_hash,
                APIKey.is_active == True,
                APIKey.expires_at > datetime.utcnow()
            )
        )
    )
    api_key_obj = result.scalar_one_or_none()
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == api_key_obj.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Update last used
    api_key_obj.last_used_at = datetime.utcnow()
    api_key_obj.usage_count += 1
    await db.commit()
    
    return user
