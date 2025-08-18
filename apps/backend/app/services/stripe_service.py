"""
Stripe payment integration service
"""

import stripe
from typing import Dict, Any, Optional, List
from decimal import Decimal
from datetime import datetime
import structlog

from app.core.config import settings
from app.core.monitoring import track_marketplace_transaction
from app.models.marketplace import (
    MarketplaceItem, MarketplacePurchase, MarketplaceSubscription,
    PricingModel, MarketplaceItemStatus
)
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()

# Initialize Stripe
stripe.api_key = settings.STRIPE_API_KEY


class StripeService:
    """Service for handling Stripe payments"""
    
    async def create_payment_intent(
        self,
        amount: Decimal,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None
    ) -> stripe.PaymentIntent:
        """Create a Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True}
            )
            
            track_marketplace_transaction("payment_intent", "created")
            logger.info(f"Created payment intent: {intent.id}")
            
            return intent
            
        except stripe.error.StripeError as e:
            track_marketplace_transaction("payment_intent", "failed")
            logger.error(f"Stripe error creating payment intent: {e}")
            raise
    
    async def create_checkout_session(
        self,
        db: AsyncSession,
        user: User,
        item: MarketplaceItem,
        success_url: str,
        cancel_url: str
    ) -> stripe.checkout.Session:
        """Create a Stripe checkout session for marketplace purchase"""
        try:
            # Prepare line items based on pricing model
            line_items = []
            
            if item.pricing_model == PricingModel.ONE_TIME.value:
                line_items.append({
                    "price_data": {
                        "currency": item.currency.lower(),
                        "product_data": {
                            "name": item.name,
                            "description": item.short_description,
                            "images": [item.thumbnail_url] if item.thumbnail_url else [],
                            "metadata": {
                                "item_id": str(item.id),
                                "seller_id": str(item.seller_id)
                            }
                        },
                        "unit_amount": int(item.price * 100),
                    },
                    "quantity": 1,
                })
            
            elif item.pricing_model == PricingModel.SUBSCRIPTION.value:
                # Create or get subscription price
                price = await self._get_or_create_subscription_price(item)
                line_items.append({
                    "price": price.id,
                    "quantity": 1,
                })
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment" if item.pricing_model == PricingModel.ONE_TIME.value else "subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user.email,
                client_reference_id=str(user.id),
                metadata={
                    "item_id": str(item.id),
                    "user_id": str(user.id),
                    "seller_id": str(item.seller_id),
                    "pricing_model": item.pricing_model
                },
                payment_intent_data={
                    "application_fee_amount": int(item.price * item.platform_fee_percent / 100 * 100),
                    "transfer_data": {
                        "destination": await self._get_seller_stripe_account(db, item.seller_id)
                    }
                } if item.pricing_model == PricingModel.ONE_TIME.value else None,
                subscription_data={
                    "application_fee_percent": float(item.platform_fee_percent),
                    "transfer_data": {
                        "destination": await self._get_seller_stripe_account(db, item.seller_id)
                    },
                    "trial_period_days": item.trial_days if item.has_free_trial else None
                } if item.pricing_model == PricingModel.SUBSCRIPTION.value else None
            )
            
            track_marketplace_transaction("checkout_session", "created")
            logger.info(f"Created checkout session: {session.id}")
            
            return session
            
        except stripe.error.StripeError as e:
            track_marketplace_transaction("checkout_session", "failed")
            logger.error(f"Stripe error creating checkout session: {e}")
            raise
    
    async def handle_checkout_complete(
        self,
        db: AsyncSession,
        session: stripe.checkout.Session
    ) -> MarketplacePurchase:
        """Handle successful checkout completion"""
        metadata = session.metadata
        
        # Create purchase record
        purchase = MarketplacePurchase(
            item_id=metadata["item_id"],
            buyer_id=metadata["user_id"],
            tenant_id=(await db.get(User, metadata["user_id"])).tenant_id,
            purchase_type=metadata["pricing_model"],
            amount=Decimal(str(session.amount_total / 100)),
            currency=session.currency.upper(),
            stripe_payment_intent_id=session.payment_intent,
            stripe_charge_id=session.payment_intent,  # Will be updated later
            payment_method="card",
            status="completed",
            completed_at=datetime.utcnow(),
            license_key=self._generate_license_key(metadata["item_id"], metadata["user_id"])
        )
        
        # If subscription, create subscription record
        if metadata["pricing_model"] == PricingModel.SUBSCRIPTION.value:
            subscription = MarketplaceSubscription(
                item_id=metadata["item_id"],
                subscriber_id=metadata["user_id"],
                tenant_id=purchase.tenant_id,
                stripe_subscription_id=session.subscription,
                stripe_customer_id=session.customer,
                status="active",
                current_period_start=datetime.fromtimestamp(session.created),
                current_period_end=datetime.fromtimestamp(session.created + 30 * 24 * 60 * 60),  # Approximate
                billing_interval="monthly",  # Default, will be updated
                amount=purchase.amount
            )
            db.add(subscription)
            purchase.subscription_id = subscription.id
        
        db.add(purchase)
        
        # Update item statistics
        item = await db.get(MarketplaceItem, metadata["item_id"])
        item.install_count += 1
        item.revenue_total += purchase.seller_revenue
        
        await db.commit()
        
        track_marketplace_transaction("purchase", "completed")
        logger.info(f"Completed purchase: {purchase.id}")
        
        return purchase
    
    async def handle_subscription_update(
        self,
        db: AsyncSession,
        subscription: stripe.Subscription
    ):
        """Handle subscription updates from Stripe webhook"""
        # Find our subscription record
        db_subscription = await db.execute(
            select(MarketplaceSubscription).where(
                MarketplaceSubscription.stripe_subscription_id == subscription.id
            )
        )
        db_subscription = db_subscription.scalar_one_or_none()
        
        if not db_subscription:
            logger.warning(f"Subscription not found: {subscription.id}")
            return
        
        # Update subscription status
        db_subscription.status = subscription.status
        db_subscription.current_period_start = datetime.fromtimestamp(
            subscription.current_period_start
        )
        db_subscription.current_period_end = datetime.fromtimestamp(
            subscription.current_period_end
        )
        db_subscription.cancel_at_period_end = subscription.cancel_at_period_end
        
        if subscription.canceled_at:
            db_subscription.cancelled_at = datetime.fromtimestamp(subscription.canceled_at)
        
        await db.commit()
        
        track_marketplace_transaction("subscription", subscription.status)
        logger.info(f"Updated subscription: {db_subscription.id} to status: {subscription.status}")
    
    async def create_customer(
        self,
        user: User
    ) -> stripe.Customer:
        """Create or get Stripe customer for user"""
        # Check if user already has a Stripe customer ID
        if hasattr(user, 'stripe_customer_id') and user.stripe_customer_id:
            try:
                customer = stripe.Customer.retrieve(user.stripe_customer_id)
                return customer
            except stripe.error.StripeError:
                # Customer doesn't exist, create new one
                pass
        
        # Create new customer
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={
                "user_id": str(user.id),
                "tenant_id": str(user.tenant_id)
            }
        )
        
        # Save customer ID to user
        user.stripe_customer_id = customer.id
        
        logger.info(f"Created Stripe customer: {customer.id} for user: {user.id}")
        return customer
    
    async def create_seller_account(
        self,
        db: AsyncSession,
        user: User,
        business_info: Dict[str, Any]
    ) -> stripe.Account:
        """Create Stripe Connect account for marketplace seller"""
        try:
            account = stripe.Account.create(
                type="express",
                country=business_info.get("country", "US"),
                email=user.email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
                business_profile={
                    "name": business_info.get("business_name"),
                    "product_description": "AI Agent Templates and Tools",
                    "support_email": business_info.get("support_email", user.email),
                    "url": business_info.get("website"),
                },
                metadata={
                    "user_id": str(user.id),
                    "tenant_id": str(user.tenant_id)
                }
            )
            
            # Save account ID to user
            user.stripe_seller_account_id = account.id
            await db.commit()
            
            logger.info(f"Created Stripe Connect account: {account.id} for user: {user.id}")
            return account
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create seller account: {e}")
            raise
    
    async def create_account_link(
        self,
        account_id: str,
        refresh_url: str,
        return_url: str
    ) -> stripe.AccountLink:
        """Create account link for Stripe Connect onboarding"""
        try:
            account_link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type="account_onboarding"
            )
            
            return account_link
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create account link: {e}")
            raise
    
    async def create_payout(
        self,
        seller_account_id: str,
        amount: Decimal,
        currency: str = "usd"
    ) -> stripe.Payout:
        """Create payout to seller"""
        try:
            payout = stripe.Payout.create(
                amount=int(amount * 100),
                currency=currency,
                stripe_account=seller_account_id
            )
            
            track_marketplace_transaction("payout", "created")
            logger.info(f"Created payout: {payout.id} for amount: {amount}")
            
            return payout
            
        except stripe.error.StripeError as e:
            track_marketplace_transaction("payout", "failed")
            logger.error(f"Failed to create payout: {e}")
            raise
    
    async def _get_or_create_subscription_price(
        self,
        item: MarketplaceItem
    ) -> stripe.Price:
        """Get or create Stripe price for subscription item"""
        # Check if we already have a price ID stored
        if hasattr(item, 'stripe_price_id') and item.stripe_price_id:
            try:
                price = stripe.Price.retrieve(item.stripe_price_id)
                return price
            except stripe.error.StripeError:
                pass
        
        # Create product first
        product = stripe.Product.create(
            name=item.name,
            description=item.short_description,
            metadata={
                "item_id": str(item.id),
                "seller_id": str(item.seller_id)
            }
        )
        
        # Create price
        price = stripe.Price.create(
            product=product.id,
            unit_amount=int(item.subscription_price_monthly * 100),
            currency=item.currency.lower(),
            recurring={"interval": "month"},
            metadata={
                "item_id": str(item.id)
            }
        )
        
        # Save price ID to item
        item.stripe_price_id = price.id
        item.stripe_product_id = product.id
        
        return price
    
    async def _get_seller_stripe_account(
        self,
        db: AsyncSession,
        seller_id: str
    ) -> str:
        """Get seller's Stripe Connect account ID"""
        seller = await db.get(User, seller_id)
        
        if not hasattr(seller, 'stripe_seller_account_id') or not seller.stripe_seller_account_id:
            raise ValueError(f"Seller {seller_id} doesn't have a Stripe Connect account")
        
        return seller.stripe_seller_account_id
    
    def _generate_license_key(self, item_id: str, user_id: str) -> str:
        """Generate unique license key"""
        import secrets
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = secrets.token_hex(4).upper()
        return f"CK-{item_id[:8].upper()}-{user_id[:8].upper()}-{timestamp}-{random_part}"


# Global service instance
stripe_service = StripeService()


from sqlalchemy import select
