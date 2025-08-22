# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Common API dependencies
"""

from app.core.auth import get_current_user, get_db
from app.db.session import get_db as get_db_session

# Re-export common dependencies
__all__ = [
    "get_current_user",
    "get_db",
    "get_db_session"
]
