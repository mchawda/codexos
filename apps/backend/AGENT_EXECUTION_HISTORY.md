# Agent Execution History & Logs

This document describes the new agent execution history and detailed logging system implemented in CodexOS.

## Overview

The system now provides comprehensive tracking of agent executions, including:
- Execution history with metadata
- Detailed node-level execution logs
- Performance metrics and statistics
- Automatic cleanup with configurable TTL

## Database Schema

### New Tables

#### `executions` (replaces `agent_executions`)
- `id`: UUID primary key
- `tenant_id`: UUID foreign key to tenants
- `flow_id`: UUID foreign key to agent_flows
- `user_id`: UUID foreign key to users
- `status`: String (pending, running, completed, failed)
- `started_at`: DateTime with timezone
- `completed_at`: DateTime with timezone
- `input_data`: JSON input data
- `output_data`: JSON output data
- `logs`: JSON array of log entries
- `error_message`: Text error message
- `tokens_used`: Integer token count
- `cost_cents`: Integer cost in cents
- `ttl_days`: Integer TTL for cleanup (default: 30)

#### `execution_nodes` (new)
- `id`: UUID primary key
- `execution_id`: UUID foreign key to executions
- `node_id`: String node identifier
- `node_type`: String node type
- `input_data`: JSON input data for the node
- `output_data`: JSON output data from the node
- `started_at`: DateTime with timezone
- `completed_at`: DateTime with timezone
- `duration_ms`: Integer duration in milliseconds
- `status`: String node status
- `error_message`: Text error message
- `metadata`: JSON additional metadata

## API Endpoints

### 1. Get Agent Execution History

**Endpoint:** `GET /api/v1/agents/history`

**Query Parameters:**
- `agent_id` (optional): Filter by specific agent name
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Pagination limit (default: 100)

**Response:**
```json
[
  {
    "run_id": "run-82923a",
    "status": "success",
    "started_at": "2025-08-21T10:02Z",
    "duration": "45s",
    "input": "Process PR #42",
    "output": "No issues found",
    "node_count": 15,
    "tokens_used": 1250,
    "cost_cents": 25
  }
]
```

### 2. Get Execution Logs

**Endpoint:** `GET /api/v1/agents/logs`

**Query Parameters:**
- `run_id` (required): Execution run ID

**Response:**
```json
{
  "run_id": "run-82923a",
  "nodes": [
    {
      "id": "planner",
      "type": "llm",
      "input": "...",
      "output": "...",
      "time": "8s",
      "status": "completed",
      "error_message": null,
      "metadata": {}
    }
  ],
  "errors": [],
  "final_output": "Success: Nothing to fix",
  "summary": {
    "total_nodes": 15,
    "successful_nodes": 15,
    "failed_nodes": 0,
    "total_duration": "45.2s",
    "tokens_used": 1250,
    "cost_cents": 25
  }
}
```

## Usage Examples

### Get All Agent Executions
```bash
curl "http://localhost:8000/api/v1/agents/history"
```

### Get Executions for Specific Agent
```bash
curl "http://localhost:8000/api/v1/agents/history?agent_id=bug-triager"
```

### Get Detailed Logs for Execution
```bash
curl "http://localhost:8000/api/v1/agents/logs?run_id=run-82923a"
```

### Paginated Results
```bash
curl "http://localhost:8000/api/v1/agents/history?skip=10&limit=20"
```

## Services

### ExecutionHistoryService

The `ExecutionHistoryService` provides additional functionality:

- **Cleanup**: Automatic removal of expired executions
- **Statistics**: User and agent performance metrics
- **Performance Monitoring**: Node-level execution analysis

#### Cleanup Expired Executions
```python
service = ExecutionHistoryService(db)
result = await service.cleanup_expired_executions(days=30)
# Returns: {"executions_deleted": 150, "nodes_deleted": 1200}
```

#### Get User Statistics
```python
stats = await service.get_execution_statistics(user_id, days=30)
# Returns execution counts, success rates, costs, etc.
```

#### Get Agent Performance
```python
metrics = await service.get_agent_performance_metrics(flow_id, days=30)
# Returns agent-specific performance data
```

## Configuration

### TTL Settings

Executions are automatically cleaned up after a configurable number of days:

- **Default TTL**: 30 days
- **Configurable**: Per execution via `ttl_days` field
- **Automatic**: Daily cleanup task runs in background

### Database Indexes

Performance indexes are created for:
- `executions.tenant_id`
- `executions.flow_id`
- `executions.user_id`
- `executions.status`
- `executions.started_at`
- `execution_nodes.execution_id`
- `execution_nodes.node_id`
- `execution_nodes.status`

## Migration

To apply the new schema:

```bash
cd apps/backend
alembic upgrade head
```

This will create the new tables and indexes while preserving existing data.

## Testing

Use the provided test script:

```bash
cd apps/backend
python test_history_endpoints.py
```

## Frontend Integration

The frontend can now:
1. Display execution history in agent cards
2. Show "View Logs" buttons for each execution
3. Provide detailed execution analytics
4. Monitor real-time execution progress via WebSocket

## WebSocket Updates

Real-time execution updates are sent via WebSocket:
- `execution_started`: When execution begins
- `node_executed`: When each node completes
- `execution_completed`: When execution finishes
- `execution_failed`: When execution fails

## Security

- Users can only access their own executions
- Tenant isolation is enforced
- Input/output data is stored as JSON (consider encryption for sensitive data)
- TTL ensures data doesn't accumulate indefinitely
