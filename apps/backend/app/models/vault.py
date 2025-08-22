# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Vault models for secure credential storage"""

from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class VaultItem(Base, TimestampMixin):
    """Encrypted credential storage"""

    __tablename__ = "vault_items"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Identification
    key = Column(String(255), nullable=False)  # User-friendly key name
    description = Column(Text, nullable=True)
    
    # Encrypted data
    encrypted_value = Column(Text, nullable=False)  # AES-256 encrypted
    encryption_metadata = Column(JSON, nullable=False)  # IV, salt, etc.
    
    # Organization
    tags = Column(JSON, nullable=True)  # List of tags for filtering
    category = Column(String(100), nullable=True)  # api_key, oauth, password, etc.
    
    # Access control
    team_accessible = Column(Boolean, default=False, nullable=False)
    organization_id = Column(PGUUID(as_uuid=True), nullable=True)
    
    # Audit
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    access_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="vault_items")
    access_logs = relationship("VaultAccessLog", back_populates="vault_item", cascade="all, delete-orphan")


class VaultAccessLog(Base, TimestampMixin):
    """Audit log for vault access"""

    __tablename__ = "legacy_vault_access_logs"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    vault_item_id = Column(PGUUID(as_uuid=True), ForeignKey("vault_items.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Access details
    action = Column(String(50), nullable=False)  # read, update, delete
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    # Relationships
    vault_item = relationship("VaultItem", back_populates="access_logs")
    user = relationship("User")
