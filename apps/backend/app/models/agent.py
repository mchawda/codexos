# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent flow models for visual workflow system"""

from enum import Enum
from uuid import uuid4
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class NodeType(str, Enum):
    """Supported node types in agent flows"""

    ENTRY = "entry"
    EXIT = "exit"
    LLM = "llm"
    TOOL = "tool"
    RAG = "rag"
    VAULT = "vault"
    CONDITION = "condition"
    VISION = "vision"
    VOICE = "voice"
    ACTION = "action"


class AgentFlow(Base, TimestampMixin):
    """Agent flow definition with nodes and edges - multi-tenant"""

    __tablename__ = "agent_flows"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Flow configuration
    nodes = Column(JSON, nullable=False, default=list)  # List of node objects
    edges = Column(JSON, nullable=False, default=list)  # List of edge objects
    
    # Metadata
    version = Column(String(50), default="1.0.0", nullable=False)
    tags = Column(JSON, nullable=True)  # List of tags
    is_public = Column(Boolean, default=False, nullable=False)
    is_template = Column(Boolean, default=False, nullable=False)
    
    # Multimodal flags
    multimodal_enabled = Column(Boolean, default=False, nullable=False)
    
    # Statistics
    execution_count = Column(Integer, default=0, nullable=False)
    success_rate = Column(Float, default=0.0, nullable=False)
    
    # Marketplace
    marketplace_id = Column(PGUUID(as_uuid=True), nullable=True)
    price = Column(Integer, nullable=True)  # Price in cents
    
    # Relationships
    tenant = relationship("Tenant", back_populates="agent_flows")
    owner = relationship("User", back_populates="agent_flows")
    executions = relationship("Execution", back_populates="flow", cascade="all, delete-orphan")


class Execution(Base, TimestampMixin):
    """Agent flow execution history and results - multi-tenant"""

    __tablename__ = "executions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    flow_id = Column(PGUUID(as_uuid=True), ForeignKey("agent_flows.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Execution status
    status = Column(String(50), nullable=False)  # pending, running, completed, failed
    
    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Input/Output
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Logs and errors
    logs = Column(JSON, nullable=True)  # List of log entries
    error_message = Column(Text, nullable=True)
    
    # Resource usage
    tokens_used = Column(Integer, default=0, nullable=False)
    cost_cents = Column(Integer, default=0, nullable=False)
    
    # TTL for cleanup
    ttl_days = Column(Integer, default=30, nullable=True)
    
    # Relationships
    flow = relationship("AgentFlow", back_populates="executions")
    user = relationship("User", back_populates="executions")
    execution_nodes = relationship("ExecutionNode", back_populates="execution", cascade="all, delete-orphan")


class ExecutionNode(Base, TimestampMixin):
    """Detailed node-level execution tracking"""

    __tablename__ = "execution_nodes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id = Column(PGUUID(as_uuid=True), ForeignKey("executions.id", ondelete="CASCADE"), nullable=False)
    
    # Node identification
    node_id = Column(String(255), nullable=False)
    node_type = Column(String(100), nullable=False)
    
    # Input/Output data
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)  # Tool names, model info, etc.
    
    # Relationships
    execution = relationship("Execution", back_populates="execution_nodes")
