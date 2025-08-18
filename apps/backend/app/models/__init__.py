# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Database models"""

from app.models.user import User, UserRole, UserStatus
from app.models.tenant import Tenant, TenantPlan, TenantStatus
from app.models.rbac import Role, Permission, SystemRole, ResourceType, ActionType
from app.models.oauth import TenantOAuthConfig, OAuthUser, IdentityProviderType, AuthEvent, AuthEventType
from app.models.secure_vault import SecureVault, VaultAccessLog as SecureVaultAccessLog, VaultEncryptionKey, VaultItemType, VaultItemStatus
from app.models.audit import AuditLog, AuditEventCategory, AuditEventType, ComplianceReport
from app.models.agent import AgentFlow, Execution, NodeType
from app.models.vault import VaultItem, VaultAccessLog
from app.models.rag import Document, DocumentChunk, SearchHistory
from app.models.marketplace import (
    MarketplaceCategory, MarketplaceItem, MarketplacePurchase,
    MarketplaceSubscription, MarketplaceReview, MarketplaceAnalytics,
    MarketplaceItemStatus, MarketplaceItemType, PricingModel
)

__all__ = [
    # User models
    "User",
    "UserRole",
    "UserStatus",
    
    # Tenant models
    "Tenant",
    "TenantPlan",
    "TenantStatus",
    
    # RBAC models
    "Role",
    "Permission",
    "SystemRole",
    "ResourceType",
    "ActionType",
    
    # OAuth models
    "TenantOAuthConfig",
    "OAuthUser",
    "IdentityProviderType",
    "AuthEvent",
    "AuthEventType",
    
    # Secure Vault models
    "SecureVault",
    "SecureVaultAccessLog",
    "VaultEncryptionKey",
    "VaultItemType",
    "VaultItemStatus",
    
    # Audit models
    "AuditLog",
    "AuditEventCategory",
    "AuditEventType",
    "ComplianceReport",
    
    # Agent models
    "AgentFlow",
    "Execution",
    "NodeType",
    
    # Legacy Vault models
    "VaultItem",
    "VaultAccessLog",
    
    # RAG models
    "Document",
    "DocumentChunk",
    "SearchHistory",
    
    # Marketplace models
    "MarketplaceCategory",
    "MarketplaceItem",
    "MarketplacePurchase",
    "MarketplaceSubscription",
    "MarketplaceReview",
    "MarketplaceAnalytics",
    "MarketplaceItemStatus",
    "MarketplaceItemType",
    "PricingModel",
]
