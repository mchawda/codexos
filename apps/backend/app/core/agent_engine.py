# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Agent engine core functionality for CodexOS
"""

import asyncio
import time
import uuid
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import structlog
from contextlib import asynccontextmanager

from app.core.security import ExecutionContext, SecurityGuard, ExecutionSandbox, SecurityError

logger = structlog.get_logger()


class ExecutionStatus(Enum):
    """Agent execution status"""
    PLANNING = "planning"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    INTERRUPTED = "interrupted"
    ROLLING_BACK = "rolling_back"


class NodeType(Enum):
    """Node types in agent flow"""
    ENTRY = "entry"
    EXIT = "exit"
    LLM = "llm"
    TOOL = "tool"
    CONDITION = "condition"
    LOOP = "loop"
    PARALLEL = "parallel"
    ROLLBACK = "rollback"


@dataclass
class ExecutionStep:
    """Individual execution step"""
    step_id: str
    node_id: str
    node_type: NodeType
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    status: ExecutionStatus = ExecutionStatus.PLANNING
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    error: Optional[str] = None
    rollback_data: Optional[Dict[str, Any]] = None


@dataclass
class ExecutionPlan:
    """Execution plan with rollback points"""
    plan_id: str
    steps: List[ExecutionStep]
    rollback_points: List[str] = field(default_factory=list)
    dependencies: Dict[str, List[str]] = field(default_factory=dict)
    estimated_duration: float = 0.0
    resource_requirements: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExecutionResult:
    """Final execution result"""
    execution_id: str
    plan_id: str
    status: ExecutionStatus
    steps_completed: int
    total_steps: int
    output: Dict[str, Any]
    execution_time: float
    rollbacks_performed: int
    errors: List[str] = field(default_factory=list)


class RollbackHook:
    """Rollback hook for execution steps"""
    
    def __init__(self, step_id: str, rollback_func: Callable, rollback_data: Dict[str, Any]):
        self.step_id = step_id
        self.rollback_func = rollback_func
        self.rollback_data = rollback_data
    
    async def execute(self) -> bool:
        """Execute rollback function"""
        try:
            result = await self.rollback_func(self.rollback_data)
            logger.info(f"Rollback executed for step {self.step_id}", success=result)
            return result
        except Exception as e:
            logger.error(f"Rollback failed for step {self.step_id}", error=str(e))
            return False


class AgentPlanner:
    """Plans agent execution with rollback points"""
    
    def __init__(self):
        self.security_guard = SecurityGuard()
    
    async def create_plan(self, flow_data: Dict[str, Any], context: ExecutionContext) -> ExecutionPlan:
        """Create execution plan from flow data"""
        plan_id = str(uuid.uuid4())
        steps = []
        rollback_points = []
        
        # Parse flow nodes
        nodes = flow_data.get("nodes", [])
        edges = flow_data.get("edges", [])
        
        # Create execution steps
        for node in nodes:
            step = ExecutionStep(
                step_id=str(uuid.uuid4()),
                node_id=node["id"],
                node_type=NodeType(node["type"]),
                input_data=node.get("data", {}),
                status=ExecutionStatus.PLANNING
            )
            steps.append(step)
            
            # Add rollback points for critical operations
            if self._is_rollback_point(node):
                rollback_points.append(step.step_id)
        
        # Build dependency graph
        dependencies = self._build_dependencies(nodes, edges)
        
        # Estimate resource requirements
        resource_requirements = self._estimate_resources(steps, context)
        
        plan = ExecutionPlan(
            plan_id=plan_id,
            steps=steps,
            rollback_points=rollback_points,
            dependencies=dependencies,
            resource_requirements=resource_requirements
        )
        
        logger.info(f"Created execution plan {plan_id}", 
                   steps_count=len(steps), rollback_points=len(rollback_points))
        
        return plan
    
    def _is_rollback_point(self, node: Dict[str, Any]) -> bool:
        """Determine if node should have rollback capability"""
        node_type = node.get("type")
        data = node.get("data", {})
        
        # Critical operations that need rollback
        critical_types = ["tool", "llm", "parallel"]
        critical_operations = ["file_write", "database_update", "api_call", "payment"]
        
        if node_type in critical_types:
            operation = data.get("operation", "")
            return any(op in operation for op in critical_operations)
        
        return False
    
    def _build_dependencies(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, List[str]]:
        """Build dependency graph from edges"""
        dependencies = {}
        
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            
            if target not in dependencies:
                dependencies[target] = []
            dependencies[target].append(source)
        
        return dependencies
    
    def _estimate_resources(self, steps: List[ExecutionStep], context: ExecutionContext) -> Dict[str, Any]:
        """Estimate resource requirements for execution"""
        total_cpu = 0.0
        total_memory = 0
        total_disk = 0
        
        for step in steps:
            if step.node_type == NodeType.LLM:
                total_cpu += 30.0  # 30 seconds per LLM call
                total_memory += 512  # 512MB per LLM call
            elif step.node_type == NodeType.TOOL:
                total_cpu += 10.0  # 10 seconds per tool call
                total_memory += 256  # 256MB per tool call
                total_disk += 50   # 50MB per tool call
        
        return {
            "estimated_cpu_time": total_cpu,
            "estimated_memory_mb": total_memory,
            "estimated_disk_mb": total_disk,
            "max_concurrent_steps": min(5, len(steps))  # Limit concurrent execution
        }


class AgentExecutor:
    """Executes agent plans with interruption and rollback support"""
    
    def __init__(self):
        self.active_executions: Dict[str, asyncio.Task] = {}
        self.rollback_hooks: Dict[str, RollbackHook] = {}
    
    async def execute_plan(self, plan: ExecutionPlan, context: ExecutionContext) -> ExecutionResult:
        """Execute plan with full rollback support"""
        execution_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            # Register execution
            self.active_executions[execution_id] = asyncio.current_task()
            
            # Execute steps
            result = await self._execute_steps(plan, context, execution_id)
            
            return result
            
        except asyncio.CancelledError:
            logger.info(f"Execution {execution_id} was cancelled")
            await self._rollback_execution(plan, context, execution_id)
            raise
        except Exception as e:
            logger.error(f"Execution {execution_id} failed", error=str(e))
            await self._rollback_execution(plan, context, execution_id)
            raise
        finally:
            # Cleanup
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]
    
    async def _execute_steps(self, plan: ExecutionPlan, context: ExecutionContext, 
                           execution_id: str) -> ExecutionResult:
        """Execute individual steps with dependency resolution"""
        completed_steps = 0
        total_steps = len(plan.steps)
        errors = []
        rollbacks_performed = 0
        
        # Create execution context
        execution_context = {
            "execution_id": execution_id,
            "plan_id": plan.plan_id,
            "user_id": context.user_id,
            "tenant_id": context.tenant_id
        }
        
        # Execute steps in dependency order
        for step in plan.steps:
            try:
                # Check dependencies
                if not await self._check_dependencies(step, plan.dependencies, completed_steps):
                    continue
                
                # Execute step
                step.status = ExecutionStatus.EXECUTING
                step.start_time = time.time()
                
                output = await self._execute_step(step, context, execution_context)
                step.output_data = output
                step.status = ExecutionStatus.COMPLETED
                step.end_time = time.time()
                
                completed_steps += 1
                
                # Check for interruption
                if execution_id not in self.active_executions:
                    logger.info(f"Execution {execution_id} was interrupted")
                    break
                
            except Exception as e:
                step.status = ExecutionStatus.FAILED
                step.error = str(e)
                step.end_time = time.time()
                errors.append(f"Step {step.step_id}: {str(e)}")
                
                # Rollback if possible
                if step.step_id in plan.rollback_points:
                    rollback_success = await self._rollback_step(step, context)
                    if rollback_success:
                        rollbacks_performed += 1
                
                # Continue with next step if not critical
                if not self._is_critical_step(step):
                    continue
                else:
                    break
        
        execution_time = time.time() - start_time
        
        return ExecutionResult(
            execution_id=execution_id,
            plan_id=plan.plan_id,
            status=ExecutionStatus.COMPLETED if completed_steps == total_steps else ExecutionStatus.FAILED,
            steps_completed=completed_steps,
            total_steps=total_steps,
            output=self._collect_outputs(plan.steps),
            execution_time=execution_time,
            rollbacks_performed=rollbacks_performed,
            errors=errors
        )
    
    async def _execute_step(self, step: ExecutionStep, context: ExecutionContext, 
                          execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual step"""
        if step.node_type == NodeType.LLM:
            return await self._execute_llm_step(step, context, execution_context)
        elif step.node_type == NodeType.TOOL:
            return await self._execute_tool_step(step, context, execution_context)
        elif step.node_type == NodeType.CONDITION:
            return await self._execute_condition_step(step, context, execution_context)
        else:
            return {"status": "skipped", "reason": f"Node type {step.node_type} not implemented"}
    
    async def _execute_llm_step(self, step: ExecutionStep, context: ExecutionContext, 
                               execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute LLM step"""
        # This would integrate with your LLM service
        # For now, return mock response
        return {
            "response": f"LLM response for {step.node_id}",
            "tokens_used": 100,
            "model": "gpt-4"
        }
    
    async def _execute_tool_step(self, step: ExecutionStep, context: ExecutionContext, 
                                execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute tool step with security validation"""
        # Extract tool information from step data
        tool_name = step.input_data.get("tool", "")
        action = step.input_data.get("action", "")
        
        # Handle trigger_agent tool
        if tool_name == "trigger_agent":
            return await self._execute_trigger_agent(step, context, execution_context)
        
        # For other tools, check if we have the required fields
        if not tool_name:
            raise ValueError("Tool name is required")
        
        # Validate tool access
        if not self.security_guard.validate_tool_access(tool_name, action, context):
            raise SecurityError(f"Tool {tool_name}:{action} not allowed")
        
        # Check resource quota
        if not self.security_guard.check_resource_quota(tool_name, context):
            raise SecurityError(f"Resource quota exceeded for {tool_name}")
        
        # Execute in sandbox
        with ExecutionSandbox(context).create_sandbox() as workdir:
            # Tool execution logic here
            result = {
                "tool": tool_name,
                "action": action,
                "result": f"Tool {tool_name} executed successfully",
                "workdir": workdir
            }
            
            # Register rollback hook if needed
            if step.step_id in execution_context.get("rollback_points", []):
                rollback_hook = RollbackHook(
                    step.step_id,
                    self._rollback_tool_action,
                    {"tool": tool_name, "action": action, "result": result}
                )
                self.rollback_hooks[step.step_id] = rollback_hook
            
            return result
    
    async def _execute_condition_step(self, step: ExecutionStep, context: ExecutionContext, 
                                     execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute conditional step"""
        condition = step.input_data.get("condition", "true")
        # Simple condition evaluation - in real implementation, use safe eval
        return {"condition_result": condition == "true"}
    
    async def _execute_trigger_agent(self, step: ExecutionStep, context: ExecutionContext, 
                                    execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute trigger_agent tool to chain with another agent"""
        import httpx
        
        agent_id = step.input_data.get("agent_id")
        input_data = step.input_data.get("input", {})
        context_data = step.input_data.get("context", [])
        mode = step.input_data.get("mode", "autonomous")
        
        if not agent_id:
            raise ValueError("agent_id is required for trigger_agent tool")
        
        # Get the current user's API base URL from context
        api_base = context.get("api_base", "http://localhost:8000")
        
        try:
            # Make internal POST request to /agent/run
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{api_base}/api/v1/agents/run",
                    json={
                        "agent_id": agent_id,
                        "input": input_data,
                        "context": context_data,
                        "mode": mode
                    },
                    headers={
                        "Authorization": f"Bearer {context.get('access_token')}",
                        "Content-Type": "application/json"
                    },
                    timeout=300.0  # 5 minute timeout for agent execution
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "tool": "trigger_agent",
                        "agent_id": agent_id,
                        "status": "success",
                        "output": result.get("output", {}),
                        "execution_id": result.get("execution_id"),
                        "tokens_used": result.get("tokens_used", 0),
                        "cost_cents": result.get("cost_cents", 0)
                    }
                else:
                    error_msg = f"Failed to trigger agent {agent_id}: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    return {
                        "tool": "trigger_agent",
                        "agent_id": agent_id,
                        "status": "error",
                        "error": error_msg
                    }
                    
        except Exception as e:
            error_msg = f"Error triggering agent {agent_id}: {str(e)}"
            logger.error(error_msg)
            return {
                "tool": "trigger_agent",
                "agent_id": agent_id,
                "status": "error",
                "error": error_msg
            }
    
    async def _check_dependencies(self, step: ExecutionStep, dependencies: Dict[str, List[str]], 
                                completed_steps: int) -> bool:
        """Check if step dependencies are satisfied"""
        if step.step_id not in dependencies:
            return True
        
        required_steps = dependencies[step.step_id]
        # Simple dependency check - in real implementation, track completed step IDs
        return completed_steps >= len(required_steps)
    
    async def _rollback_step(self, step: ExecutionStep, context: ExecutionContext) -> bool:
        """Rollback individual step"""
        if step.step_id in self.rollback_hooks:
            hook = self.rollback_hooks[step.step_id]
            return await hook.execute()
        return False
    
    async def _rollback_execution(self, plan: ExecutionPlan, context: ExecutionContext, 
                                execution_id: str):
        """Rollback entire execution"""
        logger.info(f"Rolling back execution {execution_id}")
        
        # Rollback steps in reverse order
        for step in reversed(plan.steps):
            if step.status == ExecutionStatus.COMPLETED:
                await self._rollback_step(step, context)
    
    def _is_critical_step(self, step: ExecutionStep) -> bool:
        """Determine if step is critical for execution"""
        return step.node_type in [NodeType.TOOL, NodeType.LLM]
    
    def _collect_outputs(self, steps: List[ExecutionStep]) -> Dict[str, Any]:
        """Collect outputs from completed steps"""
        outputs = {}
        for step in steps:
            if step.status == ExecutionStatus.COMPLETED and step.output_data:
                outputs[step.node_id] = step.output_data
        return outputs
    
    async def _rollback_tool_action(self, rollback_data: Dict[str, Any]) -> bool:
        """Rollback tool action"""
        # Tool-specific rollback logic
        tool = rollback_data.get("tool")
        action = rollback_data.get("action")
        
        logger.info(f"Rolling back tool action: {tool}:{action}")
        # Implement tool-specific rollback logic
        return True
    
    def interrupt_execution(self, execution_id: str):
        """Interrupt running execution"""
        if execution_id in self.active_executions:
            task = self.active_executions[execution_id]
            task.cancel()
            logger.info(f"Interrupted execution {execution_id}")


class AgentEngine:
    """Main agent engine coordinating planner and executor"""
    
    def __init__(self):
        self.planner = AgentPlanner()
        self.executor = AgentExecutor()
    
    async def execute_flow(self, flow_data: Dict[str, Any], context: ExecutionContext) -> ExecutionResult:
        """Execute agent flow with full planning and execution"""
        try:
            # Create execution plan
            plan = await self.planner.create_plan(flow_data, context)
            
            # Execute plan
            result = await self.executor.execute_plan(plan, context)
            
            return result
            
        except Exception as e:
            logger.error("Flow execution failed", error=str(e), user_id=context.user_id)
            raise
    
    def interrupt_flow(self, execution_id: str):
        """Interrupt running flow"""
        self.executor.interrupt_execution(execution_id)


# Global agent engine instance
agent_engine = AgentEngine()
