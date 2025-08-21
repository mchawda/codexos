# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
OpenAPI configuration and customization for CodexOS
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import structlog

logger = structlog.get_logger()


# Error Models
class ErrorDetail(BaseModel):
    """Detailed error information"""
    field: Optional[str] = None
    message: str
    code: str
    value: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response format"""
    error: str
    message: str
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None
    timestamp: str
    path: str
    method: str


class ValidationErrorResponse(ErrorResponse):
    """Validation error response"""
    error: str = "validation_error"
    message: str = "Request validation failed"


class AuthenticationErrorResponse(ErrorResponse):
    """Authentication error response"""
    error: str = "authentication_error"
    message: str = "Authentication required"


class AuthorizationErrorResponse(ErrorResponse):
    """Authorization error response"""
    error: str = "authorization_error"
    message: str = "Insufficient permissions"


class NotFoundErrorResponse(ErrorResponse):
    """Not found error response"""
    error: str = "not_found"
    message: str = "Resource not found"


class RateLimitErrorResponse(ErrorResponse):
    """Rate limit error response"""
    error: str = "rate_limit_exceeded"
    message: str = "Rate limit exceeded"


class InternalErrorResponse(ErrorResponse):
    """Internal server error response"""
    error: str = "internal_error"
    message: str = "Internal server error"


# Success Models
class SuccessResponse(BaseModel):
    """Standard success response format"""
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: str
    request_id: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response format"""
    data: List[Any]
    pagination: Dict[str, Any]
    total: int
    page: int
    per_page: int
    total_pages: int


