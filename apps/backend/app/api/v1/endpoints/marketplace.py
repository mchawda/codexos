"""
Marketplace API endpoints for discovering and purchasing AI agent templates
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.marketplace import (
    MarketplaceCategory, MarketplaceItem, MarketplacePurchase,
    MarketplaceReview, MarketplaceItemStatus, PricingModel
)
from app.models.agent import AgentFlow
from app.core.auth import require_permission

router = APIRouter()


@router.get("/categories")
async def list_categories(
    parent_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get marketplace categories"""
    query = select(MarketplaceCategory).where(MarketplaceCategory.is_active == True)
    
    if parent_id:
        query = query.where(MarketplaceCategory.parent_id == parent_id)
    else:
        query = query.where(MarketplaceCategory.parent_id.is_(None))
    
    query = query.order_by(MarketplaceCategory.display_order, MarketplaceCategory.name)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    return [{
        "id": str(cat.id),
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "icon": cat.icon,
        "item_count": cat.item_count
    } for cat in categories]


@router.get("/items")
async def search_marketplace(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category slug"),
    item_type: Optional[str] = Query(None, description="Item type"),
    pricing_model: Optional[str] = Query(None, description="Pricing model"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    sort_by: str = Query("popular", description="Sort by: popular, newest, rating, price_low, price_high"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Search and browse marketplace items"""
    query = select(MarketplaceItem).where(
        and_(
            MarketplaceItem.status == MarketplaceItemStatus.PUBLISHED.value,
            MarketplaceItem.is_private == False
        )
    )
    
    # Apply filters
    if q:
        search_term = f"%{q}%"
        query = query.where(
            or_(
                MarketplaceItem.name.ilike(search_term),
                MarketplaceItem.short_description.ilike(search_term),
                MarketplaceItem.tags.contains([q])
            )
        )
    
    if category:
        query = query.join(MarketplaceItem.categories).where(
            MarketplaceCategory.slug == category
        )
    
    if item_type:
        query = query.where(MarketplaceItem.item_type == item_type)
    
    if pricing_model:
        query = query.where(MarketplaceItem.pricing_model == pricing_model)
    
    if min_price is not None:
        query = query.where(MarketplaceItem.price >= min_price)
    
    if max_price is not None:
        query = query.where(MarketplaceItem.price <= max_price)
    
    if min_rating is not None:
        query = query.where(MarketplaceItem.rating_average >= min_rating)
    
    # Apply sorting
    if sort_by == "popular":
        query = query.order_by(desc(MarketplaceItem.install_count))
    elif sort_by == "newest":
        query = query.order_by(desc(MarketplaceItem.published_at))
    elif sort_by == "rating":
        query = query.order_by(desc(MarketplaceItem.rating_average), desc(MarketplaceItem.rating_count))
    elif sort_by == "price_low":
        query = query.order_by(MarketplaceItem.price)
    elif sort_by == "price_high":
        query = query.order_by(desc(MarketplaceItem.price))
    
    # Add eager loading
    query = query.options(
        selectinload(MarketplaceItem.seller),
        selectinload(MarketplaceItem.categories)
    )
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    # Track views
    for item in items:
        item.view_count += 1
    await db.commit()
    
    return [{
        "id": str(item.id),
        "name": item.name,
        "slug": item.slug,
        "short_description": item.short_description,
        "item_type": item.item_type,
        "pricing_model": item.pricing_model,
        "price": float(item.price) if item.price else 0,
        "rating_average": float(item.rating_average) if item.rating_average else 0,
        "rating_count": item.rating_count,
        "install_count": item.install_count,
        "thumbnail_url": item.thumbnail_url,
        "seller": {
            "id": str(item.seller.id),
            "username": item.seller.username,
            "avatar_url": item.seller.avatar_url
        },
        "categories": [cat.slug for cat in item.categories]
    } for item in items]


@router.get("/items/{item_id}")
async def get_marketplace_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get detailed marketplace item information"""
    result = await db.execute(
        select(MarketplaceItem)
        .where(MarketplaceItem.id == item_id)
        .options(
            selectinload(MarketplaceItem.seller),
            selectinload(MarketplaceItem.categories),
            selectinload(MarketplaceItem.agent_flow)
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found"
        )
    
    # Check visibility
    if item.status != MarketplaceItemStatus.PUBLISHED.value and not item.is_private:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not available"
        )
    
    # Increment view count
    item.view_count += 1
    await db.commit()
    
    return {
        "id": str(item.id),
        "name": item.name,
        "slug": item.slug,
        "short_description": item.short_description,
        "long_description": item.long_description,
        "item_type": item.item_type,
        "status": item.status,
        "version": item.version,
        "pricing_model": item.pricing_model,
        "price": float(item.price) if item.price else 0,
        "thumbnail_url": item.thumbnail_url,
        "preview_images": item.preview_images,
        "demo_video_url": item.demo_video_url,
        "features": item.features,
        "tags": item.tags,
        "requirements": item.requirements,
        "has_free_trial": item.has_free_trial,
        "trial_days": item.trial_days,
        "demo_available": item.demo_available,
        "documentation_url": item.documentation_url,
        "support_email": item.support_email,
        "support_url": item.support_url,
        "rating_average": float(item.rating_average) if item.rating_average else 0,
        "rating_count": item.rating_count,
        "install_count": item.install_count,
        "view_count": item.view_count,
        "published_at": item.published_at.isoformat() if item.published_at else None,
        "seller": {
            "id": str(item.seller.id),
            "username": item.seller.username,
            "full_name": item.seller.full_name,
            "avatar_url": item.seller.avatar_url
        },
        "categories": [{
            "id": str(cat.id),
            "name": cat.name,
            "slug": cat.slug
        } for cat in item.categories],
        "agent_flow": {
            "id": str(item.agent_flow.id),
            "name": item.agent_flow.name,
            "description": item.agent_flow.description
        } if item.agent_flow else None
    }


@router.post("/items/{item_id}/purchase")
async def purchase_item(
    item_id: str,
    payment_method_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Purchase a marketplace item"""
    # Get item
    result = await db.execute(
        select(MarketplaceItem).where(
            and_(
                MarketplaceItem.id == item_id,
                MarketplaceItem.status == MarketplaceItemStatus.PUBLISHED.value
            )
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found"
        )
    
    # Check if already purchased
    existing = await db.execute(
        select(MarketplacePurchase).where(
            and_(
                MarketplacePurchase.item_id == item_id,
                MarketplacePurchase.buyer_id == current_user.id,
                MarketplacePurchase.status == "completed"
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already own this item"
        )
    
    # For free items, complete immediately
    if item.pricing_model == PricingModel.FREE.value:
        purchase = MarketplacePurchase(
            item_id=item.id,
            buyer_id=current_user.id,
            tenant_id=current_user.tenant_id,
            purchase_type="one_time",
            amount=Decimal("0"),
            status="completed",
            completed_at=datetime.utcnow(),
            license_key=f"CK-{item.id[:8]}-{current_user.id[:8]}-{datetime.utcnow().strftime('%Y%m%d')}"
        )
        db.add(purchase)
        
        # Update install count
        item.install_count += 1
        
        await db.commit()
        
        return {
            "status": "completed",
            "purchase_id": str(purchase.id),
            "license_key": purchase.license_key
        }
    
    # For paid items, this would integrate with Stripe
    return {
        "status": "pending",
        "message": "Payment integration coming soon",
        "item_id": str(item.id),
        "amount": float(item.price)
    }


@router.get("/my-items")
async def get_my_marketplace_items(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get current user's marketplace items"""
    query = select(MarketplaceItem).where(
        MarketplaceItem.seller_id == current_user.id
    )
    
    if status:
        query = query.where(MarketplaceItem.status == status)
    
    query = query.order_by(desc(MarketplaceItem.created_at))
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return [{
        "id": str(item.id),
        "name": item.name,
        "slug": item.slug,
        "status": item.status,
        "item_type": item.item_type,
        "pricing_model": item.pricing_model,
        "price": float(item.price) if item.price else 0,
        "view_count": item.view_count,
        "install_count": item.install_count,
        "revenue_total": float(item.revenue_total) if item.revenue_total else 0,
        "created_at": item.created_at.isoformat(),
        "published_at": item.published_at.isoformat() if item.published_at else None
    } for item in items]


@router.get("/my-purchases")
async def get_my_purchases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get current user's purchases"""
    result = await db.execute(
        select(MarketplacePurchase)
        .where(MarketplacePurchase.buyer_id == current_user.id)
        .options(selectinload(MarketplacePurchase.item))
        .order_by(desc(MarketplacePurchase.created_at))
    )
    purchases = result.scalars().all()
    
    return [{
        "id": str(purchase.id),
        "item": {
            "id": str(purchase.item.id),
            "name": purchase.item.name,
            "slug": purchase.item.slug,
            "thumbnail_url": purchase.item.thumbnail_url
        },
        "purchase_type": purchase.purchase_type,
        "amount": float(purchase.amount),
        "status": purchase.status,
        "license_key": purchase.license_key,
        "purchased_at": purchase.created_at.isoformat()
    } for purchase in purchases]