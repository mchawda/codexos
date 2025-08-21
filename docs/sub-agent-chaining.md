# Sub-Agent Chaining in CodexOS

## Overview

Sub-Agent Chaining allows any agent to trigger another registered agent as part of its node graph, passing parameters and awaiting results. This enables complex multi-agent workflows where agents can delegate tasks to specialized sub-agents.

## Features

- **Agent Triggering**: Execute any registered agent from within another agent's flow
- **Parameter Passing**: Pass input data and context to sub-agents
- **Execution Modes**: Support for autonomous, supervised, and interactive execution modes
- **Result Handling**: Receive and process sub-agent outputs
- **Error Handling**: Graceful error handling with detailed error messages

## Architecture

### Backend Components

1. **`/agent/run` Endpoint**: Internal API endpoint for triggering agent execution
2. **`trigger_agent` Tool**: Special tool node that handles sub-agent chaining
3. **Agent Execution Service**: Orchestrates sub-agent execution and result collection

### Frontend Components

1. **TriggerAgentNode**: Visual node for configuring sub-agent chaining
2. **Builder Sidebar**: Drag-and-drop interface for adding trigger_agent nodes
3. **Flow Editor**: Visual flow builder with trigger_agent support

## Usage

### 1. Creating a Sub-Agent Chain

#### Backend Flow Configuration

```json
{
  "nodes": [
    {
      "id": "entry",
      "type": "entry",
      "next": "planner"
    },
    {
      "id": "planner",
      "type": "llm",
      "model": "gpt-4",
      "next": "trigger_sub"
    },
    {
      "id": "trigger_sub",
      "type": "tool",
      "tool": "trigger_agent",
      "params": {
        "agent_id": "bug-triager",
        "input": "Process error logs",
        "context": ["chunk-XYZ"],
        "mode": "autonomous"
      },
      "next": "end"
    },
    {
      "id": "end",
      "type": "exit"
    }
  ]
}
```

#### Frontend Flow Builder

1. Drag a "Trigger Agent" node from the Flow Control section
2. Configure the node with:
   - **Agent**: Select the target agent from the dropdown
   - **Input**: Data to pass to the sub-agent
   - **Context**: Additional context information
   - **Mode**: Execution mode (autonomous/supervised/interactive)

### 2. API Endpoint

#### Trigger Agent Execution

```bash
POST /api/v1/agents/run
```

**Request Body:**
```json
{
  "agent_id": "bug-triager",
  "input": "Here is a new issue: Error 502",
  "context": ["chunk-XYZ"],
  "mode": "autonomous"
}
```

**Response:**
```json
{
  "execution_id": "uuid",
  "status": "completed",
  "output": {
    "analysis": "Critical error in API gateway",
    "severity": "high",
    "recommendations": ["Restart service", "Check logs"]
  },
  "logs": [...],
  "tokens_used": 150,
  "cost_cents": 2
}
```

### 3. Execution Modes

- **Autonomous**: Sub-agent runs independently without supervision
- **Supervised**: Sub-agent execution is monitored and can be intervened
- **Interactive**: Sub-agent can request human input during execution

## Implementation Details

### Backend Implementation

#### Agent Engine Integration

The `trigger_agent` tool is integrated into the agent engine's tool execution pipeline:

```python
async def _execute_trigger_agent(self, step: ExecutionStep, context: ExecutionContext, 
                                execution_context: Dict[str, Any]) -> Dict[str, Any]:
    """Execute trigger_agent tool to chain with another agent"""
    agent_id = step.input_data.get("agent_id")
    input_data = step.input_data.get("input", {})
    context_data = step.input_data.get("context", [])
    mode = step.input_data.get("mode", "autonomous")
    
    # Make internal POST request to /agent/run
    # Handle response and return results
```

#### Security Considerations

- **Access Control**: Only agents owned by the user or marked as public can be triggered
- **Resource Quotas**: Sub-agent execution counts against user resource limits
- **Sandboxing**: Sub-agents execute in isolated execution contexts

### Frontend Implementation

#### Node Configuration

The TriggerAgentNode component provides:

- **Agent Selection**: Dropdown with available agents
- **Input Configuration**: Text area for input data
- **Context Configuration**: Optional context information
- **Mode Selection**: Execution mode dropdown

#### Data Flow

1. User configures trigger_agent node
2. Node data is updated via onChange callback
3. Flow execution triggers the tool
4. Results are passed to subsequent nodes

## Examples

### Example 1: Bug Triage Workflow

```json
{
  "name": "Bug Triage Workflow",
  "nodes": [
    {
      "id": "entry",
      "type": "entry",
      "next": "classify"
    },
    {
      "id": "classify",
      "type": "llm",
      "model": "gpt-4",
      "next": "route_bug"
    },
    {
      "id": "route_bug",
      "type": "tool",
      "tool": "trigger_agent",
      "params": {
        "agent_id": "bug-triager",
        "input": "{{classify.output}}",
        "mode": "autonomous"
      },
      "next": "end"
    }
  ]
}
```

### Example 2: Multi-Agent Code Review

```json
{
  "name": "Code Review Pipeline",
  "nodes": [
    {
      "id": "entry",
      "type": "entry",
      "next": "security_scan"
    },
    {
      "id": "security_scan",
      "type": "tool",
      "tool": "trigger_agent",
      "params": {
        "agent_id": "security-analyzer",
        "input": "{{entry.code}}",
        "mode": "autonomous"
      },
      "next": "quality_check"
    },
    {
      "id": "quality_check",
      "type": "tool",
      "tool": "trigger_agent",
      "params": {
        "agent_id": "code-reviewer",
        "input": "{{entry.code}}",
        "context": ["{{security_scan.output}}"],
        "mode": "supervised"
      },
      "next": "end"
    }
  ]
}
```

## Best Practices

### 1. Agent Design

- **Single Responsibility**: Design agents for specific, focused tasks
- **Clear Interfaces**: Define clear input/output contracts between agents
- **Error Handling**: Implement robust error handling in sub-agents

### 2. Flow Design

- **Dependency Management**: Ensure proper sequencing of agent execution
- **Resource Management**: Monitor and limit sub-agent execution costs
- **Monitoring**: Track execution times and success rates

### 3. Security

- **Access Control**: Limit which agents can be triggered by which users
- **Input Validation**: Validate all inputs passed to sub-agents
- **Rate Limiting**: Prevent abuse through excessive sub-agent calls

## Troubleshooting

### Common Issues

1. **Agent Not Found**: Ensure the target agent exists and is accessible
2. **Permission Denied**: Check user permissions for the target agent
3. **Timeout Errors**: Sub-agent execution may take time; adjust timeouts
4. **Resource Limits**: Monitor and adjust resource quotas as needed

### Debugging

- Check execution logs for detailed error information
- Verify agent configuration and permissions
- Monitor resource usage and execution times

## Future Enhancements

- **Dynamic Agent Discovery**: Automatic discovery of available agents
- **Agent Versioning**: Support for versioned agent execution
- **Distributed Execution**: Support for cross-instance agent chaining
- **Advanced Routing**: Conditional agent triggering based on results
- **Agent Composition**: Visual composition of multi-agent workflows

## API Reference

### Endpoints

- `POST /api/v1/agents/run` - Trigger agent execution

### Models

- `ExecutionRequest` - Request schema for agent execution
- `ExecutionResponse` - Response schema for agent execution results

### Tools

- `trigger_agent` - Tool for triggering sub-agent execution

## Contributing

To contribute to the Sub-Agent Chaining feature:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for any API changes
4. Ensure security considerations are addressed
5. Test with various agent configurations and edge cases
