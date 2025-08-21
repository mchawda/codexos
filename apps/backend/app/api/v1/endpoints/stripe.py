# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Stripe webhook and payment endpoints
"""

import stripe
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import settings
from app.services.stripe_service import stripe_service
from app.core.monitoring import track_marketplace_transaction

router = APIRouter()

# Set Stripe API key
stripe.api_key = settings.STRIPE_API_KEY


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Stripe webhook events"""
    # Get the webhook payload and signature
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        # Invalid payload
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )
    
    # Handle the event
    try:
        if event['type'] == 'checkout.session.completed':
            # Payment successful, fulfill purchase
            session = event['data']['object']
            await stripe_service.handle_checkout_complete(db, session)
            track_marketplace_transaction("checkout", "completed")
            
        elif event['type'] == 'customer.subscription.created':
            # New subscription created
            subscription = event['data']['object']
            await stripe_service.handle_subscription_update(db, subscription)
            track_marketplace_transaction("subscription", "created")
            
        elif event['type'] == 'customer.subscription.updated':
            # Subscription updated (renewal, plan change, etc.)
            subscription = event['data']['object']
            await stripe_service.handle_subscription_update(db, subscription)
            track_marketplace_transaction("subscription", "updated")
            
        elif event['type'] == 'customer.subscription.deleted':
            # Subscription cancelled
            subscription = event['data']['object']
            subscription.status = 'cancelled'  # Override status
            await stripe_service.handle_subscription_update(db, subscription)
            track_marketplace_transaction("subscription", "cancelled")
            
        elif event['type'] == 'invoice.payment_succeeded':
            # Subscription payment successful
            invoice = event['data']['object']
            # Log successful payment
            track_marketplace_transaction("subscription_payment", "succeeded")
            
        elif event['type'] == 'invoice.payment_failed':
            # Subscription payment failed
            invoice = event['data']['object']
            # TODO: Send email notification to user
            track_marketplace_transaction("subscription_payment", "failed")
            
        elif event['type'] == 'account.updated':
            # Stripe Connect account updated
            account = event['data']['object']
            # TODO: Update seller account status
            
        elif event['type'] == 'payout.paid':
            # Payout to seller successful
            payout = event['data']['object']
            track_marketplace_transaction("payout", "paid")
            
        elif event['type'] == 'payout.failed':
            # Payout to seller failed
            payout = event['data']['object']
            track_marketplace_transaction("payout", "failed")
            
        else:
            # Unhandled event type
            print(f'Unhandled event type: {event["type"]}')
        
        return {"received": True}
        
    except Exception as e:
        # Log error but return 200 to acknowledge receipt
        print(f"Error handling webhook: {e}")
        track_marketplace_transaction("webhook", "error")
        return {"received": True, "error": str(e)}


@router.post("/create-checkout-session")
async def create_checkout_session(
    item_id: str,
    success_url: str,
    cancel_url: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create Stripe checkout session for marketplace purchase"""
    # Get marketplace item
    item = await db.get(MarketplaceItem, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if item.status != MarketplaceItemStatus.PUBLISHED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item is not available for purchase"
        )
    
    # Check if user already owns this item
    existing_purchase = await db.execute(
        select(MarketplacePurchase).where(
            and_(
                MarketplacePurchase.item_id == item_id,
                MarketplacePurchase.buyer_id == current_user.id,
                MarketplacePurchase.status == "completed"
            )
        )
    )
    if existing_purchase.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already own this item"
        )
    
    # Create checkout session
    try:
        session = await stripe_service.create_checkout_session(
            db=db,
            user=current_user,
            item=item,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/create-seller-account")
async def create_seller_account(
    business_info: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create Stripe Connect account for marketplace seller"""
    # Check if user already has a seller account
    if hasattr(current_user, 'stripe_seller_account_id') and current_user.stripe_seller_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a seller account"
        )
    
    try:
        # Create Stripe Connect account
        account = await stripe_service.create_seller_account(
            db=db,
            user=current_user,
            business_info=business_info
        )
        
        # Create account link for onboarding
        account_link = await stripe_service.create_account_link(
            account_id=account.id,
            refresh_url=f"{settings.FRONTEND_URL}/dashboard/marketplace/seller/onboarding",
            return_url=f"{settings.FRONTEND_URL}/dashboard/marketplace/seller"
        )
        
        return {
            "account_id": account.id,
            "onboarding_url": account_link.url
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/seller-dashboard-url")
async def get_seller_dashboard_url(
    current_user = Depends(get_current_user)
):
    """Get Stripe Express dashboard URL for seller"""
    if not hasattr(current_user, 'stripe_seller_account_id') or not current_user.stripe_seller_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't have a seller account"
        )
    
    try:
        # Create login link
        login_link = stripe.Account.create_login_link(
            current_user.stripe_seller_account_id
        )
        
        return {"dashboard_url": login_link.url}
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


from typing import Dict, Any
from sqlalchemy import select, and_
from app.models.marketplace import MarketplaceItem, MarketplacePurchase, MarketplaceItemStatus
from app.api.deps import get_current_user
