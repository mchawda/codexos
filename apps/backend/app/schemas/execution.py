# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Execution schemas for CodexOS
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID


class ExecutionStepBase(BaseModel):
    """Base execution step schema"""
    step_number: int = Field(..., description="Sequential step number")
    step_type: str = Field(..., description="Type of step (tool_call, llm_call, rag_query, etc.)")
    step_name: str = Field(..., description="Human-readable step name")
    input_data: Optional[Dict[str, Any]] = Field(None, description="Step input data")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Step output data")
    intermediate_data: Optional[Dict[str, Any]] = Field(None, description="Data between steps")
    tool_name: Optional[str] = Field(None, description="Name of the tool used")
    tool_parameters: Optional[Dict[str, Any]] = Field(None, description="Tool parameters")
    tool_result: Optional[Dict[str, Any]] = Field(None, description="Tool execution result")
    model_name: Optional[str] = Field(None, description="LLM model name")
    prompt_tokens: Optional[int] = Field(None, description="Number of prompt tokens")
    completion_tokens: Optional[int] = Field(None, description="Number of completion tokens")
    temperature: Optional[float] = Field(None, description="Model temperature")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens")
    query: Optional[str] = Field(None, description="RAG query")
    retrieved_documents: Optional[List[Dict[str, Any]]] = Field(None, description="Retrieved documents")
    relevance_scores: Optional[List[float]] = Field(None, description="Document relevance scores")
    started_at: Optional[datetime] = Field(None, description="Step start time")
    completed_at: Optional[datetime] = Field(None, description="Step completion time")
    duration_ms: Optional[int] = Field(None, description="Step duration in milliseconds")
    latency_ms: Optional[int] = Field(None, description="Step latency in milliseconds")
    cost_cents: Optional[int] = Field(None, description="Step cost in cents")
    cost_breakdown: Optional[Dict[str, Any]] = Field(None, description="Detailed cost breakdown")
    status: str = Field("pending", description="Step status")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    retry_count: Optional[int] = Field(0, description="Number of retries")
    can_replay_from: bool = Field(True, description="Whether step can be replayed from")
    replay_dependencies: Optional[List[str]] = Field(None, description="Steps this depends on")
    extra_data: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    tags: Optional[List[str]] = Field(None, description="Step tags")


class ExecutionStepCreate(ExecutionStepBase):
    """Schema for creating execution steps"""
    execution_id: UUID = Field(..., description="Execution ID")
    execution_node_id: UUID = Field(..., description="Execution node ID")


class ExecutionStepUpdate(BaseModel):
    """Schema for updating execution steps"""
    status: Optional[str] = Field(None, description="Step status")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Step output data")
    error_message: Optional[str] = Field(None, description="Error message")
    cost_cents: Optional[int] = Field(None, description="Step cost in cents")
    completed_at: Optional[datetime] = Field(None, description="Completion time")
    duration_ms: Optional[int] = Field(None, description="Duration in milliseconds")


class ExecutionStepResponse(ExecutionStepBase):
    """Schema for execution step responses"""
    id: UUID
    execution_id: UUID
    execution_node_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExecutionTimelineResponse(BaseModel):
    """Schema for execution timeline responses"""
    execution_id: str
    flow_id: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    tokens_used: int
    cost_cents: int
    can_replay: bool
    replay_count: int
    original_execution_id: Optional[str]
    nodes: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class ReplayExecutionRequest(BaseModel):
    """Schema for replay execution requests"""
    step_number: int = Field(..., description="Step number to replay from")
    new_input_data: Optional[Dict[str, Any]] = Field(None, description="New input data for replay")


class ReplayCandidateResponse(BaseModel):
    """Schema for replay candidate responses"""
    step_number: int
    step_name: str
    step_type: str
    description: str
    dependencies: List[str]
    estimated_cost: int


class ExecutionCostBreakdownResponse(BaseModel):
    """Schema for execution cost breakdown responses"""
    total_cost_cents: int
    cost_by_type: Dict[str, int]
    cost_by_tool: Dict[str, int]
    cost_by_model: Dict[str, int]
    step_count: int


class ExecutionStepFilter(BaseModel):
    """Schema for filtering execution steps"""
    step_type: Optional[str] = Field(None, description="Filter by step type")
    status: Optional[str] = Field(None, description="Filter by step status")
    tool_name: Optional[str] = Field(None, description="Filter by tool name")
    model_name: Optional[str] = Field(None, description="Filter by model name")
    min_cost_cents: Optional[int] = Field(None, description="Minimum cost filter")
    max_cost_cents: Optional[int] = Field(None, description="Maximum cost filter")
    can_replay_from: Optional[bool] = Field(None, description="Filter by replay capability")
    start_date: Optional[datetime] = Field(None, description="Start date filter")
    end_date: Optional[datetime] = Field(None, description="End date filter")
