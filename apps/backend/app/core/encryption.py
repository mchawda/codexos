# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Enterprise-grade encryption service for CodexOS
AES-256-GCM with key derivation and rotation support
"""

import base64
import hashlib
import secrets
from typing import Dict, Tuple, Optional, Any
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
import json

from app.core.config import settings


class EncryptionService:
    """
    Enterprise encryption service with AES-256-GCM
    Supports key rotation and multiple KDF algorithms
    """
    
    def __init__(self):
        self.backend = default_backend()
        self.master_key = self._derive_master_key()
        
    def _derive_master_key(self) -> bytes:
        """Derive master key from environment variable using PBKDF2"""
        # Use PBKDF2 with high iterations for master key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits
            salt=settings.ENCRYPTION_SALT.encode(),
            iterations=settings.KDF_ITERATIONS,
            backend=self.backend
        )
        return kdf.derive(settings.VAULT_MASTER_KEY.encode())
    
    def generate_data_key(self) -> Tuple[str, str, str]:
        """
        Generate a new data encryption key (DEK)
        Returns: (key_id, encrypted_key, salt)
        """
        # Generate random DEK
        data_key = secrets.token_bytes(32)  # 256 bits
        salt = secrets.token_bytes(16)  # 128 bits
        
        # Encrypt DEK with master key
        encrypted_key, nonce, tag = self._encrypt_with_master_key(data_key, salt)
        
        # Generate key ID
        key_id = secrets.token_urlsafe(16)
        
        # Encode for storage
        encrypted_key_b64 = base64.b64encode(encrypted_key + nonce + tag).decode()
        salt_b64 = base64.b64encode(salt).decode()
        
        return key_id, encrypted_key_b64, salt_b64
    
    def _encrypt_with_master_key(self, data: bytes, salt: bytes) -> Tuple[bytes, bytes, bytes]:
        """Encrypt data with master key using AES-256-GCM"""
        # Derive key from master key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=10000,
            backend=self.backend
        )
        key = kdf.derive(self.master_key)
        
        # Generate nonce
        nonce = secrets.token_bytes(12)  # 96 bits for GCM
        
        # Encrypt
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(nonce),
            backend=self.backend
        )
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(data) + encryptor.finalize()
        
        return ciphertext, nonce, encryptor.tag
    
    def encrypt_value(self, plaintext: str, key_id: str, encrypted_key_b64: str, salt_b64: str) -> Dict[str, str]:
        """
        Encrypt a value using a data encryption key
        Returns dict with encrypted_value, nonce, auth_tag
        """
        # Decode key and salt
        encrypted_key_data = base64.b64decode(encrypted_key_b64)
        encrypted_key = encrypted_key_data[:-28]  # Remove nonce (12) and tag (16)
        master_nonce = encrypted_key_data[-28:-16]
        master_tag = encrypted_key_data[-16:]
        salt = base64.b64decode(salt_b64)
        
        # Decrypt DEK
        data_key = self._decrypt_with_master_key(encrypted_key, salt, master_nonce, master_tag)
        
        # Generate nonce for value encryption
        nonce = secrets.token_bytes(12)
        
        # Encrypt value
        cipher = Cipher(
            algorithms.AES(data_key),
            modes.GCM(nonce),
            backend=self.backend
        )
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(plaintext.encode()) + encryptor.finalize()
        
        return {
            'encrypted_value': base64.b64encode(ciphertext).decode(),
            'nonce': base64.b64encode(nonce).decode(),
            'auth_tag': base64.b64encode(encryptor.tag).decode()
        }
    
    def decrypt_value(self, encrypted_value: str, nonce: str, auth_tag: str, 
                     key_id: str, encrypted_key_b64: str, salt_b64: str) -> str:
        """Decrypt a value using a data encryption key"""
        # Decode key and salt
        encrypted_key_data = base64.b64decode(encrypted_key_b64)
        encrypted_key = encrypted_key_data[:-28]
        master_nonce = encrypted_key_data[-28:-16]
        master_tag = encrypted_key_data[-16:]
        salt = base64.b64decode(salt_b64)
        
        # Decrypt DEK
        data_key = self._decrypt_with_master_key(encrypted_key, salt, master_nonce, master_tag)
        
        # Decode encrypted value and parameters
        ciphertext = base64.b64decode(encrypted_value)
        nonce_bytes = base64.b64decode(nonce)
        tag_bytes = base64.b64decode(auth_tag)
        
        # Decrypt value
        cipher = Cipher(
            algorithms.AES(data_key),
            modes.GCM(nonce_bytes, tag_bytes),
            backend=self.backend
        )
        decryptor = cipher.decryptor()
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        return plaintext.decode()
    
    def _decrypt_with_master_key(self, ciphertext: bytes, salt: bytes, nonce: bytes, tag: bytes) -> bytes:
        """Decrypt data with master key"""
        # Derive key from master key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=10000,
            backend=self.backend
        )
        key = kdf.derive(self.master_key)
        
        # Decrypt
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(nonce, tag),
            backend=self.backend
        )
        decryptor = cipher.decryptor()
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        return plaintext
    
    def encrypt_json(self, data: Dict[str, Any], key_id: str, encrypted_key: str, salt: str) -> Dict[str, str]:
        """Encrypt JSON data"""
        json_str = json.dumps(data, separators=(',', ':'))
        return self.encrypt_value(json_str, key_id, encrypted_key, salt)
    
    def decrypt_json(self, encrypted_value: str, nonce: str, auth_tag: str,
                    key_id: str, encrypted_key: str, salt: str) -> Dict[str, Any]:
        """Decrypt JSON data"""
        json_str = self.decrypt_value(encrypted_value, nonce, auth_tag, key_id, encrypted_key, salt)
        return json.loads(json_str)
    
    def generate_api_key(self) -> str:
        """Generate a secure API key"""
        # Format: ck_live_<random_string>
        prefix = "ck_test_" if settings.ENVIRONMENT == "development" else "ck_live_"
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}{random_part}"
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def generate_mfa_secret(self) -> str:
        """Generate TOTP secret for MFA"""
        return base64.b32encode(secrets.token_bytes(20)).decode().strip('=')
    
    def generate_backup_codes(self, count: int = 8) -> list[str]:
        """Generate MFA backup codes"""
        codes = []
        for _ in range(count):
            # Format: XXXX-XXXX
            code = f"{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
            codes.append(code)
        return codes
    
    def hash_backup_code(self, code: str) -> str:
        """Hash backup code for storage"""
        # Remove dashes and hash
        clean_code = code.replace('-', '')
        return hashlib.sha256(clean_code.encode()).hexdigest()


# Global encryption service instance
encryption_service = EncryptionService()
