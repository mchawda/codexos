# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Security Compliance Service for SOC2 and ISO 27001 compliance
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import hashlib
import secrets
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
import structlog
from pydantic import BaseModel, Field

from app.models.user import User
from app.models.audit import AuditLog
from app.models.tenant import Tenant
from app.core.config import settings

logger = structlog.get_logger()


class ComplianceFramework(str, Enum):
    SOC2 = "SOC2"
    ISO27001 = "ISO27001"
    GDPR = "GDPR"
    HIPAA = "HIPAA"
    PCI_DSS = "PCI_DSS"


class SecurityEventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    FAILED_LOGIN = "failed_login"
    MFA_REQUIRED = "mfa_required"
    MFA_SUCCESS = "mfa_success"
    MFA_FAILURE = "mfa_failure"
    PASSWORD_RESET = "password_reset"
    PERMISSION_DENIED = "permission_denied"
    DATA_ACCESS = "data_access"
    DATA_EXPORT = "data_export"
    API_RATE_LIMIT = "api_rate_limit"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    SECURITY_SCAN = "security_scan"


class DataClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class EncryptionMethod(str, Enum):
    AES_256_GCM = "AES-256-GCM"
    RSA_4096 = "RSA-4096"
    FERNET = "Fernet"


class SecurityControl(BaseModel):
    id: str
    name: str
    description: str
    framework: ComplianceFramework
    category: str
    status: str = "not_implemented"
    evidence: Optional[List[str]] = None
    last_tested: Optional[datetime] = None
    next_review: Optional[datetime] = None


class ComplianceReport(BaseModel):
    framework: ComplianceFramework
    generated_at: datetime
    compliance_score: float
    controls_total: int
    controls_implemented: int
    controls_partial: int
    controls_missing: int
    findings: List[Dict[str, Any]]
    recommendations: List[str]


