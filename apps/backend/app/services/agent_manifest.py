# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Agent Manifest Service for CodexOS
Provides signed agent manifests with capabilities, tools, entitlements, and budgets
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
import json
import hashlib
import yaml
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.agent import AgentManifest, AgentFlow
from app.models.user import User
from app.core.security import get_current_user


class AgentManifestService:
    """Service for managing signed agent manifests"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_manifest(
        self,
        agent_flow_id: UUID,
        tenant_id: UUID,
        manifest_data: Dict[str, Any],
        user: User,
        private_key: Optional[bytes] = None
    ) -> AgentManifest:
        """Create and sign a new agent manifest"""
        
        # Generate manifest YAML
        manifest_yaml = yaml.dump(manifest_data, default_flow_style=False, sort_keys=False)
        
        # Create manifest hash
        manifest_hash = hashlib.sha256(manifest_yaml.encode('utf-8')).hexdigest()
        
        # Sign the manifest if private key provided
        signature = ""
        if private_key:
            signature = self._sign_manifest(manifest_hash, private_key)
        
        # Create the manifest
        manifest = AgentManifest(
            agent_flow_id=agent_flow_id,
            tenant_id=tenant_id,
            version=manifest_data.get('version', '1.0.0'),
            manifest_hash=manifest_hash,
            signature=signature,
            signed_by=user.id,
            signed_at=datetime.utcnow(),
            capabilities=manifest_data.get('capabilities', []),
            supported_models=manifest_data.get('supported_models', []),
            multimodal_support=manifest_data.get('multimodal_support', []),
            allowed_tools=manifest_data.get('allowed_tools', []),
            tool_permissions=manifest_data.get('tool_permissions', {}),
            restricted_tools=manifest_data.get('restricted_tools', []),
            max_tokens_per_execution=manifest_data.get('max_tokens_per_execution'),
            max_cost_per_execution=manifest_data.get('max_cost_per_execution'),
            max_executions_per_day=manifest_data.get('max_executions_per_day'),
            max_concurrent_executions=manifest_data.get('max_concurrent_executions'),
            data_access_level=manifest_data.get('data_access_level', 'tenant'),
            allowed_data_sources=manifest_data.get('allowed_data_sources', []),
            data_retention_policy=manifest_data.get('data_retention_policy', 'execution'),
            security_level=manifest_data.get('security_level', 'standard'),
            compliance_requirements=manifest_data.get('compliance_requirements', []),
            audit_requirements=manifest_data.get('audit_requirements', []),
            deployment_environment=manifest_data.get('deployment_environment', 'production'),
            runtime_constraints=manifest_data.get('runtime_constraints', {}),
            health_check_endpoints=manifest_data.get('health_check_endpoints', []),
            marketplace_visibility=manifest_data.get('marketplace_visibility', 'private'),
            sharing_permissions=manifest_data.get('sharing_permissions', []),
            licensing_terms=manifest_data.get('licensing_terms'),
            manifest_content=manifest_data,
            manifest_yaml=manifest_yaml
        )
        
        self.db.add(manifest)
        self.db.commit()
        self.db.refresh(manifest)
        
        return manifest
    
    def verify_manifest(
        self,
        manifest_id: UUID,
        public_key: bytes,
        verifier: User
    ) -> bool:
        """Verify a signed agent manifest"""
        
        manifest = self.db.query(AgentManifest).filter(AgentManifest.id == manifest_id).first()
        if not manifest:
            raise ValueError(f"Manifest {manifest_id} not found")
        
        try:
            # Verify the signature
            is_valid = self._verify_signature(manifest.manifest_hash, manifest.signature, public_key)
            
            if is_valid:
                manifest.is_verified = True
                manifest.verified_by = verifier.id
                manifest.verified_at = datetime.utcnow()
                manifest.verification_notes = "Signature verified successfully"
                
                self.db.commit()
                self.db.refresh(manifest)
            
            return is_valid
            
        except Exception as e:
            manifest.verification_notes = f"Verification failed: {str(e)}"
            self.db.commit()
            return False
    
    def get_manifest_by_flow(
        self,
        agent_flow_id: UUID,
        version: Optional[str] = None
    ) -> Optional[AgentManifest]:
        """Get manifest for a specific agent flow"""
        
        query = self.db.query(AgentManifest).filter(AgentManifest.agent_flow_id == agent_flow_id)
        
        if version:
            query = query.filter(AgentManifest.version == version)
        else:
            query = query.order_by(desc(AgentManifest.version)).limit(1)
        
        return query.first()
    
    def validate_manifest_compliance(
        self,
        manifest_id: UUID
    ) -> Dict[str, Any]:
        """Validate manifest compliance with tenant policies"""
        
        manifest = self.db.query(AgentManifest).filter(AgentManifest.id == manifest_id).first()
        if not manifest:
            raise ValueError(f"Manifest {manifest_id} not found")
        
        validation_results = {
            "manifest_id": str(manifest.id),
            "is_compliant": True,
            "warnings": [],
            "errors": [],
            "recommendations": []
        }
        
        # Check security level compliance
        if manifest.security_level == "enterprise":
            required_compliance = ["SOC2", "ISO27001"]
            missing_compliance = [req for req in required_compliance if req not in manifest.compliance_requirements]
            
            if missing_compliance:
                validation_results["errors"].append(
                    f"Enterprise security level requires: {', '.join(missing_compliance)}"
                )
                validation_results["is_compliant"] = False
        
        # Check data access permissions
        if manifest.data_access_level == "public":
            validation_results["warnings"].append(
                "Public data access may expose sensitive information"
            )
        
        # Check tool permissions
        if not manifest.allowed_tools:
            validation_results["warnings"].append(
                "No tools are explicitly allowed - consider defining allowed_tools"
            )
        
        # Check resource limits
        if not manifest.max_cost_per_execution:
            validation_results["warnings"].append(
                "No cost limit set - consider setting max_cost_per_execution"
            )
        
        # Check audit requirements
        if manifest.security_level in ["high", "enterprise"]:
            if not manifest.audit_requirements:
                validation_results["errors"].append(
                    f"{manifest.security_level} security level requires audit requirements"
                )
                validation_results["is_compliant"] = False
        
        # Generate recommendations
        if validation_results["warnings"] or validation_results["errors"]:
            validation_results["recommendations"].append(
                "Review and update manifest to address warnings and errors"
            )
        
        if not manifest.is_verified:
            validation_results["recommendations"].append(
                "Verify manifest signature to ensure authenticity"
            )
        
        return validation_results
    
    def update_manifest(
        self,
        manifest_id: UUID,
        updates: Dict[str, Any],
        user: User,
        private_key: Optional[bytes] = None
    ) -> AgentManifest:
        """Update an existing manifest and re-sign if needed"""
        
        manifest = self.db.query(AgentManifest).filter(AgentManifest.id == manifest_id).first()
        if not manifest:
            raise ValueError(f"Manifest {manifest_id} not found")
        
        # Update fields
        for field, value in updates.items():
            if hasattr(manifest, field) and field not in ['id', 'created_at', 'updated_at']:
                setattr(manifest, field, value)
        
        # Update manifest content and YAML
        manifest.manifest_content.update(updates)
        manifest.manifest_yaml = yaml.dump(manifest.manifest_content, default_flow_style=False, sort_keys=False)
        
        # Generate new hash
        manifest.manifest_hash = hashlib.sha256(manifest.manifest_yaml.encode('utf-8')).hexdigest()
        
        # Re-sign if private key provided
        if private_key:
            manifest.signature = self._sign_manifest(manifest.manifest_hash, private_key)
            manifest.signed_by = user.id
            manifest.signed_at = datetime.utcnow()
        
        # Reset verification status
        manifest.is_verified = False
        manifest.verified_by = None
        manifest.verified_at = None
        manifest.verification_notes = None
        
        self.db.commit()
        self.db.refresh(manifest)
        
        return manifest
    
    def get_manifest_versions(
        self,
        agent_flow_id: UUID
    ) -> List[Dict[str, Any]]:
        """Get all versions of a manifest for an agent flow"""
        
        manifests = self.db.query(AgentManifest).filter(
            AgentManifest.agent_flow_id == agent_flow_id
        ).order_by(desc(AgentManifest.version)).all()
        
        versions = []
        for manifest in manifests:
            version_info = {
                "id": str(manifest.id),
                "version": manifest.version,
                "signed_at": manifest.signed_at,
                "signed_by": str(manifest.signed_by),
                "is_verified": manifest.is_verified,
                "verified_at": manifest.verified_at,
                "verified_by": str(manifest.verified_by) if manifest.verified_by else None,
                "security_level": manifest.security_level,
                "compliance_requirements": manifest.compliance_requirements,
                "capabilities": manifest.capabilities
            }
            versions.append(version_info)
        
        return versions
    
    def check_manifest_entitlements(
        self,
        manifest_id: UUID,
        requested_tools: List[str],
        requested_models: List[str],
        estimated_cost_cents: int
    ) -> Dict[str, Any]:
        """Check if execution is allowed based on manifest entitlements"""
        
        manifest = self.db.query(AgentManifest).filter(AgentManifest.id == manifest_id).first()
        if not manifest:
            raise ValueError(f"Manifest {manifest_id} not found")
        
        entitlements_check = {
            "manifest_id": str(manifest.id),
            "is_allowed": True,
            "warnings": [],
            "errors": [],
            "tool_entitlements": {},
            "model_entitlements": {},
            "cost_entitlements": {}
        }
        
        # Check tool entitlements
        for tool in requested_tools:
            if tool in manifest.restricted_tools:
                entitlements_check["tool_entitlements"][tool] = "DENIED"
                entitlements_check["errors"].append(f"Tool '{tool}' is explicitly restricted")
                entitlements_check["is_allowed"] = False
            elif tool not in manifest.allowed_tools and manifest.allowed_tools:
                entitlements_check["tool_entitlements"][tool] = "DENIED"
                entitlements_check["errors"].append(f"Tool '{tool}' not in allowed tools")
                entitlements_check["is_allowed"] = False
            else:
                entitlements_check["tool_entitlements"][tool] = "ALLOWED"
        
        # Check model entitlements
        for model in requested_models:
            if model in manifest.supported_models:
                entitlements_check["model_entitlements"][model] = "ALLOWED"
            else:
                entitlements_check["model_entitlements"][model] = "DENIED"
                entitlements_check["errors"].append(f"Model '{model}' not supported")
                entitlements_check["is_allowed"] = False
        
        # Check cost entitlements
        if manifest.max_cost_per_execution:
            if estimated_cost_cents > manifest.max_cost_per_execution:
                entitlements_check["cost_entitlements"]["max_cost"] = "EXCEEDED"
                entitlements_check["errors"].append(
                    f"Estimated cost {estimated_cost_cents} exceeds limit {manifest.max_cost_per_execution}"
                )
                entitlements_check["is_allowed"] = False
            else:
                entitlements_check["cost_entitlements"]["max_cost"] = "WITHIN_LIMIT"
        
        # Check execution limits
        if manifest.max_executions_per_day:
            # This would need to be checked against actual execution count
            entitlements_check["cost_entitlements"]["daily_limit"] = "CHECK_REQUIRED"
        
        return entitlements_check
    
    def _sign_manifest(self, manifest_hash: str, private_key: bytes) -> str:
        """Sign manifest hash with private key"""
        
        try:
            # Load private key
            key = serialization.load_pem_private_key(private_key, password=None)
            
            # Sign the hash
            signature = key.sign(
                manifest_hash.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            # Return base64 encoded signature
            return base64.b64encode(signature).decode('utf-8')
            
        except Exception as e:
            raise ValueError(f"Failed to sign manifest: {str(e)}")
    
    def _verify_signature(self, manifest_hash: str, signature: str, public_key: bytes) -> bool:
        """Verify manifest signature with public key"""
        
        try:
            # Load public key
            key = serialization.load_pem_public_key(public_key)
            
            # Decode signature
            signature_bytes = base64.b64decode(signature)
            
            # Verify signature
            key.verify(
                signature_bytes,
                manifest_hash.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
            
        except InvalidSignature:
            return False
        except Exception as e:
            raise ValueError(f"Failed to verify signature: {str(e)}")
    
    def generate_manifest_template(
        self,
        agent_flow: AgentFlow
    ) -> Dict[str, Any]:
        """Generate a manifest template for an agent flow"""
        
        template = {
            "version": "1.0.0",
            "name": agent_flow.name,
            "description": agent_flow.description or "",
            "capabilities": [],
            "supported_models": ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"],
            "multimodal_support": ["text"],
            "allowed_tools": [],
            "tool_permissions": {},
            "restricted_tools": [],
            "max_tokens_per_execution": 10000,
            "max_cost_per_execution": 1000,  # 10 USD in cents
            "max_executions_per_day": 100,
            "max_concurrent_executions": 5,
            "data_access_level": "tenant",
            "allowed_data_sources": [],
            "data_retention_policy": "execution",
            "security_level": "standard",
            "compliance_requirements": [],
            "audit_requirements": [],
            "deployment_environment": "production",
            "runtime_constraints": {
                "max_memory_mb": 512,
                "max_cpu_cores": 1,
                "timeout_seconds": 300
            },
            "health_check_endpoints": [],
            "marketplace_visibility": "private",
            "sharing_permissions": [],
            "licensing_terms": None
        }
        
        # Analyze flow nodes to suggest capabilities and tools
        if agent_flow.nodes:
            for node in agent_flow.nodes:
                node_type = node.get('type', '')
                
                if node_type == 'llm':
                    template["capabilities"].append("text_generation")
                elif node_type == 'tool':
                    tool_name = node.get('name', '')
                    if tool_name:
                        template["allowed_tools"].append(tool_name)
                elif node_type == 'rag':
                    template["capabilities"].append("document_search")
                    template["multimodal_support"].append("document")
                elif node_type == 'vision':
                    template["multimodal_support"].append("image")
                elif node_type == 'voice':
                    template["multimodal_support"].append("audio")
        
        return template
