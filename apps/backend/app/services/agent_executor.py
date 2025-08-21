# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent execution service for running flows"""

import json
from typing import Any, Dict, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.agent import AgentFlow, Execution, ExecutionNode
from app.models.user import User
from app.websocket.manager import manager
from app.core.config import settings


class AgentExecutionService:
    """Service for executing agent flows"""

    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user

    async def execute_flow(
        self,
        flow_id: UUID,
        input_data: Dict[str, Any],
        execution_id: UUID,
    ) -> Dict[str, Any]:
        """Execute an agent flow"""
        # Get the flow
        result = await self.db.execute(
            select(AgentFlow).where(
                AgentFlow.id == flow_id,
                (AgentFlow.owner_id == self.user.id) | (AgentFlow.is_public == True)
            )
        )
        flow = result.scalar_one_or_none()
        
        if not flow:
            raise ValueError("Flow not found or access denied")

        # Create execution record
        execution = Execution(
            flow_id=flow_id,
            user_id=self.user.id,
            tenant_id=self.user.tenant_id if hasattr(self.user, 'tenant_id') else None,
            status="running",
            input_data=input_data,
            logs=[],
            started_at=datetime.utcnow(),
        )
        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)

        try:
            # Send start notification
            await self._send_ws_update(execution_id, {
                "type": "execution_started",
                "flow_id": str(flow_id),
                "execution_id": str(execution.id),
            })

            # TODO: Integrate with the actual agent-engine package
            # For now, simulate execution
            result = await self._simulate_execution(flow, input_data, execution.id)

            # Update execution record
            execution.status = "completed"
            execution.output_data = result["output"]
            execution.logs = result["logs"]
            execution.tokens_used = result.get("tokens_used", 0)
            execution.cost_cents = result.get("cost_cents", 0)
            execution.completed_at = datetime.utcnow()
            
            await self.db.commit()

            # Send completion notification
            await self._send_ws_update(execution_id, {
                "type": "execution_completed",
                "output": result["output"],
                "status": "success",
            })

            return result

        except Exception as e:
            # Update execution record with error
            execution.status = "failed"
            execution.error_message = str(e)
            execution.logs.append({
                "timestamp": datetime.utcnow().isoformat(),
                "level": "error",
                "message": f"Execution failed: {str(e)}",
            })
            execution.completed_at = datetime.utcnow()
            
            await self.db.commit()

            # Send error notification
            await self._send_ws_update(execution_id, {
                "type": "execution_failed",
                "error": str(e),
                "status": "failed",
            })

            raise

    async def _simulate_execution(
        self,
        flow: AgentFlow,
        input_data: Dict[str, Any],
        execution_id: UUID,
    ) -> Dict[str, Any]:
        """Simulate agent execution for demo purposes"""
        import asyncio
        import random

        logs = []
        execution_nodes = []
        
        # Simulate processing each node
        for i, node in enumerate(flow.nodes):
            node_start_time = datetime.utcnow()
            
            # Create execution node record
            execution_node = ExecutionNode(
                execution_id=execution_id,
                node_id=node["id"],
                node_type=node["type"],
                input_data=input_data if i == 0 else {"previous_output": f"Output from node {i-1}"},
                status="running",
                started_at=node_start_time,
                metadata={"position": node.get("position", {}), "data": node.get("data", {})}
            )
            self.db.add(execution_node)
            
            await asyncio.sleep(0.5)  # Simulate processing time
            
            # Simulate node completion
            node_end_time = datetime.utcnow()
            duration_ms = int((node_end_time - node_start_time).total_seconds() * 1000)
            
            # Generate mock output based on node type
            if node["type"] == "llm":
                output_data = {"response": f"LLM response for {node['id']}", "tokens": random.randint(50, 200)}
            elif node["type"] == "tool":
                output_data = {"result": f"Tool execution result for {node['id']}", "tool": "MockTool"}
            elif node["type"] == "rag":
                output_data = {"context": f"RAG context for {node['id']}", "sources": ["doc1", "doc2"]}
            else:
                output_data = {"result": f"Processed by {node['type']} node"}
            
            # Update execution node
            execution_node.status = "completed"
            execution_node.output_data = output_data
            execution_node.completed_at = node_end_time
            execution_node.duration_ms = duration_ms
            
            # Add to logs
            log_entry = {
                "timestamp": node_start_time.isoformat(),
                "level": "info",
                "node_id": node["id"],
                "node_type": node["type"],
                "message": f"Processing {node['type']} node",
            }
            logs.append(log_entry)
            
            # Send progress update
            await self._send_ws_update(execution_id, {
                "type": "node_executed",
                "node_id": node["id"],
                "node_type": node["type"],
                "progress": (i + 1) / len(flow.nodes),
                "log": log_entry,
            })
            
            execution_nodes.append(execution_node)
        
        # Commit all execution nodes
        await self.db.commit()

        # Generate mock output based on flow type
        output = {
            "status": "success",
            "result": f"Processed input through {len(flow.nodes)} nodes",
            "data": input_data,
            "generated_at": datetime.utcnow().isoformat(),
        }

        # Calculate mock costs
        tokens_used = random.randint(100, 1000)
        cost_cents = int(tokens_used * 0.002)  # $0.002 per token

        return {
            "output": output,
            "logs": logs,
            "tokens_used": tokens_used,
            "cost_cents": cost_cents,
        }

    async def _send_ws_update(self, execution_id: UUID, data: Dict[str, Any]):
        """Send WebSocket update to client"""
        await manager.send_personal_message(
            json.dumps(data),
            str(execution_id)
        )