# Common Models
class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1, description="Page number (1-based)")
    per_page: int = Field(20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("asc", regex="^(asc|desc)$", description="Sort order")


class FilterParams(BaseModel):
    """Common filter parameters"""
    search: Optional[str] = Field(None, description="Search query")
    status: Optional[str] = Field(None, description="Filter by status")
    created_after: Optional[str] = Field(None, description="Created after date (ISO)")
    created_before: Optional[str] = Field(None, description="Created before date (ISO)")
    updated_after: Optional[str] = Field(None, description="Updated after date (ISO)")
    updated_before: Optional[str] = Field(None, description="Updated before date (ISO)")


class IdempotencyHeader(BaseModel):
    """Idempotency key header"""
    idempotency_key: str = Field(..., description="Unique idempotency key")


# OpenAPI Configuration
OPENAPI_TAGS_METADATA = [
    {
        "name": "authentication",
        "description": "Authentication and authorization operations",
        "externalDocs": {
            "description": "Authentication Guide",
            "url": "https://docs.codexos.dev/auth",
        },
    },
    {
        "name": "users",
        "description": "User management operations",
        "externalDocs": {
            "description": "User Management Guide",
            "url": "https://docs.codexos.dev/users",
        },
    },
    {
        "name": "agents",
        "description": "AI agent operations",
        "externalDocs": {
            "description": "Agent Development Guide",
            "url": "https://docs.codexos.dev/agents",
        },
    },
    {
        "name": "rag",
        "description": "Retrieval-Augmented Generation operations",
        "externalDocs": {
            "description": "RAG Engine Guide",
            "url": "https://docs.codexos.dev/rag",
        },
    },
    {
        "name": "vault",
        "description": "Secure vault operations",
        "externalDocs": {
            "description": "Vault Security Guide",
            "url": "https://docs.codexos.dev/vault",
        },
    },
    {
        "name": "marketplace",
        "description": "Agent marketplace operations",
        "externalDocs": {
            "description": "Marketplace Guide",
            "url": "https://docs.codexos.dev/marketplace",
        },
    },
    {
        "name": "payments",
        "description": "Payment processing operations",
        "externalDocs": {
            "description": "Payment Integration Guide",
            "url": "https://docs.codexos.dev/payments",
        },
    },
    {
        "name": "monitoring",
        "description": "System monitoring and health checks",
        "externalDocs": {
            "description": "Monitoring Guide",
            "url": "https://docs.codexos.dev/monitoring",
        },
    },
]

OPENAPI_DESCRIPTION = """
# CodexOS API

CodexOS is a next-generation AI agent development platform that enables developers to build, deploy, and monetize intelligent autonomous agents.

## Key Features

- **🤖 Autonomous Agents**: Build intelligent agents that complete complex engineering tasks independently
- **🎨 Visual Flow Editor**: Drag-and-drop interface powered by React Flow
- **🧠 Multimodal Intelligence**: Vision, voice, and action capabilities
- **📚 RAG Engine**: Context-aware AI with powerful knowledge retrieval
- **🔐 Enterprise Security**: SOC2 & ISO 27001 compliant with encrypted vault
- **🛍️ Agent Marketplace**: Share and monetize your AI agents
- **☁️ Multi-Tenancy**: Complete tenant isolation with custom domains

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:
- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: Custom limits

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages in the following format:

```json
{
  "error": "validation_error",
  "message": "Request validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_email"
    }
  ],
  "request_id": "req_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/users",
  "method": "POST"
}
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `per_page`: Items per page (1-100)
- `sort_by`: Sort field
- `sort_order`: Sort order (asc/desc)

## Idempotency

For mutating operations, include an `Idempotency-Key` header to ensure idempotent behavior:

```
Idempotency-Key: unique-key-123
```

## Webhooks

Configure webhooks to receive real-time notifications for events like:
- Agent execution completion
- Payment processing
- User registration
- Marketplace transactions

## SDKs and Libraries

Official SDKs are available for:
- Python (`pip install codexos-python`)
- JavaScript/TypeScript (`npm install @codexos/sdk`)
- Go (`go get github.com/codexos/go-sdk`)

## Support

- **Documentation**: https://docs.codexos.dev
- **API Reference**: https://api.codexos.dev/docs
- **Community**: https://discord.gg/codexos
- **Support**: support@codexos.dev

## SDK Examples

### Python
```python
from codexos import CodexOS

client = CodexOS(api_key="your-api-key")

# Create an agent
agent = client.agents.create(
    name="Code Assistant",
    description="AI-powered code review assistant"
)

# Execute a flow
result = client.flows.execute(
    flow_id="flow_123",
    inputs={"code": "def hello(): print('world')"}
)
```

### JavaScript
```javascript
import { CodexOS } from '@codexos/sdk';

const client = new CodexOS({ apiKey: 'your-api-key' });

// Create an agent
const agent = await client.agents.create({
  name: 'Code Assistant',
  description: 'AI-powered code review assistant'
});

// Execute a flow
const result = await client.flows.execute('flow_123', {
  inputs: { code: 'function hello() { console.log("world"); }' }
});
```

## Testing

Use our sandbox environment for testing:
- **Base URL**: https://sandbox-api.codexos.dev
- **Test API Key**: Available in your dashboard
- **Webhook Testing**: Use ngrok or similar for local testing

## Production

Production environment:
- **Base URL**: https://api.codexos.dev
- **SLA**: 99.9% uptime guarantee
- **Support**: 24/7 enterprise support available
"""

OPENAPI_VERSION = "3.0.0"
OPENAPI_TITLE = "CodexOS API"
OPENAPI_SERVERS = [
    {
        "url": "https://api.codexos.dev",
        "description": "Production server"
    },
    {
        "url": "https://sandbox-api.codexos.dev",
        "description": "Sandbox server for testing"
    },
    {
        "url": "http://localhost:8001",
        "description": "Local development server"
    }
]


# Error Handling Functions
def create_error_response(
    error_type: str,
    message: str,
    status_code: int = 400,
    details: Optional[List[ErrorDetail]] = None,
    request_id: Optional[str] = None,
    path: str = "",
    method: str = ""
) -> JSONResponse:
    """Create standardized error response"""
    from datetime import datetime
    
    error_response = ErrorResponse(
        error=error_type,
        message=message,
        details=details,
        request_id=request_id,
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=path,
        method=method
    )
    
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(error_response)
    )


