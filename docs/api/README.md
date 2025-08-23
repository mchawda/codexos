# CodexOS API Reference

> **📚 Docs ▸ API Reference**  
> **Last Updated**: $(date)  
> **Status**: Coming Soon

> **🚧 Coming Soon** - This API reference is currently under development and will be available in the next release.

## 📋 API Overview

The CodexOS API provides comprehensive access to all platform functionality through RESTful endpoints, GraphQL queries, and real-time WebSocket connections.

### API Versions

- **Current Version**: v1.0.0
- **Base URL**: `https://api.codexos.dev/api/v1`
- **Local Development**: `http://localhost:8001/api/v1`

### Authentication

All API endpoints require authentication using one of the following methods:

- **JWT Tokens** - Standard bearer token authentication
- **API Keys** - For service-to-service communication
- **OAuth 2.0** - For third-party integrations

## 🔌 Available APIs

### REST API
- **Authentication** - User login, registration, and token management
- **Agents** - Create, manage, and execute AI agents
- **Workflows** - Build and orchestrate agent workflows
- **RAG Engine** - Document ingestion and knowledge retrieval
- **Marketplace** - Agent sharing and monetization
- **User Management** - Profile and account management
- **Monitoring** - System metrics and performance data

### GraphQL API
- **Schema** - Complete GraphQL schema definition
- **Queries** - Data retrieval operations
- **Mutations** - Data modification operations
- **Subscriptions** - Real-time data updates

### WebSocket API
- **Real-time Events** - Live agent execution updates
- **Chat Interface** - Interactive agent communication
- **Status Updates** - System and workflow monitoring

## 🚀 Quick Start

### 1. Get Your API Key

```bash
# Login to get your access token
curl -X POST https://api.codexos.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### 2. Make Your First API Call

```bash
# Get your user profile
curl -X GET https://api.codexos.dev/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create Your First Agent

```bash
# Create a simple agent
curl -X POST https://api.codexos.dev/api/v1/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Agent",
    "description": "A simple test agent",
    "type": "basic"
  }'
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `/api/v1/docs` - Interactive API explorer
- **ReDoc**: `/api/v1/redoc` - Alternative documentation view
- **OpenAPI Spec**: `/api/v1/openapi.json` - Machine-readable API specification

### SDKs and Libraries

- **Python SDK** - `pip install codexos-sdk`
- **JavaScript SDK** - `npm install @codexos/sdk`
- **Go SDK** - `go get github.com/codexos/go-sdk`
- **Rust SDK** - `cargo add codexos-sdk`

## 🔐 Authentication Examples

### Python SDK

```python
from codexos import CodexOS

# Initialize client
client = CodexOS(
    api_key="your-api-key",
    base_url="https://api.codexos.dev"
)

# Create an agent
agent = client.agents.create(
    name="Documentation Bot",
    description="Automated documentation generator"
)

# Execute the agent
result = client.agents.execute(agent.id, input_data="Generate API docs")
```

### JavaScript SDK

```javascript
import { CodexOS } from '@codexos/sdk';

// Initialize client
const client = new CodexOS({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.codexos.dev'
});

// Create an agent
const agent = await client.agents.create({
  name: 'Documentation Bot',
  description: 'Automated documentation generator'
});

// Execute the agent
const result = await client.agents.execute(agent.id, {
  inputData: 'Generate API docs'
});
```

## 📊 Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until limit resets

## 🚨 Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid or expired access token",
    "details": "Token expired at 2024-01-15T10:00:00Z",
    "request_id": "req_1234567890abcdef"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_FAILED` - Invalid or expired credentials
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server-side error

## 🔍 Testing

### Postman Collection

Download our [Postman Collection](https://api.codexos.dev/postman-collection.json) for easy API testing.

### cURL Examples

All API endpoints include cURL examples in the interactive documentation.

### SDK Examples

Comprehensive examples are available in each SDK's repository.

## 📞 Support

- **API Issues**: [GitHub Issues](https://github.com/codexos/codexos/issues)
- **Documentation**: [docs.codexos.dev](https://docs.codexos.dev)
- **Community**: [Discord](https://discord.gg/codexos)
- **Email**: api-support@codexos.dev

## 🔄 Changelog

### v1.0.0 (Coming Soon)
- Initial API release
- REST API endpoints
- GraphQL schema
- WebSocket support
- Python and JavaScript SDKs

### Future Releases
- Additional SDKs (Go, Rust, Java)
- Advanced GraphQL features
- Webhook support
- API analytics dashboard

---

*This API reference will be fully available in the next release. For now, explore the interactive documentation at `/api/v1/docs` when running locally.*