class SecurityComplianceService:
    """Service for security compliance and data protection"""
    
    def __init__(self):
        self.encryption_key = self._derive_key_from_master()
        self.fernet = Fernet(self.encryption_key)
        self._initialize_controls()
    
    def _derive_key_from_master(self) -> bytes:
        """Derive encryption key from master key"""
        master_key = settings.VAULT_MASTER_KEY.encode()
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'codexos-security-salt',  # In production, use unique salt per tenant
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_key))
        return key
    
    def _initialize_controls(self):
        """Initialize security controls for different frameworks"""
        self.controls = {
            ComplianceFramework.SOC2: [
                SecurityControl(
                    id="CC6.1",
                    name="Logical Access Controls",
                    description="Restrict logical access to systems and data",
                    framework=ComplianceFramework.SOC2,
                    category="Common Criteria",
                ),
                SecurityControl(
                    id="CC6.7",
                    name="Data Transmission Security",
                    description="Transmission of sensitive data is encrypted",
                    framework=ComplianceFramework.SOC2,
                    category="Common Criteria",
                ),
                SecurityControl(
                    id="CC7.2",
                    name="System Monitoring",
                    description="Monitor system components for anomalies",
                    framework=ComplianceFramework.SOC2,
                    category="Common Criteria",
                ),
            ],
            ComplianceFramework.ISO27001: [
                SecurityControl(
                    id="A.9.1.1",
                    name="Access Control Policy",
                    description="Access control policy based on business requirements",
                    framework=ComplianceFramework.ISO27001,
                    category="Access Control",
                ),
                SecurityControl(
                    id="A.12.1.1",
                    name="Operational Procedures",
                    description="Documented operating procedures",
                    framework=ComplianceFramework.ISO27001,
                    category="Operations Security",
                ),
                SecurityControl(
                    id="A.18.1.4",
                    name="Privacy and PII Protection",
                    description="Privacy and protection of personally identifiable information",
                    framework=ComplianceFramework.ISO27001,
                    category="Compliance",
                ),
            ],
        }
    
    async def log_security_event(
        self,
        db: AsyncSession,
        event_type: SecurityEventType,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        severity: str = "info",
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """Log a security event"""
        event = AuditLog(
            event_type=event_type.value,
            user_id=user_id,
            severity=severity,
            details=details or {},
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
        )
        
        db.add(event)
        await db.commit()
        
        # Log to structured logger
        logger.info(
            "security_event",
            event_type=event_type.value,
            user_id=user_id,
            severity=severity,
            ip_address=ip_address,
            details=details,
        )
        
        # Check for suspicious patterns
        await self._check_security_patterns(db, event)
        
        return event
    
    async def _check_security_patterns(self, db: AsyncSession, event: AuditLog):
        """Check for suspicious security patterns"""
        if event.event_type == SecurityEventType.FAILED_LOGIN.value:
            # Check for brute force attempts
            recent_failures = await db.execute(
                select(func.count(AuditLog.id))
                .where(
                    and_(
                        AuditLog.event_type == SecurityEventType.FAILED_LOGIN.value,
                        AuditLog.ip_address == event.ip_address,
                        AuditLog.timestamp > datetime.utcnow() - timedelta(minutes=15),
                    )
                )
            )
            
            failure_count = recent_failures.scalar()
            if failure_count > 5:
                await self.log_security_event(
                    db,
                    SecurityEventType.SUSPICIOUS_ACTIVITY,
                    details={
                        "pattern": "brute_force_attempt",
                        "ip_address": event.ip_address,
                        "failure_count": failure_count,
                    },
                    severity="warning",
                )
    
    def encrypt_sensitive_data(
        self,
        data: str,
        classification: DataClassification = DataClassification.CONFIDENTIAL,
    ) -> Tuple[str, Dict[str, Any]]:
        """Encrypt sensitive data based on classification"""
        if classification in [DataClassification.PUBLIC, DataClassification.INTERNAL]:
            # No encryption for public/internal data
            return data, {"encrypted": False, "classification": classification.value}
        
        # Encrypt confidential/restricted data
        encrypted = self.fernet.encrypt(data.encode())
        
        metadata = {
            "encrypted": True,
            "classification": classification.value,
            "method": EncryptionMethod.FERNET.value,
            "encrypted_at": datetime.utcnow().isoformat(),
        }
        
        return base64.b64encode(encrypted).decode(), metadata
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            decoded = base64.b64decode(encrypted_data.encode())
            decrypted = self.fernet.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error("Failed to decrypt data", error=str(e))
            raise ValueError("Failed to decrypt data")
    
    async def generate_compliance_report(
        self,
        db: AsyncSession,
        framework: ComplianceFramework,
        tenant_id: Optional[str] = None,
    ) -> ComplianceReport:
        """Generate compliance report for a framework"""
        controls = self.controls.get(framework, [])
        
        if not controls:
            raise ValueError(f"No controls defined for framework {framework}")
        
        # Assess each control
        implemented = 0
        partial = 0
        missing = 0
        findings = []
        
        for control in controls:
            status = await self._assess_control(db, control, tenant_id)
            
            if status["status"] == "implemented":
                implemented += 1
            elif status["status"] == "partial":
                partial += 1
                findings.append({
                    "control_id": control.id,
                    "control_name": control.name,
                    "status": "partial",
                    "gap": status.get("gap", "Implementation incomplete"),
                })
            else:
                missing += 1
                findings.append({
                    "control_id": control.id,
                    "control_name": control.name,
                    "status": "missing",
                    "gap": status.get("gap", "Control not implemented"),
                })
        
        total = len(controls)
        compliance_score = (implemented + (partial * 0.5)) / total * 100
        
        # Generate recommendations
        recommendations = self._generate_recommendations(findings, framework)
        
        return ComplianceReport(
            framework=framework,
            generated_at=datetime.utcnow(),
            compliance_score=compliance_score,
            controls_total=total,
            controls_implemented=implemented,
            controls_partial=partial,
            controls_missing=missing,
            findings=findings,
            recommendations=recommendations,
        )
    
    async def _assess_control(
        self,
        db: AsyncSession,
        control: SecurityControl,
        tenant_id: Optional[str],
    ) -> Dict[str, Any]:
        """Assess a specific security control"""
        # This is a simplified assessment
        # In production, each control would have specific tests
        
        assessment = {"control_id": control.id, "status": "missing", "evidence": []}
        
        # Example assessments
        if control.id == "CC6.1":  # Logical Access Controls
            # Check if authentication is required
            if settings.SECRET_KEY:
                assessment["status"] = "implemented"
                assessment["evidence"].append("JWT authentication implemented")
            
        elif control.id == "CC6.7":  # Data Transmission Security
            # Check if HTTPS is enforced
            assessment["status"] = "partial"
            assessment["gap"] = "HTTPS not enforced in all environments"
            
        elif control.id == "CC7.2":  # System Monitoring
            # Check if logging is enabled
            if logger:
                assessment["status"] = "partial"
                assessment["evidence"].append("Structured logging implemented")
                assessment["gap"] = "Real-time alerting not configured"
        
        return assessment
    
    def _generate_recommendations(
        self,
        findings: List[Dict[str, Any]],
        framework: ComplianceFramework,
    ) -> List[str]:
        """Generate recommendations based on findings"""
        recommendations = []
        
        # Priority recommendations
        missing_controls = [f for f in findings if f["status"] == "missing"]
        if missing_controls:
            recommendations.append(
                f"Priority: Implement {len(missing_controls)} missing controls"
            )
        
        # Framework-specific recommendations
        if framework == ComplianceFramework.SOC2:
            recommendations.extend([
                "Implement automated security monitoring and alerting",
                "Document all security procedures and controls",
                "Schedule regular penetration testing",
                "Implement data loss prevention (DLP) controls",
            ])
        elif framework == ComplianceFramework.ISO27001:
            recommendations.extend([
                "Develop and maintain an Information Security Management System (ISMS)",
                "Conduct regular risk assessments",
                "Implement asset management procedures",
                "Establish incident response procedures",
            ])
        
        return recommendations
    
    async def perform_security_scan(
        self,
        db: AsyncSession,
        scan_type: str = "basic",
    ) -> Dict[str, Any]:
        """Perform security scan"""
        scan_results = {
            "scan_id": secrets.token_urlsafe(16),
            "scan_type": scan_type,
            "started_at": datetime.utcnow(),
            "findings": [],
        }
        
        # Check for common security issues
        checks = [
            self._check_weak_passwords,
            self._check_expired_tokens,
            self._check_excessive_permissions,
            self._check_unencrypted_data,
        ]
        
        for check in checks:
            try:
                result = await check(db)
                if result:
                    scan_results["findings"].append(result)
            except Exception as e:
                logger.error(f"Security check failed", check=check.__name__, error=str(e))
        
        scan_results["completed_at"] = datetime.utcnow()
        scan_results["duration_seconds"] = (
            scan_results["completed_at"] - scan_results["started_at"]
        ).total_seconds()
        
        # Log the security scan
        await self.log_security_event(
            db,
            SecurityEventType.SECURITY_SCAN,
            details=scan_results,
            severity="info",
        )
        
        return scan_results
    
    async def _check_weak_passwords(self, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Check for weak passwords"""
        # In production, implement actual password strength checking
        return None
    
    async def _check_expired_tokens(self, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Check for expired tokens"""
        # Check for expired JWT tokens in active sessions
        return None
    
    async def _check_excessive_permissions(self, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Check for users with excessive permissions"""
        # Check for users with admin permissions
        result = await db.execute(
            select(func.count(User.id))
            .where(User.is_superuser == True)
        )
        
        admin_count = result.scalar()
        if admin_count > 5:
            return {
                "severity": "medium",
                "finding": "Excessive admin users",
                "details": f"Found {admin_count} users with superuser privileges",
                "recommendation": "Review and limit admin access",
            }
        
        return None
    
    async def _check_unencrypted_data(self, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Check for unencrypted sensitive data"""
        # In production, scan for PII and sensitive data
        return None
    
    def generate_data_retention_policy(self) -> Dict[str, Any]:
        """Generate data retention policy"""
        return {
            "version": "1.0",
            "effective_date": datetime.utcnow().isoformat(),
            "policies": {
                "user_data": {
                    "retention_period": "7 years",
                    "deletion_method": "secure_wipe",
                    "exceptions": ["legal_hold", "regulatory_requirement"],
                },
                "audit_logs": {
                    "retention_period": "7 years",
                    "deletion_method": "archive_then_delete",
                    "compression": True,
                },
                "execution_data": {
                    "retention_period": "90 days",
                    "deletion_method": "soft_delete",
                    "archive_after": "30 days",
                },
                "temporary_data": {
                    "retention_period": "24 hours",
                    "deletion_method": "immediate_delete",
                },
            },
        }
    
    async def export_user_data(
        self,
        db: AsyncSession,
        user_id: str,
        format: str = "json",
    ) -> Dict[str, Any]:
        """Export user data for GDPR compliance"""
        # Collect all user data
        user = await db.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        
        # Log data export event
        await self.log_security_event(
            db,
            SecurityEventType.DATA_EXPORT,
            user_id=user_id,
            details={"format": format, "reason": "user_request"},
        )
        
        # Collect user data from all tables
        user_data = {
            "user_profile": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at.isoformat(),
            },
            "audit_logs": [],  # Would fetch from audit logs
            "agent_flows": [],  # Would fetch user's agent flows
            "executions": [],  # Would fetch execution history
        }
        
        if format == "json":
            return user_data
        else:
            raise ValueError(f"Unsupported export format: {format}")


# Singleton instance
security_compliance_service = SecurityComplianceService()
