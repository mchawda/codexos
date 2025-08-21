# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent flow endpoints"""

from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.agent import AgentFlow, Execution, ExecutionNode
from app.models.user import User
from app.schemas.agent import (
    AgentFlowCreate,
    AgentFlowUpdate,
    AgentFlow as AgentFlowSchema,
    ExecutionRequest,
    ExecutionResponse,
    ExecutionHistoryItem,
    ExecutionLogsResponse,
    ExecutionNodeDetail,
)
from app.services.agent_executor import AgentExecutionService

router = APIRouter()


@router.get("/", response_model=List[AgentFlowSchema])
async def list_agent_flows(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> List[AgentFlow]:
    """List agent flows for the current user"""
    result = await db.execute(
        select(AgentFlow)
        .where(AgentFlow.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=AgentFlowSchema)
async def create_agent_flow(
    flow_in: AgentFlowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentFlow:
    """Create a new agent flow"""
    flow = AgentFlow(
        **flow_in.dict(),
        owner_id=current_user.id,
    )
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    return flow


@router.get("/{flow_id}", response_model=AgentFlowSchema)
async def get_agent_flow(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentFlow:
    """Get a specific agent flow"""
    result = await db.execute(
        select(AgentFlow).where(
            AgentFlow.id == flow_id,
            (AgentFlow.owner_id == current_user.id) | (AgentFlow.is_public == True)
        )
    )
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent flow not found",
        )
    
    return flow


@router.put("/{flow_id}", response_model=AgentFlowSchema)
async def update_agent_flow(
    flow_id: UUID,
    flow_update: AgentFlowUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentFlow:
    """Update an agent flow"""
    result = await db.execute(
        select(AgentFlow).where(
            AgentFlow.id == flow_id,
            AgentFlow.owner_id == current_user.id,
        )
    )
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent flow not found",
        )
    
    update_data = flow_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flow, field, value)
    
    await db.commit()
    await db.refresh(flow)
    return flow


@router.delete("/{flow_id}")
async def delete_agent_flow(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Delete an agent flow"""
    result = await db.execute(
        select(AgentFlow).where(
            AgentFlow.id == flow_id,
            AgentFlow.owner_id == current_user.id,
        )
    )
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent flow not found",
        )
    
    await db.delete(flow)
    await db.commit()
    
    return {"message": "Agent flow deleted successfully"}


@router.post("/{flow_id}/execute", response_model=ExecutionResponse)
async def execute_agent_flow(
    flow_id: UUID,
    request: ExecutionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Execute an agent flow"""
    execution_id = uuid4()
    executor = AgentExecutionService(db, current_user)
    
    try:
        result = await executor.execute_flow(
            flow_id=flow_id,
            input_data=request.input_data,
            execution_id=execution_id,
        )
        
        return ExecutionResponse(
            execution_id=execution_id,
            status="completed",
            output=result["output"],
            logs=result["logs"],
            tokens_used=result.get("tokens_used", 0),
            cost_cents=result.get("cost_cents", 0),
        )
    except Exception as e:
        return ExecutionResponse(
            execution_id=execution_id,
            status="failed",
            error=str(e),
            logs=[],
        )


@router.get("/{flow_id}/executions", response_model=List[ExecutionResponse])
async def list_flow_executions(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> List[Execution]:
    """List executions for a specific flow"""
    # First check if user has access to the flow
    result = await db.execute(
        select(AgentFlow).where(
            AgentFlow.id == flow_id,
            (AgentFlow.owner_id == current_user.id) | (AgentFlow.is_public == True)
        )
    )
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent flow not found",
        )
    
    # Get executions
    result = await db.execute(
        select(Execution)
        .where(
            Execution.flow_id == flow_id,
            Execution.user_id == current_user.id,
        )
        .order_by(Execution.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    return result.scalars().all()


# New endpoints for agent execution history and logs
@router.get("/history", response_model=List[ExecutionHistoryItem])
async def get_agent_execution_history(
    agent_id: Optional[str] = Query(None, description="Agent ID to filter by"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> List[ExecutionHistoryItem]:
    """Get execution history for all agents or a specific agent"""
    
    # Build query based on whether agent_id is provided
    if agent_id:
        # Get executions for a specific agent
        result = await db.execute(
            select(Execution)
            .join(AgentFlow, Execution.flow_id == AgentFlow.id)
            .where(
                Execution.user_id == current_user.id,
                AgentFlow.name == agent_id  # Using name as agent_id for now
            )
            .order_by(Execution.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    else:
        # Get all executions for the user
        result = await db.execute(
            select(Execution)
            .where(Execution.user_id == current_user.id)
            .order_by(Execution.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    
    executions = result.scalars().all()
    
    # Transform to history items with calculated fields
    history_items = []
    for execution in executions:
        # Calculate duration
        duration = None
        if execution.started_at and execution.completed_at:
            duration_seconds = (execution.completed_at - execution.started_at).total_seconds()
            if duration_seconds < 60:
                duration = f"{int(duration_seconds)}s"
            else:
                duration = f"{int(duration_seconds // 60)}m {int(duration_seconds % 60)}s"
        
        # Get input/output summaries
        input_summary = None
        if execution.input_data:
            if isinstance(execution.input_data, dict):
                input_summary = str(execution.input_data.get("query", execution.input_data))
            else:
                input_summary = str(execution.input_data)
        
        output_summary = None
        if execution.output_data:
            if isinstance(execution.output_data, dict):
                output_summary = str(execution.output_data.get("result", execution.output_data))
            else:
                output_summary = str(execution.output_data)
        
        # Get node count
        node_count = None
        if execution.execution_nodes:
            node_count = len(execution.execution_nodes)
        
        history_items.append(ExecutionHistoryItem(
            run_id=execution.id,
            status=execution.status,
            started_at=execution.started_at,
            duration=duration,
            input=input_summary,
            output=output_summary,
            node_count=node_count,
            tokens_used=execution.tokens_used,
            cost_cents=execution.cost_cents,
        ))
    
    return history_items


@router.get("/logs", response_model=ExecutionLogsResponse)
async def get_agent_execution_logs(
    run_id: UUID = Query(..., description="Execution run ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExecutionLogsResponse:
    """Get detailed execution logs for a specific run"""
    
    # Get the execution
    result = await db.execute(
        select(Execution)
        .where(
            Execution.id == run_id,
            Execution.user_id == current_user.id,
        )
    )
    execution = result.scalar_one_or_none()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )
    
    # Get execution nodes
    result = await db.execute(
        select(ExecutionNode)
        .where(ExecutionNode.execution_id == run_id)
        .order_by(ExecutionNode.created_at.asc())
    )
    execution_nodes = result.scalars().all()
    
    # Transform to node details
    nodes = []
    errors = []
    
    for node in execution_nodes:
        # Calculate duration
        time_str = None
        if node.started_at and node.completed_at:
            duration_ms = (node.completed_at - node.started_at).total_seconds() * 1000
            if duration_ms < 1000:
                time_str = f"{int(duration_ms)}ms"
            else:
                time_str = f"{duration_ms/1000:.1f}s"
        
        # Check for errors
        if node.error_message:
            errors.append(f"Node {node.node_id}: {node.error_message}")
        
        nodes.append(ExecutionNodeDetail(
            id=node.node_id,
            type=node.node_type,
            input=node.input_data,
            output=node.output_data,
            time=time_str,
            status=node.status,
            error_message=node.error_message,
            metadata=node.metadata,
        ))
    
    # Get final output
    final_output = execution.output_data
    
    # Create summary
    summary = {
        "total_nodes": len(nodes),
        "successful_nodes": len([n for n in nodes if n.status == "completed"]),
        "failed_nodes": len([n for n in nodes if n.status == "failed"]),
        "total_duration": None,
        "tokens_used": execution.tokens_used,
        "cost_cents": execution.cost_cents,
    }
    
    if execution.started_at and execution.completed_at:
        total_duration = (execution.completed_at - execution.started_at).total_seconds()
        summary["total_duration"] = f"{total_duration:.1f}s"
    
    return ExecutionLogsResponse(
        run_id=run_id,
        nodes=nodes,
        errors=errors,
        final_output=final_output,
        summary=summary,
    )