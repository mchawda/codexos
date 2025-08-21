# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Test configuration and fixtures
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.models.tenant import Tenant
from app.core.security import get_password_hash
from app.core.auth import create_access_token


# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost/codexos_test"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session"""
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with overridden database dependency"""
    
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def test_tenant(db_session: AsyncSession) -> Tenant:
    """Create a test tenant"""
    tenant = Tenant(
        name="Test Company",
        slug="test-company",
        domain="test.codexos.dev",
        is_active=True,
        max_users=100,
        plan="professional"
    )
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant


@pytest.fixture
async def test_user(db_session: AsyncSession, test_tenant: Tenant) -> User:
    """Create a test user"""
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword"),
        is_active=True,
        is_superuser=False,
        tenant_id=test_tenant.id
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def superuser(db_session: AsyncSession, test_tenant: Tenant) -> User:
    """Create a superuser"""
    user = User(
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        hashed_password=get_password_hash("adminpassword"),
        is_active=True,
        is_superuser=True,
        tenant_id=test_tenant.id
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user: User) -> str:
    """Create access token for test user"""
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def superuser_token(superuser: User) -> str:
    """Create access token for superuser"""
    return create_access_token(data={"sub": str(superuser.id)})


@pytest.fixture
def auth_headers(test_user_token: str) -> dict:
    """Create authorization headers for test user"""
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def superuser_headers(superuser_token: str) -> dict:
    """Create authorization headers for superuser"""
    return {"Authorization": f"Bearer {superuser_token}"}
