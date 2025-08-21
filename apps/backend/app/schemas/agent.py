# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent flow schemas for API validation"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class NodeBase(BaseModel):
    """Base node schema"""
    
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]


class EdgeBase(BaseModel):
    """Base edge schema"""
    
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class AgentFlowBase(BaseModel):
    """Base agent flow schema"""
    
    name: str
    description: Optional[str] = None
    nodes: List[NodeBase]
    edges: List[EdgeBase]
    tags: Optional[List[str]] = None
    is_public: bool = False
    is_template: bool = False
    multimodal_enabled: bool = False


class AgentFlowCreate(AgentFlowBase):
    """Schema for creating an agent flow"""
    pass


class AgentFlowUpdate(BaseModel):
    """Schema for updating an agent flow"""
    
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[NodeBase]] = None
    edges: Optional[List[EdgeBase]] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None
    multimodal_enabled: Optional[bool] = None


class AgentFlow(AgentFlowBase):
    """Agent flow schema for API responses"""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    owner_id: UUID
    version: str = "1.0.0"
    execution_count: int = 0
    success_rate: float = 0.0
    created_at: datetime
    updated_at: datetime


class ExecutionRequest(BaseModel):
    """Request schema for executing an agent flow"""
    
    input_data: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None


class LogEntry(BaseModel):
    """Log entry schema"""
    
    timestamp: str
    level: str
    message: str
    node_id: Optional[str] = None
    node_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ExecutionResponse(BaseModel):
    """Response schema for agent flow execution"""
    
    execution_id: UUID
    status: str  # running, completed, failed
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[LogEntry] = []
    tokens_used: int = 0
    cost_cents: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# New schemas for execution history and logs
class ExecutionHistoryItem(BaseModel):
    """Schema for execution history list item"""
    
    model_config = ConfigDict(from_attributes=True)
    
    run_id: UUID = Field(alias="id")
    status: str
    started_at: Optional[datetime]
    duration: Optional[str] = None  # Calculated field
    input: Optional[str] = None  # Summary of input
    output: Optional[str] = None  # Summary of output
    node_count: Optional[int] = None
    tokens_used: int = 0
    cost_cents: int = 0


class ExecutionNodeDetail(BaseModel):
    """Schema for detailed node execution information"""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(alias="node_id")
    type: str = Field(alias="node_type")
    input: Optional[Dict[str, Any]] = Field(alias="input_data")
    output: Optional[Dict[str, Any]] = Field(alias="output_data")
    time: Optional[str] = None  # Calculated duration
    status: str
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ExecutionLogsResponse(BaseModel):
    """Schema for detailed execution logs"""
    
    run_id: UUID
    nodes: List[ExecutionNodeDetail]
    errors: List[str] = []
    final_output: Optional[Dict[str, Any]] = None
    summary: Dict[str, Any] = {}
