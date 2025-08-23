# REST API Reference

> **📚 Docs ▸ API Reference**  
> **Last Updated**: $(date)  
> **Status**: Active


The CodexOS REST API provides programmatic access to all platform features. This reference covers authentication, endpoints, and examples.

## Base URL

```
https://api.codexos.dev/v1
```

For self-hosted installations:
```
https://your-domain.com/api/v1
```

## Authentication

All API requests require authentication using Bearer tokens.

### Getting an API Key

1. Go to [Dashboard → Settings → API Keys](https://dashboard.codexos.dev/settings/api)
2. Click "Generate New API Key"
3. Copy the key (it won't be shown again)

### Using the API Key

Include the key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.codexos.dev/v1/agents
```

## Rate Limits

| Plan | Requests/Hour | Concurrent | Burst |
|------|--------------|------------|-------|
| Free | 1,000 | 10 | 50 |
| Pro | 10,000 | 50 | 500 |
| Enterprise | Unlimited | Unlimited | Unlimited |

## Endpoints

### Agents

#### List Agents
```http
GET /agents
```

Query parameters:
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (active, inactive, error)
- `search` (string): Search by name or description

Response:
```json
{
  "agents": [
    {
      "id": "agent_abc123",
      "name": "Code Review Assistant",
      "description": "Reviews code for bugs and best practices",
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "execution_count": 1247,
      "success_rate": 0.985
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Agent
```http
GET /agents/{agent_id}
```

Response:
```json
{
  "id": "agent_abc123",
  "name": "Code Review Assistant",
  "description": "Reviews code for bugs and best practices",
  "flow": {
    "nodes": [
      {
        "id": "llm1",
        "type": "llm",
        "config": {
          "model": "gpt-4",
          "prompt": "Review this code..."
        }
      }
    ],
    "edges": [
      {
        "source": "entry",
        "target": "llm1"
      }
    ]
  },
  "metadata": {
    "version": "1.2.0",
    "tags": ["development", "code-review"],
    "author": "user_123"
  }
}
```

#### Create Agent
```http
POST /agents
```

Request body:
```json
{
  "name": "My New Agent",
  "description": "Agent description",
  "flow": {
    "nodes": [...],
    "edges": [...]
  },
  "tags": ["tag1", "tag2"]
}
```

#### Update Agent
```http
PATCH /agents/{agent_id}
```

Request body (partial update):
```json
{
  "name": "Updated Name",
  "flow": {
    "nodes": [...]
  }
}
```

#### Delete Agent
```http
DELETE /agents/{agent_id}
```

### Executions

#### Execute Agent
```http
POST /agents/{agent_id}/execute
```

Request body:
```json
{
  "input": {
    "code_snippet": "function add(a, b) { return a + b }",
    "language": "javascript"
  },
  "options": {
    "timeout": 30000,
    "max_tokens": 2000
  }
}
```

Response:
```json
{
  "execution_id": "exec_xyz789",
  "status": "running",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Get Execution Status
```http
GET /executions/{execution_id}
```

Response:
```json
{
  "id": "exec_xyz789",
  "agent_id": "agent_abc123",
  "status": "completed",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:00:45Z",
  "duration_ms": 45000,
  "result": {
    "output": "Code review complete...",
    "tokens_used": 1523,
    "cost": 0.05
  },
  "logs": [
    {
      "timestamp": "2024-01-15T10:00:01Z",
      "level": "info",
      "message": "Starting execution",
      "node_id": "entry"
    }
  ]
}
```

#### Stream Execution (WebSocket)
```javascript
const ws = new WebSocket('wss://api.codexos.dev/v1/executions/exec_xyz789/stream');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log(event.type, event.data);
});
```

### RAG Engine

#### List Collections
```http
GET /rag/collections
```

#### Create Collection
```http
POST /rag/collections
```

Request body:
```json
{
  "name": "my-docs",
  "description": "Product documentation",
  "embedding_model": "text-embedding-ada-002",
  "chunk_size": 1000,
  "chunk_overlap": 200
}
```

#### Ingest Documents
```http
POST /rag/collections/{collection_id}/ingest
```

Request body:
```json
{
  "sources": [
    {
      "type": "url",
      "location": "https://docs.example.com"
    },
    {
      "type": "github",
      "location": "https://github.com/org/repo",
      "branch": "main",
      "paths": ["docs/"]
    },
    {
      "type": "file",
      "location": "s3://bucket/file.pdf"
    }
  ]
}
```

#### Search Collection
```http
POST /rag/collections/{collection_id}/search
```

Request body:
```json
{
  "query": "How do I authenticate users?",
  "top_k": 5,
  "filters": {
    "source_type": "documentation"
  }
}
```

### Vault

#### List Credentials
```http
GET /vault/credentials
```

#### Store Credential
```http
POST /vault/credentials
```

Request body:
```json
{
  "name": "OpenAI API Key",
  "type": "api_key",
  "value": "sk-...",
  "tags": ["openai", "production"],
  "environment": "production"
}
```

#### Get Credential (Decrypted)
```http
GET /vault/credentials/{credential_id}
```

Requires additional authentication:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "X-Vault-Token: YOUR_VAULT_TOKEN" \
     https://api.codexos.dev/v1/vault/credentials/cred_123
```

### Marketplace

#### Search Marketplace
```http
GET /marketplace/search
```

Query parameters:
- `q` (string): Search query
- `category` (string): Filter by category
- `sort` (string): Sort by (popular, recent, rating)
- `price` (string): Price filter (free, paid)

#### Install Agent Template
```http
POST /marketplace/install/{template_id}
```

Request body:
```json
{
  "name": "My Copy of Template",
  "workspace_id": "ws_123"
}
```

### Monitoring

#### Get Usage Stats
```http
GET /usage/stats
```

Query parameters:
- `start_date` (ISO 8601): Start of period
- `end_date` (ISO 8601): End of period
- `granularity` (string): hour, day, week, month

Response:
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "usage": {
    "executions": 15234,
    "tokens": 1523456,
    "storage_mb": 892,
    "api_calls": 45678
  },
  "costs": {
    "total": 234.56,
    "breakdown": {
      "compute": 123.45,
      "storage": 12.34,
      "api": 98.77
    }
  }
}
```

## Error Handling

All errors follow the same format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid agent configuration",
    "details": {
      "field": "flow.nodes[0].config.model",
      "reason": "Model 'gpt-5' is not supported"
    }
  }
}
```

Common error codes:
- `AUTHENTICATION_ERROR`: Invalid or missing API key
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

## SDKs

Official SDKs are available for:
- [Python](https://github.com/codexos/python-sdk)
- [JavaScript/TypeScript](https://github.com/codexos/js-sdk)
- [Go](https://github.com/codexos/go-sdk)
- [Ruby](https://github.com/codexos/ruby-sdk)

### Python Example
```python
from codexos import Client

client = Client(api_key="YOUR_API_KEY")

# List agents
agents = client.agents.list()

# Execute an agent
result = client.agents.execute(
    agent_id="agent_abc123",
    input={"text": "Hello world"}
)
```

### JavaScript Example
```javascript
import { CodexOS } from '@codexos/sdk';

const client = new CodexOS({ apiKey: 'YOUR_API_KEY' });

// List agents
const agents = await client.agents.list();

// Execute an agent
const result = await client.agents.execute('agent_abc123', {
  input: { text: 'Hello world' }
});
```

## Webhooks

Configure webhooks to receive real-time notifications:

```http
POST /webhooks
```

Request body:
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["execution.completed", "agent.error"],
  "secret": "your-webhook-secret"
}
```

Webhook payload:
```json
{
  "event": "execution.completed",
  "timestamp": "2024-01-15T10:00:45Z",
  "data": {
    "execution_id": "exec_xyz789",
    "agent_id": "agent_abc123",
    "status": "completed",
    "result": {...}
  }
}
```

## Best Practices

1. **Use pagination** for list endpoints to avoid timeouts
2. **Cache agent configurations** to reduce API calls
3. **Implement exponential backoff** for retries
4. **Use webhooks** instead of polling for status updates
5. **Batch operations** when possible
6. **Monitor rate limits** using response headers

## Support

- API Status: [status.codexos.dev](https://status.codexos.dev)
- API Playground: [api.codexos.dev/playground](https://api.codexos.dev/playground)
- Support: api-support@codexos.dev

---

*API Version: v1*  
*Last Updated: [Current Date]*
