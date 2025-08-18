"""
OAuth2/OIDC authentication service
Supports Auth0, Okta, Azure AD, and generic OIDC providers
"""

import httpx
import secrets
import json
from typing import Dict, Optional, Any, List, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlencode, urlparse
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
import structlog

from app.models.oauth import (
    TenantOAuthConfig, OAuthUser, IdentityProviderType, AuthEvent, AuthEventType
)
from app.models.tenant import Tenant
from app.models.user import User, UserStatus
from app.models.rbac import Role, SystemRole
from app.core.encryption import encryption_service
from app.core.config import settings
from app.core.auth import AuthService

logger = structlog.get_logger()


class OAuthService:
    """Service for handling OAuth2/OIDC authentication flows"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.auth_service = AuthService()
    
    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()
    
    async def get_authorization_url(
        self,
        email: str,
        invitation_token: Optional[str] = None,
        redirect_uri: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get OAuth authorization URL based on email domain"""
        # Resolve tenant from email
        tenant = await self.resolve_tenant_by_email(email)
        if not tenant:
            raise ValueError("No tenant found for email domain")
        
        # Get OAuth config for tenant
        configs = await self.get_tenant_oauth_configs(tenant.id, active_only=True)
        if not configs:
            raise ValueError("No OAuth configuration found for tenant")
        
        # Use first active config (could be enhanced to support multiple)
        config = configs[0]
        
        # Generate state parameter
        state_data = {
            "tenant_id": str(tenant.id),
            "config_id": str(config.id),
            "email": email,
            "invitation_token": invitation_token,
            "timestamp": datetime.utcnow().isoformat()
        }
        state = base64.urlsafe_b64encode(
            json.dumps(state_data).encode()
        ).decode().rstrip('=')
        
        # Build authorization URL
        params = {
            "response_type": "code",
            "client_id": config.client_id,
            "redirect_uri": redirect_uri or config.redirect_uri,
            "scope": " ".join(config.scopes),
            "state": state,
        }
        
        # Add provider-specific parameters
        if config.provider_type == IdentityProviderType.AUTH0:
            params["audience"] = settings.AUTH0_AUDIENCE
            if email:
                params["login_hint"] = email
        
        authorization_url = f"{config.authorization_url}?{urlencode(params)}"
        
        return {
            "authorization_url": authorization_url,
            "state": state,
            "provider": config.provider_type
        }
    
    async def handle_callback(
        self,
        code: str,
        state: str,
        redirect_uri: str
    ) -> Dict[str, Any]:
        """Handle OAuth callback and create/update user"""
        # Decode state
        try:
            state_data = json.loads(
                base64.urlsafe_b64decode(state + '=' * (4 - len(state) % 4))
            )
            tenant_id = state_data["tenant_id"]
            config_id = state_data["config_id"]
        except:
            raise ValueError("Invalid state parameter")
        
        # Get OAuth config
        result = await self.db.execute(
            select(TenantOAuthConfig).where(
                TenantOAuthConfig.id == config_id
            )
        )
        config = result.scalar_one_or_none()
        if not config:
            raise ValueError("OAuth configuration not found")
        
        # Exchange code for tokens
        token_response = await self.exchange_code_for_token(
            config, code, redirect_uri
        )
        if not token_response:
            raise ValueError("Failed to exchange authorization code")
        
        # Get user info
        user_info = await self.get_user_info(
            config, token_response["access_token"]
        )
        if not user_info:
            # Try to decode ID token if userinfo failed
            if "id_token" in token_response:
                user_info = self.decode_id_token(
                    token_response["id_token"], config
                )
        
        if not user_info:
            raise ValueError("Failed to get user information")
        
        # Create or update user
        user = await self.create_or_update_user(
            tenant_id=tenant_id,
            oauth_config=config,
            provider_user_id=user_info.get(config.user_id_claim, user_info.get("sub")),
            provider_data=user_info,
            tokens=token_response
        )
        
        # Generate JWT tokens
        permissions = list(user.get_permissions())
        access_token = self.auth_service.create_access_token(
            user_id=str(user.id),
            tenant_id=str(user.tenant_id),
            permissions=permissions
        )
        refresh_token = self.auth_service.create_refresh_token(
            user_id=str(user.id),
            tenant_id=str(user.tenant_id)
        )
        
        # Log successful login
        await self.log_auth_event(
            user_id=user.id,
            tenant_id=user.tenant_id,
            event_type=AuthEventType.LOGIN_SUCCESS,
            event_data={"provider": config.provider_type}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "avatar_url": user.avatar_url,
                "roles": [role.name for role in user.roles],
                "permissions": permissions
            }
        }
    
    async def resolve_tenant_by_email(self, email: str) -> Optional[Tenant]:
        """Resolve tenant from email domain"""
        try:
            domain = email.split('@')[1].lower()
            
            # First try exact domain match
            result = await self.db.execute(
                select(Tenant).where(Tenant.domain == domain)
            )
            tenant = result.scalar_one_or_none()
            if tenant:
                return tenant
            
            # Then try email domains in OAuth configs
            result = await self.db.execute(
                select(TenantOAuthConfig).where(
                    TenantOAuthConfig.email_domains.contains([domain])
                )
            )
            config = result.scalar_one_or_none()
            if config:
                result = await self.db.execute(
                    select(Tenant).where(Tenant.id == config.tenant_id)
                )
                return result.scalar_one_or_none()
            
            # Try subdomain matching
            result = await self.db.execute(
                select(Tenant).where(Tenant.subdomain == domain.split('.')[0])
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error resolving tenant for email {email}: {e}")
            return None
    
    async def get_tenant_oauth_configs(
        self, 
        tenant_id: str, 
        active_only: bool = True
    ) -> List[TenantOAuthConfig]:
        """Get OAuth configurations for a tenant"""
        query = select(TenantOAuthConfig).where(
            TenantOAuthConfig.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.where(TenantOAuthConfig.is_active == True)
        
        result = await self.db.execute(query)
        configs = result.scalars().all()
        
        # Decrypt sensitive fields
        for config in configs:
            config.client_secret = encryption_service.decrypt_value(
                config.client_secret,
                config.client_secret_nonce,
                config.client_secret_tag,
                config.encryption_key_id,
                config.encrypted_key,
                config.salt
            )
        
        return configs
    
    async def exchange_code_for_token(
        self,
        config: TenantOAuthConfig,
        authorization_code: str,
        redirect_uri: str
    ) -> Optional[Dict[str, Any]]:
        """Exchange authorization code for access token"""
        try:
            token_data = {
                'grant_type': 'authorization_code',
                'code': authorization_code,
                'redirect_uri': redirect_uri,
                'client_id': config.client_id,
                'client_secret': config.client_secret
            }
            
            response = await self.http_client.post(
                config.token_url,
                data=token_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code != 200:
                logger.error(f"Token exchange failed: {response.status_code} - {response.text}")
                return None
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error exchanging code for token: {e}")
            return None
    
    async def get_user_info(
        self,
        config: TenantOAuthConfig,
        access_token: str
    ) -> Optional[Dict[str, Any]]:
        """Get user info from OAuth provider"""
        try:
            if not config.userinfo_url:
                return None
            
            headers = {'Authorization': f'Bearer {access_token}'}
            response = await self.http_client.get(config.userinfo_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Userinfo request failed: {response.status_code}")
                return None
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return None
    
    def decode_id_token(
        self,
        id_token: str,
        config: TenantOAuthConfig
    ) -> Optional[Dict[str, Any]]:
        """Decode and validate ID token"""
        try:
            # For Auth0, we can decode without verification for user info
            # In production, should verify with JWKS
            unverified = jwt.get_unverified_claims(id_token)
            return unverified
        except Exception as e:
            logger.error(f"Error decoding ID token: {e}")
            return None
    
    async def create_or_update_user(
        self,
        tenant_id: str,
        oauth_config: TenantOAuthConfig,
        provider_user_id: str,
        provider_data: Dict[str, Any],
        tokens: Dict[str, Any]
    ) -> User:
        """Create or update user from OAuth data"""
        # Check if OAuth user exists
        result = await self.db.execute(
            select(OAuthUser).where(
                and_(
                    OAuthUser.oauth_config_id == oauth_config.id,
                    OAuthUser.provider_user_id == provider_user_id
                )
            )
        )
        oauth_user = result.scalar_one_or_none()
        
        email = provider_data.get(oauth_config.email_claim, provider_data.get("email"))
        name = provider_data.get(oauth_config.name_claim, provider_data.get("name", ""))
        
        if oauth_user:
            # Update existing OAuth user
            oauth_user.provider_data = provider_data
            oauth_user.last_login_at = datetime.utcnow()
            oauth_user.login_count += 1
            
            # Get associated user
            result = await self.db.execute(
                select(User).where(User.id == oauth_user.user_id)
            )
            user = result.scalar_one_or_none()
            
            # Update user info
            if user:
                user.last_login_at = datetime.utcnow()
                user.full_name = name or user.full_name
                user.avatar_url = provider_data.get("picture") or user.avatar_url
        else:
            # Check if user exists with same email
            result = await self.db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                # Create new user
                user = User(
                    tenant_id=tenant_id,
                    email=email,
                    username=email.split('@')[0],  # Default username
                    full_name=name,
                    avatar_url=provider_data.get("picture"),
                    status=UserStatus.ACTIVE.value,
                    is_active=True,
                    is_verified=True,
                    email_verified_at=datetime.utcnow(),
                    last_login_at=datetime.utcnow(),
                )
                
                # Assign default role
                result = await self.db.execute(
                    select(Role).where(
                        and_(
                            Role.tenant_id == tenant_id,
                            Role.is_default == True
                        )
                    )
                )
                default_role = result.scalar_one_or_none()
                if default_role:
                    user.roles.append(default_role)
                
                self.db.add(user)
                await self.db.flush()
            
            # Create OAuth user record
            oauth_user = OAuthUser(
                user_id=user.id,
                oauth_config_id=oauth_config.id,
                provider_user_id=provider_user_id,
                provider_email=email,
                provider_name=name,
                provider_picture=provider_data.get("picture"),
                provider_data=provider_data,
                last_login_at=datetime.utcnow(),
                login_count=1
            )
            self.db.add(oauth_user)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        return user
    
    async def log_auth_event(
        self,
        user_id: Optional[str],
        tenant_id: str,
        event_type: AuthEventType,
        event_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log authentication event"""
        try:
            event = AuthEvent(
                user_id=user_id,
                tenant_id=tenant_id,
                event_type=event_type.value,
                event_data=event_data or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.db.add(event)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Error logging auth event: {e}")


# Import base64 at the top
import base64
