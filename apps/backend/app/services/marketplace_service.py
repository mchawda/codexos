# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Marketplace service for handling business logic
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
import structlog

from app.models.user import User
from app.models.marketplace import (
    MarketplaceItem, MarketplaceCategory, MarketplacePurchase,
    MarketplaceReview, MarketplaceAnalytics, MarketplaceItemStatus
)
from app.core.config import settings

logger = structlog.get_logger()


class MarketplaceService:
    """Service for marketplace operations"""
    
    async def create_item(
        self,
        db: AsyncSession,
        user: User,
        item_data: Dict[str, Any]
    ) -> MarketplaceItem:
        """Create a new marketplace item"""
        # Generate slug
        base_slug = item_data["name"].lower().replace(" ", "-")
        slug = await self._generate_unique_slug(db, user.tenant_id, base_slug)
        
        # Create item
        item = MarketplaceItem(
            tenant_id=user.tenant_id,
            seller_id=user.id,
            name=item_data["name"],
            slug=slug,
            short_description=item_data["short_description"],
            long_description=item_data["long_description"],
            item_type=item_data["item_type"],
            status=MarketplaceItemStatus.DRAFT.value,
            version="1.0.0",
            pricing_model=item_data.get("pricing_model", "free"),
            price=Decimal(str(item_data.get("price", 0))),
            features=item_data.get("features", []),
            tags=item_data.get("tags", []),
            requirements=item_data.get("requirements", {}),
            agent_flow_id=item_data.get("agent_flow_id"),
            thumbnail_url=item_data.get("thumbnail_url"),
            preview_images=item_data.get("preview_images", []),
            demo_video_url=item_data.get("demo_video_url"),
            documentation_url=item_data.get("documentation_url"),
            support_email=item_data.get("support_email", user.email),
            has_free_trial=item_data.get("has_free_trial", False),
            trial_days=item_data.get("trial_days", 0),
            demo_available=item_data.get("demo_available", False)
        )
        
        db.add(item)
        
        # Add categories
        if item_data.get("category_ids"):
            categories = await db.execute(
                select(MarketplaceCategory).where(
                    MarketplaceCategory.id.in_(item_data["category_ids"])
                )
            )
            item.categories = list(categories.scalars().all())
        
        await db.commit()
        await db.refresh(item)
        
        logger.info(f"Created marketplace item: {item.id}")
        return item
    
    async def update_item(
        self,
        db: AsyncSession,
        item: MarketplaceItem,
        item_data: Dict[str, Any]
    ) -> MarketplaceItem:
        """Update marketplace item"""
        # Update basic fields
        update_fields = [
            "name", "short_description", "long_description",
            "pricing_model", "price", "features", "tags",
            "requirements", "thumbnail_url", "preview_images",
            "demo_video_url", "documentation_url", "support_email",
            "has_free_trial", "trial_days", "demo_available"
        ]
        
        for field in update_fields:
            if field in item_data:
                if field == "price":
                    setattr(item, field, Decimal(str(item_data[field])))
                else:
                    setattr(item, field, item_data[field])
        
        # Update categories if provided
        if "category_ids" in item_data:
            categories = await db.execute(
                select(MarketplaceCategory).where(
                    MarketplaceCategory.id.in_(item_data["category_ids"])
                )
            )
            item.categories = list(categories.scalars().all())
        
        # Update version if content changed
        if any(field in item_data for field in ["long_description", "features", "agent_flow_id"]):
            current_version = item.version.split(".")
            current_version[2] = str(int(current_version[2]) + 1)
            item.version = ".".join(current_version)
        
        item.last_updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(item)
        
        logger.info(f"Updated marketplace item: {item.id}")
        return item
    
    async def process_purchase(
        self,
        db: AsyncSession,
        user: User,
        item: MarketplaceItem,
        payment_method_id: Optional[str] = None
    ) -> MarketplacePurchase:
        """Process item purchase"""
        # Calculate fees
        platform_fee = (item.price * item.platform_fee_percent / 100).quantize(Decimal("0.01"))
        seller_revenue = item.price - platform_fee
        
        # Create purchase record
        purchase = MarketplacePurchase(
            item_id=item.id,
            buyer_id=user.id,
            tenant_id=user.tenant_id,
            purchase_type="one_time",
            amount=item.price,
            status="pending",
            platform_fee=platform_fee,
            seller_revenue=seller_revenue,
            license_key=self._generate_license_key(item.id, user.id)
        )
        
        db.add(purchase)
        
        # For free items, complete immediately
        if item.price == 0:
            purchase.status = "completed"
            purchase.completed_at = datetime.utcnow()
            
            # Update item stats
            item.install_count += 1
            item.revenue_total += seller_revenue
        
        await db.commit()
        await db.refresh(purchase)
        
        # Track analytics
        await self._track_purchase_analytics(db, item.id)
        
        logger.info(f"Processed purchase: {purchase.id} for item: {item.id}")
        return purchase
    
    async def create_review(
        self,
        db: AsyncSession,
        user: User,
        item_id: str,
        purchase_id: str,
        review_data: Dict[str, Any]
    ) -> MarketplaceReview:
        """Create a review for an item"""
        review = MarketplaceReview(
            item_id=item_id,
            reviewer_id=user.id,
            purchase_id=purchase_id,
            rating=review_data["rating"],
            title=review_data.get("title"),
            comment=review_data["comment"],
            is_verified_purchase=True
        )
        
        db.add(review)
        
        # Update item rating
        result = await db.execute(
            select(
                func.avg(MarketplaceReview.rating).label("avg_rating"),
                func.count(MarketplaceReview.id).label("count")
            ).where(
                and_(
                    MarketplaceReview.item_id == item_id,
                    MarketplaceReview.is_hidden == False
                )
            )
        )
        stats = result.first()
        
        item = await db.get(MarketplaceItem, item_id)
        item.rating_average = Decimal(str(stats.avg_rating or 0)).quantize(Decimal("0.01"))
        item.rating_count = stats.count or 0
        
        await db.commit()
        await db.refresh(review)
        
        logger.info(f"Created review: {review.id} for item: {item_id}")
        return review
    
    async def get_top_categories(
        self,
        db: AsyncSession,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get top categories by item count"""
        result = await db.execute(
            select(
                MarketplaceCategory.name,
                MarketplaceCategory.slug,
                MarketplaceCategory.icon,
                func.count(MarketplaceItem.id).label("item_count")
            )
            .join(MarketplaceItem.categories)
            .where(MarketplaceItem.status == MarketplaceItemStatus.PUBLISHED.value)
            .group_by(MarketplaceCategory.id)
            .order_by(desc("item_count"))
            .limit(limit)
        )
        
        return [
            {
                "name": row.name,
                "slug": row.slug,
                "icon": row.icon,
                "item_count": row.item_count
            }
            for row in result
        ]
    
    async def get_trending_items(
        self,
        db: AsyncSession,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get trending marketplace items"""
        # Simple trending algorithm: recent installs weighted by rating
        result = await db.execute(
            select(MarketplaceItem)
            .where(MarketplaceItem.status == MarketplaceItemStatus.PUBLISHED.value)
            .order_by(
                desc(
                    MarketplaceItem.install_count * 
                    (MarketplaceItem.rating_average + 1)
                )
            )
            .limit(limit)
        )
        
        items = result.scalars().all()
        
        return [
            {
                "id": str(item.id),
                "name": item.name,
                "slug": item.slug,
                "thumbnail_url": item.thumbnail_url,
                "rating_average": float(item.rating_average),
                "install_count": item.install_count
            }
            for item in items
        ]
    
    async def _generate_unique_slug(
        self,
        db: AsyncSession,
        tenant_id: str,
        base_slug: str
    ) -> str:
        """Generate unique slug for marketplace item"""
        slug = base_slug
        counter = 1
        
        while True:
            result = await db.execute(
                select(MarketplaceItem).where(
                    and_(
                        MarketplaceItem.tenant_id == tenant_id,
                        MarketplaceItem.slug == slug
                    )
                )
            )
            if not result.scalar_one_or_none():
                return slug
            
            slug = f"{base_slug}-{counter}"
            counter += 1
    
    def _generate_license_key(self, item_id: str, user_id: str) -> str:
        """Generate license key for purchase"""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = secrets.token_hex(4).upper()
        return f"CK-{item_id[:8].upper()}-{user_id[:8].upper()}-{timestamp}-{random_part}"
    
    async def _track_purchase_analytics(
        self,
        db: AsyncSession,
        item_id: str
    ):
        """Track purchase in analytics"""
        today = datetime.utcnow().date()
        
        # Get or create today's analytics record
        result = await db.execute(
            select(MarketplaceAnalytics).where(
                and_(
                    MarketplaceAnalytics.item_id == item_id,
                    func.date(MarketplaceAnalytics.date) == today
                )
            )
        )
        analytics = result.scalar_one_or_none()
        
        if not analytics:
            analytics = MarketplaceAnalytics(
                item_id=item_id,
                date=datetime.utcnow()
            )
            db.add(analytics)
        
        analytics.installs += 1
        
        await db.commit()
