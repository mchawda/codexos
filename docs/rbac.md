# CodexOS RBAC Guide

> **📚 Docs ▸ Security & Compliance**  
> **Last Updated**: $(date)  
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

## 🔗 Related Documentation

- **[Security Policy](security.md)** - Comprehensive security guidelines and policies
- **[Threat Model](threat-model.md)** - Security threat analysis and mitigation
- **[Security Incidents Runbook](runbooks/security-incidents.md)** - Incident response procedures
- **[Monitoring & Alerting](runbooks/monitoring-alerting.md)** - Security monitoring setup
- **[Tenancy](tenancy.md)** - Multi-tenant access control implementation
- **[Architecture](architecture.md)** - System design and security architecture
