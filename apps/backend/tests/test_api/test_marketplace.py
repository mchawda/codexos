"""
Integration tests for marketplace API endpoints
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.marketplace import MarketplaceItem, MarketplaceCategory
from app.models.user import User


@pytest.mark.asyncio
async def test_create_marketplace_item(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers: dict
):
    """Test creating a marketplace item"""
    # Create a category first
    category = MarketplaceCategory(
        name="AI Tools",
        slug="ai-tools",
        description="AI-powered tools and agents"
    )
    db_session.add(category)
    await db_session.commit()
    
    # Create item data
    item_data = {
        "name": "Test AI Agent",
        "short_description": "A test AI agent",
        "long_description": "This is a detailed description of the test AI agent",
        "item_type": "agent_template",
        "pricing_model": "free",
        "price": 0,
        "category_ids": [str(category.id)],
        "tags": ["test", "ai", "agent"]
    }
    
    # Create item
    response = await client.post(
        "/api/v1/marketplace/items",
        json=item_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == item_data["name"]
    assert data["seller"]["id"] == str(test_user.id)
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_search_marketplace_items(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User
):
    """Test searching marketplace items"""
    # Create some items
    for i in range(5):
        item = MarketplaceItem(
            tenant_id=test_user.tenant_id,
            seller_id=test_user.id,
            name=f"Test Item {i}",
            slug=f"test-item-{i}",
            short_description=f"Description {i}",
            long_description=f"Long description {i}",
            item_type="agent_template",
            status="published",
            pricing_model="free",
            price=0
        )
        db_session.add(item)
    
    await db_session.commit()
    
    # Search items
    response = await client.get("/api/v1/marketplace/items")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    
    # Search with query
    response = await client.get("/api/v1/marketplace/items?q=Test%20Item%202")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Item 2"


@pytest.mark.asyncio
async def test_purchase_free_item(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers: dict
):
    """Test purchasing a free marketplace item"""
    # Create a free item
    item = MarketplaceItem(
        tenant_id=test_user.tenant_id,
        seller_id=test_user.id,
        name="Free AI Agent",
        slug="free-ai-agent",
        short_description="A free AI agent",
        long_description="This is a free AI agent",
        item_type="agent_template",
        status="published",
        pricing_model="free",
        price=0
    )
    db_session.add(item)
    await db_session.commit()
    
    # Purchase item
    response = await client.post(
        f"/api/v1/marketplace/items/{item.id}/purchase",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "license_key" in data
    
    # Try to purchase again (should fail)
    response = await client.post(
        f"/api/v1/marketplace/items/{item.id}/purchase",
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "already own" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_my_marketplace_items(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers: dict
):
    """Test getting user's own marketplace items"""
    # Create items for the user
    for i in range(3):
        item = MarketplaceItem(
            tenant_id=test_user.tenant_id,
            seller_id=test_user.id,
            name=f"My Item {i}",
            slug=f"my-item-{i}",
            short_description=f"My description {i}",
            long_description=f"My long description {i}",
            item_type="agent_template",
            status="draft" if i == 0 else "published",
            pricing_model="free",
            price=0
        )
        db_session.add(item)
    
    await db_session.commit()
    
    # Get user's items
    response = await client.get(
        "/api/v1/marketplace/my-items",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    
    # Filter by status
    response = await client.get(
        "/api/v1/marketplace/my-items?status=published",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_marketplace_categories(
    client: AsyncClient,
    db_session: AsyncSession
):
    """Test getting marketplace categories"""
    # Create categories
    categories = [
        MarketplaceCategory(
            name="AI Agents",
            slug="ai-agents",
            description="Autonomous AI agents",
            display_order=1
        ),
        MarketplaceCategory(
            name="Data Tools",
            slug="data-tools",
            description="Data processing tools",
            display_order=2
        ),
        MarketplaceCategory(
            name="Security",
            slug="security",
            description="Security tools",
            display_order=3,
            is_active=False  # Inactive category
        )
    ]
    
    for cat in categories:
        db_session.add(cat)
    await db_session.commit()
    
    # Get categories
    response = await client.get("/api/v1/marketplace/categories")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Only active categories
    assert data[0]["name"] == "AI Agents"
    assert data[1]["name"] == "Data Tools"
