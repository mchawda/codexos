#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

"""Simple startup script for CodexOS backend"""

import subprocess
import sys
import os

# Set environment variables
os.environ["DATABASE_URL"] = "postgresql://codexos:codexos_secure_password@localhost:5432/codexos_db"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["SECRET_KEY"] = "dev-secret-key-change-in-production"
os.environ["API_HOST"] = "0.0.0.0"
os.environ["API_PORT"] = "8001"

# Install minimal dependencies if needed
try:
    import fastapi
    import uvicorn
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn[standard]", "pydantic", "python-jose[cryptography]", "passlib[bcrypt]", "python-multipart"])

# Run the server
print("\n🚀 Starting CodexOS Backend...")
print("📡 API will be available at: http://localhost:8001")
print("📚 API Documentation: http://localhost:8001/api/v1/docs\n")

subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8001"])