def handle_validation_error(exc: Exception, request_id: Optional[str] = None) -> JSONResponse:
    """Handle Pydantic validation errors"""
    details = []
    
    if hasattr(exc, 'errors'):
        for error in exc.errors():
            detail = ErrorDetail(
                field=error.get('loc', [None])[-1],
                message=error.get('msg', 'Validation error'),
                code=error.get('type', 'validation_error'),
                value=error.get('input')
            )
            details.append(detail)
    
    return create_error_response(
        error_type="validation_error",
        message="Request validation failed",
        status_code=422,
        details=details,
        request_id=request_id
    )


def handle_authentication_error(message: str = "Authentication required", 
                              request_id: Optional[str] = None) -> JSONResponse:
    """Handle authentication errors"""
    return create_error_response(
        error_type="authentication_error",
        message=message,
        status_code=401,
        request_id=request_id
    )


def handle_authorization_error(message: str = "Insufficient permissions", 
                             request_id: Optional[str] = None) -> JSONResponse:
    """Handle authorization errors"""
    return create_error_response(
        error_type="authorization_error",
        message=message,
        status_code=403,
        request_id=request_id
    )


def handle_not_found_error(resource: str, request_id: Optional[str] = None) -> JSONResponse:
    """Handle not found errors"""
    return create_error_response(
        error_type="not_found",
        message=f"{resource} not found",
        status_code=404,
        request_id=request_id
    )


def handle_rate_limit_error(retry_after: Optional[int] = None, 
                           request_id: Optional[str] = None) -> JSONResponse:
    """Handle rate limit errors"""
    message = "Rate limit exceeded"
    if retry_after:
        message += f". Retry after {retry_after} seconds"
    
    response = create_error_response(
        error_type="rate_limit_exceeded",
        message=message,
        status_code=429,
        request_id=request_id
    )
    
    if retry_after:
        response.headers["Retry-After"] = str(retry_after)
    
    return response


def handle_internal_error(message: str = "Internal server error", 
                         request_id: Optional[str] = None) -> JSONResponse:
    """Handle internal server errors"""
    logger.error("Internal server error", message=message, request_id=request_id)
    
    return create_error_response(
        error_type="internal_error",
        message=message,
        status_code=500,
        request_id=request_id
    )


# Success Response Functions
def create_success_response(
    data: Any = None,
    message: Optional[str] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """Create standardized success response"""
    from datetime import datetime
    
    response = {
        "success": True,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    if data is not None:
        response["data"] = data
    
    if message:
        response["message"] = message
    
    if request_id:
        response["request_id"] = request_id
    
    return response


def create_paginated_response(
    data: List[Any],
    total: int,
    page: int,
    per_page: int,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """Create paginated response"""
    total_pages = (total + per_page - 1) // per_page
    
    pagination = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }
    
    response = create_success_response(
        data=data,
        request_id=request_id
    )
    
    response["pagination"] = pagination
    
    return response


# OpenAPI Examples
OPENAPI_EXAMPLES = {
    "user_create": {
        "summary": "Create User",
        "description": "Create a new user account",
        "value": {
            "email": "user@example.com",
            "password": "secure_password_123",
            "first_name": "John",
            "last_name": "Doe",
            "company": "Acme Corp"
        }
    },
    "agent_create": {
        "summary": "Create Agent",
        "description": "Create a new AI agent",
        "value": {
            "name": "Code Review Assistant",
            "description": "AI-powered code review and optimization agent",
            "type": "code_review",
            "tools": ["fs", "web", "math"],
            "config": {
                "model": "gpt-4",
                "temperature": 0.1,
                "max_tokens": 2000
            }
        }
    },
    "flow_execute": {
        "summary": "Execute Flow",
        "description": "Execute an agent flow with inputs",
        "value": {
            "inputs": {
                "code": "def hello(): print('world')",
                "language": "python",
                "review_type": "security"
            },
            "options": {
                "timeout": 300,
                "max_iterations": 5
            }
        }
    }
}
