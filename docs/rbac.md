# CodexOS RBAC Guide

> **📚 Docs ▸ Security & Compliance**  
> **Last Updated**: December 19, 2024  
> **Status**: Active

## Role-Based Access Control Matrix

| Permission                | Viewer | Runner | Author | Maintainer | Admin | Owner |
|--------------------------|:------:|:------:|:------:|:----------:|:-----:|:-----:|
| **Read Access**          |   ✅   |   ✅   |   ✅   |     ✅     |   ✅   |   ✅   |
| **Execute Agents**       |   ❌   |   ✅   |   ✅   |     ✅     |   ✅   |   ✅   |
| **Create Agents**        |   ❌   |   ❌   |   ✅   |     ✅     |   ✅   |   ✅   |
| **Modify Agents**        |   ❌   |   ❌   |   ✅   |     ✅     |   ✅   |   ✅   |
| **Delete Agents**        |   ❌   |   ❌   |   ❌   |     ✅     |   ✅   |   ✅   |
| **User Management**      |   ❌   |   ❌   |   ❌   |     ❌     |   ✅   |   ✅   |
| **System Settings**      |   ❌   |   ❌   |   ❌   |     ❌     |   ❌   |   ✅   |

## 🚀 Enhanced RBAC Features

### 1. Run Timeline + Replay
- **Detailed Execution Tracking**: Record each step (tool call, tokens, latency, cost)
- **Fork & Replay**: Replay execution from any step with new input data
- **Cost Analysis**: Granular cost breakdown by step, tool, and model
- **Performance Metrics**: Latency tracking and optimization insights

**Permissions Required**:
- `execution:read` - View execution timelines
- `execution:replay` - Create replay executions
- `execution:export` - Export execution data

### 2. Signed Agent Manifests
- **Digital Signatures**: Cryptographically signed agent configurations
- **Capability Management**: Define allowed tools, models, and data access
- **Compliance Validation**: SOC2, HIPAA, GDPR compliance checking
- **Entitlement Enforcement**: Runtime permission validation

**Permissions Required**:
- `manifest:create` - Create and sign manifests
- `manifest:verify` - Verify manifest signatures
- `manifest:validate` - Check compliance requirements
- `manifest:deploy` - Deploy signed agents

### 3. Cost Guard
- **Budget Enforcement**: Per-tenant spending limits with soft/hard caps
- **Auto-Downgrade**: Automatic model switching near budget limits
- **Cost Analytics**: Detailed spending analysis and recommendations
- **Override Management**: Temporary budget limit overrides

**Permissions Required**:
- `cost_guard:read` - View budget status and analytics
- `cost_guard:configure` - Set budget limits and thresholds
- `cost_guard:override` - Override budget limits (Admin+)
- `cost_guard:export` - Export cost reports

## 🔐 Permission Details

### Execution Timeline Permissions
```yaml
execution:read          # View execution history and timelines
execution:replay        # Create replay executions from steps
execution:export        # Export execution data and analytics
execution:delete        # Remove execution records
execution:audit         # Access detailed audit logs
```

### Agent Manifest Permissions
```yaml
manifest:create         # Create and sign agent manifests
manifest:read           # View manifest contents and metadata
manifest:update         # Modify existing manifests
manifest:verify         # Verify digital signatures
manifest:validate       # Check compliance requirements
manifest:deploy         # Deploy signed agents
manifest:revoke         # Revoke manifest validity
```

### Cost Guard Permissions
```yaml
cost_guard:read         # View budget status and spending
cost_guard:configure    # Set budget limits and thresholds
cost_guard:override     # Override budget limits temporarily
cost_guard:export       # Export cost reports and analytics
cost_guard:manage       # Full cost guard administration
```

## 🎯 Role-Specific Capabilities

### Viewer Role
- View execution timelines and cost breakdowns
- Access read-only manifest information
- View budget status (no sensitive details)

### Runner Role
- Execute agents with manifest validation
- View execution details and replay options
- Access cost information for their executions

### Author Role
- Create and sign agent manifests
- Define agent capabilities and entitlements
- Set execution limits and compliance requirements

### Maintainer Role
- Manage team agent manifests
- Configure cost guard settings
- Override budget limits for team members

### Admin Role
- Full cost guard administration
- Manifest verification and compliance
- Budget override management
- System-wide cost analytics

### Owner Role
- Platform-wide cost guard policies
- Compliance framework management
- Advanced security and audit controls

## 🔒 Security Considerations

### Manifest Signing
- Use strong cryptographic keys (RSA-2048+)
- Implement key rotation policies
- Store private keys securely (HSM recommended)
- Validate signatures before deployment

### Cost Guard Security
- Implement rate limiting on budget checks
- Audit all budget overrides
- Monitor for unusual spending patterns
- Encrypt sensitive cost data

### Timeline Privacy
- Implement data retention policies
- Anonymize sensitive execution data
- Control access to detailed step information
- Audit timeline access patterns

## 📊 Compliance Features

### SOC2 Type II
- Comprehensive audit trails
- Access control enforcement
- Data retention management
- Security incident tracking

### GDPR Compliance
- Data minimization in manifests
- Right to be forgotten support
- Data portability features
- Privacy impact assessments

### HIPAA Compliance
- PHI data protection
- Access logging and monitoring
- Encryption at rest and in transit
- Business associate agreements

## 🔗 Related Documentation

- **[Security Policy](security.md)** - Comprehensive security guidelines and policies
- **[Threat Model](threat-model.md)** - Security threat analysis and mitigation
- **[Security Incidents Runbook](runbooks/security-incidents.md)** - Incident response procedures
- **[Monitoring & Alerting](runbooks/monitoring-alerting.md)** - Security monitoring setup
- **[Tenancy](tenancy.md)** - Multi-tenant access control implementation
- **[Architecture](architecture.md)** - System design and security architecture
- **[Cost Management](cost-management.md)** - Budget and spending control guide
- **[Agent Security](agent-security.md)** - Agent manifest and security guide
