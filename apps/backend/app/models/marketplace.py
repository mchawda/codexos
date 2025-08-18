"""
Marketplace models for sharing and monetizing AI agent templates
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Numeric, Index, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.base import Base, TimestampMixin


class MarketplaceItemStatus(str, Enum):
    """Marketplace item status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class MarketplaceItemType(str, Enum):
    """Types of marketplace items"""
    AGENT_TEMPLATE = "agent_template"
    WORKFLOW = "workflow"
    TOOL_INTEGRATION = "tool_integration"
    PROMPT_PACK = "prompt_pack"
    DATASET = "dataset"


class PricingModel(str, Enum):
    """Pricing models for marketplace items"""
    FREE = "free"
    ONE_TIME = "one_time"
    SUBSCRIPTION = "subscription"
    PAY_PER_USE = "pay_per_use"
    FREEMIUM = "freemium"


class MarketplaceCategory(Base, TimestampMixin):
    """Categories for organizing marketplace items"""
    
    __tablename__ = "marketplace_categories"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    icon = Column(String(100))  # Icon name or URL
    parent_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_categories.id"))
    
    # Display settings
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)
    
    # Relationships
    parent = relationship("MarketplaceCategory", remote_side=[id])
    items = relationship("MarketplaceItem", secondary="marketplace_item_categories", back_populates="categories")
    
    # Statistics (denormalized for performance)
    item_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<MarketplaceCategory(name='{self.name}', slug='{self.slug}')>"


class MarketplaceItem(Base, TimestampMixin):
    """
    Main marketplace listing for AI agent templates and tools
    """
    
    __tablename__ = "marketplace_items"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic information
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    short_description = Column(String(500), nullable=False)
    long_description = Column(Text, nullable=False)
    
    # Type and status
    item_type = Column(String(50), nullable=False)
    status = Column(String(50), default=MarketplaceItemStatus.DRAFT.value)
    
    # Versioning
    version = Column(String(50), default="1.0.0")
    changelog = Column(Text)
    
    # Media
    thumbnail_url = Column(String(500))
    preview_images = Column(ARRAY(String), default=[])
    demo_video_url = Column(String(500))
    
    # Technical details
    agent_flow_id = Column(PGUUID(as_uuid=True), ForeignKey("agent_flows.id"))
    requirements = Column(JSONB, default={})  # System requirements, dependencies
    features = Column(ARRAY(String), default=[])  # Key features list
    tags = Column(ARRAY(String), default=[])  # Searchable tags
    
    # Pricing
    pricing_model = Column(String(50), default=PricingModel.FREE.value)
    price = Column(Numeric(10, 2), default=0)  # Base price in USD
    currency = Column(String(3), default="USD")
    subscription_price_monthly = Column(Numeric(10, 2))
    subscription_price_yearly = Column(Numeric(10, 2))
    usage_price_per_call = Column(Numeric(10, 4))  # For pay-per-use
    
    # Trial/Demo
    has_free_trial = Column(Boolean, default=False)
    trial_days = Column(Integer, default=0)
    demo_available = Column(Boolean, default=False)
    
    # Revenue sharing
    platform_fee_percent = Column(Numeric(5, 2), default=20.0)  # Platform takes 20%
    seller_revenue_percent = Column(Numeric(5, 2), default=80.0)
    
    # Visibility and promotion
    is_featured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False)  # Only accessible via direct link
    featured_until = Column(DateTime(timezone=True))
    
    # Statistics (denormalized for performance)
    view_count = Column(Integer, default=0)
    install_count = Column(Integer, default=0)
    rating_average = Column(Numeric(3, 2), default=0)
    rating_count = Column(Integer, default=0)
    revenue_total = Column(Numeric(12, 2), default=0)
    
    # Publishing info
    published_at = Column(DateTime(timezone=True))
    last_updated_at = Column(DateTime(timezone=True))
    review_requested_at = Column(DateTime(timezone=True))
    reviewed_at = Column(DateTime(timezone=True))
    reviewed_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    review_notes = Column(Text)
    
    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)
    
    # Support
    documentation_url = Column(String(500))
    support_email = Column(String(255))
    support_url = Column(String(500))
    
    # Relationships
    tenant = relationship("Tenant")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="marketplace_items")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    agent_flow = relationship("AgentFlow")
    categories = relationship("MarketplaceCategory", secondary="marketplace_item_categories", back_populates="items")
    purchases = relationship("MarketplacePurchase", back_populates="item")
    reviews = relationship("MarketplaceReview", back_populates="item")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'slug', name='uq_tenant_marketplace_slug'),
        CheckConstraint('price >= 0', name='check_price_positive'),
        CheckConstraint('rating_average >= 0 AND rating_average <= 5', name='check_rating_range'),
        Index('idx_marketplace_item_status_type', 'status', 'item_type'),
        Index('idx_marketplace_item_seller', 'seller_id', 'status'),
        Index('idx_marketplace_item_search', 'status', 'is_private', 'name'),
    )
    
    @hybrid_property
    def is_free(self) -> bool:
        """Check if item is free"""
        return self.pricing_model == PricingModel.FREE.value or self.price == 0
    
    def __repr__(self):
        return f"<MarketplaceItem(name='{self.name}', type='{self.item_type}', status='{self.status}')>"


