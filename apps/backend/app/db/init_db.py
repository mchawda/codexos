# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Database initialization"""

from sqlalchemy.ext.asyncio import AsyncConnection

from app.db.base import Base


async def init_db(conn: AsyncConnection) -> None:
    """Initialize database tables"""
    # Import all models to register them with SQLAlchemy
    from app.models import user, agent, vault  # noqa: F401
    
    # Create all tables
    await conn.run_sync(Base.metadata.create_all)
