# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent flow endpoints"""

from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.agent import AgentFlow, Execution
from app.models.user import User
from app.schemas.agent import (
    AgentFlowCreate,
    AgentFlowUpdate,
    AgentFlow as AgentFlowSchema,
    ExecutionRequest,
    ExecutionResponse,
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