# Association table for many-to-many relationship
marketplace_item_categories = Table(
    'marketplace_item_categories',
    Base.metadata,
    Column('item_id', PGUUID(as_uuid=True), ForeignKey('marketplace_items.id', ondelete='CASCADE'), primary_key=True),
    Column('category_id', PGUUID(as_uuid=True), ForeignKey('marketplace_categories.id', ondelete='CASCADE'), primary_key=True)
)


class MarketplacePurchase(Base, TimestampMixin):
    """
    Purchase transactions for marketplace items
    """
    
    __tablename__ = "marketplace_purchases"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_items.id"), nullable=False)
    buyer_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    # Purchase details
    purchase_type = Column(String(50), nullable=False)  # one_time, subscription, usage
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Payment info
    stripe_payment_intent_id = Column(String(255), unique=True)
    stripe_charge_id = Column(String(255))
    payment_method = Column(String(50))  # card, paypal, etc
    
    # Status
    status = Column(String(50), nullable=False)  # pending, completed, failed, refunded
    completed_at = Column(DateTime(timezone=True))
    
    # Subscription info (if applicable)
    subscription_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_subscriptions.id"))
    
    # License
    license_key = Column(String(255), unique=True)
    license_expires_at = Column(DateTime(timezone=True))
    
    # Revenue split
    platform_fee = Column(Numeric(10, 2))
    seller_revenue = Column(Numeric(10, 2))
    
    # Refund info
    refunded_at = Column(DateTime(timezone=True))
    refund_amount = Column(Numeric(10, 2))
    refund_reason = Column(Text)
    
    # Relationships
    item = relationship("MarketplaceItem", back_populates="purchases")
    buyer = relationship("User")
    tenant = relationship("Tenant")
    subscription = relationship("MarketplaceSubscription", back_populates="initial_purchase")
    
    # Indexes
    __table_args__ = (
        Index('idx_marketplace_purchase_buyer', 'buyer_id', 'status'),
        Index('idx_marketplace_purchase_item', 'item_id', 'status'),
    )


class MarketplaceSubscription(Base, TimestampMixin):
    """
    Subscription management for marketplace items
    """
    
    __tablename__ = "marketplace_subscriptions"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_items.id"), nullable=False)
    subscriber_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    # Stripe subscription
    stripe_subscription_id = Column(String(255), unique=True, nullable=False)
    stripe_customer_id = Column(String(255), nullable=False)
    
    # Subscription details
    status = Column(String(50), nullable=False)  # active, cancelled, expired, past_due
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    cancel_at_period_end = Column(Boolean, default=False)
    cancelled_at = Column(DateTime(timezone=True))
    
    # Billing
    billing_interval = Column(String(20), nullable=False)  # monthly, yearly
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Usage tracking (for metered billing)
    usage_this_period = Column(Integer, default=0)
    usage_limit = Column(Integer)
    
    # Relationships
    item = relationship("MarketplaceItem")
    subscriber = relationship("User")
    tenant = relationship("Tenant")
    initial_purchase = relationship("MarketplacePurchase", back_populates="subscription", uselist=False)
    
    # Indexes
    __table_args__ = (
        Index('idx_marketplace_subscription_subscriber', 'subscriber_id', 'status'),
        Index('idx_marketplace_subscription_item', 'item_id', 'status'),
    )


class MarketplaceReview(Base, TimestampMixin):
    """
    Reviews and ratings for marketplace items
    """
    
    __tablename__ = "marketplace_reviews"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_items.id"), nullable=False)
    reviewer_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    purchase_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_purchases.id"), nullable=False)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255))
    comment = Column(Text, nullable=False)
    
    # Verification
    is_verified_purchase = Column(Boolean, default=True)
    
    # Moderation
    is_flagged = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    moderated_at = Column(DateTime(timezone=True))
    moderated_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    moderation_reason = Column(Text)
    
    # Helpful votes
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    
    # Response from seller
    seller_response = Column(Text)
    seller_responded_at = Column(DateTime(timezone=True))
    
    # Relationships
    item = relationship("MarketplaceItem", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    purchase = relationship("MarketplacePurchase")
    moderator = relationship("User", foreign_keys=[moderated_by])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('item_id', 'reviewer_id', name='uq_item_reviewer'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_review_rating'),
        Index('idx_marketplace_review_item', 'item_id', 'is_hidden'),
    )


class MarketplaceAnalytics(Base):
    """
    Analytics tracking for marketplace items
    """
    
    __tablename__ = "marketplace_analytics"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PGUUID(as_uuid=True), ForeignKey("marketplace_items.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Metrics
    views = Column(Integer, default=0)
    unique_viewers = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    installs = Column(Integer, default=0)
    revenue = Column(Numeric(10, 2), default=0)
    
    # Traffic sources
    traffic_sources = Column(JSONB, default={})  # {search: 10, direct: 5, etc}
    
    # Conversion funnel
    conversion_view_to_click = Column(Numeric(5, 2))
    conversion_click_to_install = Column(Numeric(5, 2))
    
    # Relationships
    item = relationship("MarketplaceItem")
    
    # Indexes
    __table_args__ = (
        UniqueConstraint('item_id', 'date', name='uq_item_date_analytics'),
        Index('idx_marketplace_analytics_date', 'date'),
    )
