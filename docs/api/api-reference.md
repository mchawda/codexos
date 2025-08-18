# CodexOS API Reference

## Overview

The CodexOS API is a RESTful API that provides programmatic access to all platform features. 

Base URL: `https://api.codexos.dev/api/v1`

## Authentication

All API requests require authentication using JWT tokens. See [Authentication Guide](./authentication.md) for details.

```http
Authorization: Bearer {access_token}
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
X-Tenant-ID: {tenant_id}  # Optional, for multi-tenant requests
```

## Rate Limiting

- Authenticated requests: 100 per minute
- Unauthenticated requests: 20 per minute
- Webhook endpoints: No limit

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## API Endpoints

### Agents

#### List Agent Flows
```http
GET /agents/flows
```

Query parameters:
- `skip` (int): Offset for pagination
- `limit` (int): Number of results (max 100)
- `search` (string): Search by name
- `status` (string): Filter by status

#### Create Agent Flow
```http
POST /agents/flows
Content-Type: application/json

{
  "name": "Customer Support Agent",
  "description": "Handles customer inquiries",
  "nodes": [...],
  "edges": [...],
  "metadata": {}
}
```

#### Execute Agent Flow
```http
POST /agents/execute
Content-Type: application/json

{
  "flow_id": "uuid",
  "input": {
    "message": "Hello, I need help"
  },
  "context": {}
}
```

### RAG Engine

#### Ingest Document
```http
POST /rag/ingest
Content-Type: multipart/form-data

{
  "source_type": "file|url|github|text",
  "source": "...",
  "metadata": {},
  "chunking_strategy": "recursive|semantic|fixed"
}
```

#### Query RAG
```http
POST /rag/query
Content-Type: application/json

{
  "query": "How do I create an agent?",
  "limit": 5,
  "filters": {
    "source_type": "documentation"
  }
}
```

Response:
```json
{
  "results": [
    {
      "content": "To create an agent...",
      "score": 0.95,
      "metadata": {
        "source": "docs/agents.md",
        "chunk_id": "uuid"
      }
    }
  ],
  "total": 5,
  "query_time": 0.123
}
```

### Marketplace

#### Browse Items
```http
GET /marketplace/items?category=ai-tools&sort=popular
```

#### Get Item Details
```http
GET /marketplace/items/{item_id}
```

#### Purchase Item
```http
POST /marketplace/items/{item_id}/purchase
Content-Type: application/json

{
  "payment_method_id": "pm_xxx"
}
```

#### Create Marketplace Item
```http
POST /marketplace/items
Content-Type: application/json

{
  "name": "Advanced AI Agent",
  "short_description": "...",
  "long_description": "...",
  "item_type": "agent_template",
  "pricing_model": "subscription",
  "price": 29.99,
  "categories": ["ai-tools"],
  "tags": ["nlp", "automation"]
}
```

### Vault

#### Store Secret
```http
POST /vault/secrets
Content-Type: application/json

{
  "key": "openai_api_key",
  "value": "sk-...",
  "tags": ["api-key", "openai"],
  "expires_at": "2024-12-31T23:59:59Z"
}
```

#### Retrieve Secret
```http
GET /vault/secrets/{key}
X-Vault-MFA-Code: 123456  # If MFA required
```

#### List Secrets
```http
GET /vault/secrets
```

### WebSocket API

#### Agent Execution
```javascript
const ws = new WebSocket('wss://api.codexos.dev/ws/{client_id}');

ws.send(JSON.stringify({
  type: 'execute',
  flow_id: 'uuid',
  input: { message: 'Hello' }
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle execution updates
};
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {
      "resource_type": "agent_flow",
      "resource_id": "uuid"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_FAILED` - Invalid credentials
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Pagination

List endpoints support pagination:

```http
GET /agents/flows?skip=0&limit=20
```

Response includes pagination metadata:
```json
{
  "items": [...],
  "total": 100,
  "skip": 0,
  "limit": 20,
  "has_more": true
}
```

## Webhooks

Configure webhooks for real-time events:

### Event Types
- `agent.execution.started`
- `agent.execution.completed`
- `agent.execution.failed`
- `marketplace.purchase.completed`
- `vault.secret.accessed`

### Webhook Payload
```json
{
  "id": "evt_uuid",
  "type": "agent.execution.completed",
  "created": 1609459200,
  "data": {
    "execution_id": "uuid",
    "flow_id": "uuid",
    "status": "completed",
    "result": {...}
  }
}
```

### Webhook Security
Verify webhook signatures:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## SDK Examples

### Python
```python
from codexos import CodexOS

client = CodexOS(api_key="your-api-key")

# Execute agent
result = client.agents.execute(
    flow_id="uuid",
    input={"message": "Hello"}
)

# Query RAG
results = client.rag.query(
    "How do I create an agent?",
    limit=5
)
```

### JavaScript/TypeScript
```typescript
import { CodexOS } from '@codexos/sdk';

const client = new CodexOS({
  apiKey: 'your-api-key'
});

// Execute agent
const result = await client.agents.execute({
  flowId: 'uuid',
  input: { message: 'Hello' }
});

// Query RAG
const results = await client.rag.query({
  query: 'How do I create an agent?',
  limit: 5
});
```

## Best Practices

1. **Use Pagination**: Always paginate list requests
2. **Cache Responses**: Cache frequently accessed data
3. **Handle Rate Limits**: Implement exponential backoff
4. **Validate Webhooks**: Always verify webhook signatures
5. **Use Idempotency Keys**: For critical operations
6. **Monitor Usage**: Track API usage and limits

## API Versioning

The API uses URL versioning:
- Current: `/api/v1`
- Legacy: `/api/v0` (deprecated)

Version sunset notice provided 6 months in advance.

## Support

- API Status: https://status.codexos.dev
- Documentation: https://docs.codexos.dev
- Support: api-support@codexos.dev
