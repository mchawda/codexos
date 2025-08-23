# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Multi-factor Authentication Service
"""

import os
import io
import time
import secrets
import base64
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime, timedelta
import pyotp
import qrcode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import structlog
from twilio.rest import Client
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.models.user import User
from app.core.config import settings
from app.services.security_compliance_service import SecurityEventType, security_compliance_service

logger = structlog.get_logger()


class MFAMethod:
    TOTP = "totp"  # Time-based One-Time Password (Google Authenticator)
    SMS = "sms"    # SMS verification
    EMAIL = "email"  # Email verification
    BACKUP_CODES = "backup_codes"  # Backup codes


class MFAService:
    """Service for Multi-factor Authentication"""
    
    def __init__(self):
        self.app_name = "CodexOS"
        self.totp_issuer = "CodexOS.dev"
        
        # Initialize Twilio for SMS (if configured)
        self.twilio_client = None
        if hasattr(settings, 'TWILIO_ACCOUNT_SID') and hasattr(settings, 'TWILIO_AUTH_TOKEN'):
            self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.twilio_from_number = getattr(settings, 'TWILIO_FROM_NUMBER', None)
    
    async def enable_mfa(
        self,
        db: AsyncSession,
        user: User,
        method: str = MFAMethod.TOTP,
    ) -> Dict[str, Any]:
        """Enable MFA for a user"""
        if method == MFAMethod.TOTP:
            return await self._enable_totp(db, user)
        elif method == MFAMethod.SMS:
            return await self._enable_sms(db, user)
        elif method == MFAMethod.EMAIL:
            return await self._enable_email(db, user)
        else:
            raise ValueError(f"Unsupported MFA method: {method}")
    
    async def _enable_totp(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        """Enable TOTP (Google Authenticator) for user"""
        # Generate secret
        secret = pyotp.random_base32()
        
        # Store encrypted secret
        encrypted_secret, metadata = security_compliance_service.encrypt_sensitive_data(
            secret,
            classification=security_compliance_service.DataClassification.RESTRICTED,
        )
        
        # Update user's MFA settings
        user.mfa_secret = encrypted_secret
        user.mfa_method = MFAMethod.TOTP
        user.mfa_enabled = False  # Will be enabled after verification
        
        # Generate QR code
        provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name=self.totp_issuer,
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Generate backup codes
        backup_codes = self._generate_backup_codes()
        encrypted_codes, _ = security_compliance_service.encrypt_sensitive_data(
            ",".join(backup_codes),
            classification=security_compliance_service.DataClassification.RESTRICTED,
        )
        user.mfa_backup_codes = encrypted_codes
        
        await db.commit()
        
        logger.info("TOTP MFA setup initiated", user_id=str(user.id))
        
        return {
            "method": MFAMethod.TOTP,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "secret": secret,  # Show once for manual entry
            "backup_codes": backup_codes,
            "status": "pending_verification",
        }
    
    async def _enable_sms(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        """Enable SMS MFA for user"""
        if not user.phone_number:
            raise ValueError("Phone number required for SMS MFA")
        
        if not self.twilio_client:
            raise ValueError("SMS service not configured")
        
        user.mfa_method = MFAMethod.SMS
        user.mfa_enabled = False
        
        await db.commit()
        
        # Send verification code
        code = self._generate_verification_code()
        await self._send_sms_code(user.phone_number, code)
        
        # Store code temporarily (in production, use Redis with TTL)
        self._store_temp_code(str(user.id), code)
        
        return {
            "method": MFAMethod.SMS,
            "phone_number": self._mask_phone_number(user.phone_number),
            "status": "pending_verification",
        }
    
    async def _enable_email(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        """Enable Email MFA for user"""
        user.mfa_method = MFAMethod.EMAIL
        user.mfa_enabled = False
        
        await db.commit()
        
        # Send verification code
        code = self._generate_verification_code()
        await self._send_email_code(user.email, code)
        
        # Store code temporarily
        self._store_temp_code(str(user.id), code)
        
        return {
            "method": MFAMethod.EMAIL,
            "email": self._mask_email(user.email),
            "status": "pending_verification",
        }
    
    async def verify_mfa_setup(
        self,
        db: AsyncSession,
        user: User,
        code: str,
    ) -> bool:
        """Verify MFA setup with provided code"""
        if user.mfa_method == MFAMethod.TOTP:
            # Decrypt secret
            secret = security_compliance_service.decrypt_sensitive_data(user.mfa_secret)
            totp = pyotp.TOTP(secret)
            
            if totp.verify(code, valid_window=1):
                user.mfa_enabled = True
                await db.commit()
                
                await security_compliance_service.log_security_event(
                    db,
                    SecurityEventType.MFA_SUCCESS,
                    user_id=str(user.id),
                    details={"method": MFAMethod.TOTP, "action": "setup"},
                )
                
                return True
        
        elif user.mfa_method in [MFAMethod.SMS, MFAMethod.EMAIL]:
            stored_code = self._get_temp_code(str(user.id))
            if stored_code and stored_code == code:
                user.mfa_enabled = True
                await db.commit()
                
                await security_compliance_service.log_security_event(
                    db,
                    SecurityEventType.MFA_SUCCESS,
                    user_id=str(user.id),
                    details={"method": user.mfa_method, "action": "setup"},
                )
                
                self._clear_temp_code(str(user.id))
                return True
        
        await security_compliance_service.log_security_event(
            db,
            SecurityEventType.MFA_FAILURE,
            user_id=str(user.id),
            details={"method": user.mfa_method, "action": "setup"},
        )
        
        return False
    
    async def verify_mfa(
        self,
        db: AsyncSession,
        user: User,
        code: str,
        ip_address: Optional[str] = None,
    ) -> Tuple[bool, Optional[str]]:
        """Verify MFA code during login"""
        if not user.mfa_enabled:
            return True, None
        
        if user.mfa_method == MFAMethod.TOTP:
            # Check if it's a backup code
            if len(code) == 8 and code.isalnum():
                return await self._verify_backup_code(db, user, code, ip_address)
            
            # Verify TOTP
            secret = security_compliance_service.decrypt_sensitive_data(user.mfa_secret)
            totp = pyotp.TOTP(secret)
            
            if totp.verify(code, valid_window=1):
                await security_compliance_service.log_security_event(
                    db,
                    SecurityEventType.MFA_SUCCESS,
                    user_id=str(user.id),
                    details={"method": MFAMethod.TOTP},
                    ip_address=ip_address,
                )
                return True, None
        
        elif user.mfa_method in [MFAMethod.SMS, MFAMethod.EMAIL]:
            stored_code = self._get_temp_code(f"{user.id}_login")
            if stored_code and stored_code == code:
                await security_compliance_service.log_security_event(
                    db,
                    SecurityEventType.MFA_SUCCESS,
                    user_id=str(user.id),
                    details={"method": user.mfa_method},
                    ip_address=ip_address,
                )
                self._clear_temp_code(f"{user.id}_login")
                return True, None
        
        await security_compliance_service.log_security_event(
            db,
            SecurityEventType.MFA_FAILURE,
            user_id=str(user.id),
            details={"method": user.mfa_method},
            ip_address=ip_address,
        )
        
        return False, "Invalid verification code"
    
    async def send_mfa_code(
        self,
        db: AsyncSession,
        user: User,
    ) -> Dict[str, Any]:
        """Send MFA code for login"""
        if not user.mfa_enabled:
            return {"required": False}
        
        if user.mfa_method == MFAMethod.SMS:
            code = self._generate_verification_code()
            await self._send_sms_code(user.phone_number, code)
            self._store_temp_code(f"{user.id}_login", code, ttl=300)  # 5 minutes
            
            return {
                "required": True,
                "method": MFAMethod.SMS,
                "destination": self._mask_phone_number(user.phone_number),
            }
        
        elif user.mfa_method == MFAMethod.EMAIL:
            code = self._generate_verification_code()
            await self._send_email_code(user.email, code)
            self._store_temp_code(f"{user.id}_login", code, ttl=300)
            
            return {
                "required": True,
                "method": MFAMethod.EMAIL,
                "destination": self._mask_email(user.email),
            }
        
        elif user.mfa_method == MFAMethod.TOTP:
            return {
                "required": True,
                "method": MFAMethod.TOTP,
            }
        
        return {"required": False}
    
    async def disable_mfa(
        self,
        db: AsyncSession,
        user: User,
        password: str,
    ) -> bool:
        """Disable MFA for user (requires password verification)"""
        # Verify password first
        from app.core.auth import verify_password
        if not verify_password(password, user.hashed_password):
            return False
        
        user.mfa_enabled = False
        user.mfa_method = None
        user.mfa_secret = None
        user.mfa_backup_codes = None
        
        await db.commit()
        
        await security_compliance_service.log_security_event(
            db,
            SecurityEventType.MFA_SUCCESS,
            user_id=str(user.id),
            details={"action": "disabled"},
        )
        
        return True
    
    async def regenerate_backup_codes(
        self,
        db: AsyncSession,
        user: User,
    ) -> List[str]:
        """Regenerate backup codes"""
        if not user.mfa_enabled:
            raise ValueError("MFA not enabled")
        
        backup_codes = self._generate_backup_codes()
        encrypted_codes, _ = security_compliance_service.encrypt_sensitive_data(
            ",".join(backup_codes),
            classification=security_compliance_service.DataClassification.RESTRICTED,
        )
        
        user.mfa_backup_codes = encrypted_codes
        await db.commit()
        
        return backup_codes
    
    async def _verify_backup_code(
        self,
        db: AsyncSession,
        user: User,
        code: str,
        ip_address: Optional[str],
    ) -> Tuple[bool, Optional[str]]:
        """Verify and consume a backup code"""
        if not user.mfa_backup_codes:
            return False, "No backup codes available"
        
        decrypted_codes = security_compliance_service.decrypt_sensitive_data(
            user.mfa_backup_codes
        )
        codes = decrypted_codes.split(",")
        
        if code in codes:
            # Remove used code
            codes.remove(code)
            
            if codes:
                encrypted_codes, _ = security_compliance_service.encrypt_sensitive_data(
                    ",".join(codes),
                    classification=security_compliance_service.DataClassification.RESTRICTED,
                )
                user.mfa_backup_codes = encrypted_codes
            else:
                user.mfa_backup_codes = None
            
            await db.commit()
            
            await security_compliance_service.log_security_event(
                db,
                SecurityEventType.MFA_SUCCESS,
                user_id=str(user.id),
                details={"method": MFAMethod.BACKUP_CODES, "codes_remaining": len(codes)},
                ip_address=ip_address,
            )
            
            return True, f"Backup code used. {len(codes)} codes remaining."
        
        return False, "Invalid backup code"
    
    def _generate_backup_codes(self, count: int = 8) -> List[str]:
        """Generate backup codes"""
        return [secrets.token_hex(4).upper() for _ in range(count)]
    
    def _generate_verification_code(self) -> str:
        """Generate 6-digit verification code"""
        return f"{secrets.randbelow(999999):06d}"
    
    async def _send_sms_code(self, phone_number: str, code: str):
        """Send SMS verification code"""
        if not self.twilio_client:
            logger.error("SMS service not configured")
            return
        
        try:
            message = self.twilio_client.messages.create(
                body=f"Your CodexOS verification code is: {code}",
                from_=self.twilio_from_number,
                to=phone_number,
            )
            logger.info("SMS sent", message_sid=message.sid)
        except Exception as e:
            logger.error("Failed to send SMS", error=str(e))
            raise
    
    async def _send_email_code(self, email: str, code: str):
        """Send email verification code"""
        message = MIMEMultipart()
        message["From"] = getattr(settings, 'SMTP_FROM', 'noreply@codexos.dev')
        message["To"] = email
        message["Subject"] = "CodexOS Verification Code"
        
        body = f"""
        Your CodexOS verification code is: {code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        """
        
        message.attach(MIMEText(body, "plain"))
        
        try:
            await aiosmtplib.send(
                message,
                hostname=getattr(settings, 'SMTP_HOST', 'localhost'),
                port=getattr(settings, 'SMTP_PORT', 587),
                username=getattr(settings, 'SMTP_USER', None),
                password=getattr(settings, 'SMTP_PASSWORD', None),
                use_tls=True,
            )
            logger.info("Email sent", to=email)
        except Exception as e:
            logger.error("Failed to send email", error=str(e))
            raise
    
    def _mask_phone_number(self, phone: str) -> str:
        """Mask phone number for display"""
        if len(phone) < 4:
            return "****"
        return f"***{phone[-4:]}"
    
    def _mask_email(self, email: str) -> str:
        """Mask email for display"""
        parts = email.split("@")
        if len(parts) != 2:
            return "****"
        
        username = parts[0]
        if len(username) <= 2:
            masked_username = "*" * len(username)
        else:
            masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
        
        return f"{masked_username}@{parts[1]}"
    
    # Temporary storage methods (replace with Redis in production)
    _temp_codes: Dict[str, Tuple[str, float]] = {}
    
    def _store_temp_code(self, key: str, code: str, ttl: int = 300):
        """Store temporary code with TTL"""
        expiry = time.time() + ttl
        self._temp_codes[key] = (code, expiry)
    
    def _get_temp_code(self, key: str) -> Optional[str]:
        """Get temporary code if not expired"""
        if key in self._temp_codes:
            code, expiry = self._temp_codes[key]
            if time.time() < expiry:
                return code
            else:
                del self._temp_codes[key]
        return None
    
    def _clear_temp_code(self, key: str):
        """Clear temporary code"""
        if key in self._temp_codes:
            del self._temp_codes[key]


# Singleton instance
mfa_service = MFAService()
