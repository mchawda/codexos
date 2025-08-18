# CodexOS Security Spec (v0)
- **Vault**: AES-256-GCM; master key from KMS (dev: env var); per-tenant DEK rotation every 90 days; KATs with Wycheproof vectors.
- **Auth**: JWT (15m) + refresh (7d), TOTP MFA; backup codes (10 single-use).
- **RBAC**: 6 roles → matrix table in /docs/rbac.md; deny-by-default; policy evaluated server-side.
- **Audit**: append-only store, hash-chained by hour; events: auth, secret access, run exec, export, admin actions.
- **SSO**: OIDC (Okta/Auth0/AzureAD); JIT provisioning; SCIM optional.
- **Sandbox**: tool exec in micro-VM container; egress allowlist per-agent.
- **Compliance**: SOC2 controls mapping; log retention 1y; PII redaction in logs.
- **Tests**: crypto KATs; auth flows; privilege escalation; audit integrity; sandbox egress.
