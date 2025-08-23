# 🏦 Stripe Integration Setup Guide

## Overview
CodexOS marketplace now includes complete Stripe payment integration for processing purchases, subscriptions, and revenue sharing with sellers.

## 🔑 Required Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_API_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 🚀 Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification
3. Switch to test mode for development

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure Webhooks
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/v1/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### 4. Enable Stripe Connect
1. Go to **Connect > Settings**
2. Enable **Connect** if not already enabled
3. Configure your marketplace settings

## 🧪 Testing

### Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Mode
- All transactions are in test mode
- No real charges will be made
- Use test API keys for development

## 🔒 Production Checklist

Before going live:
- [ ] Switch to live API keys
- [ ] Update webhook URLs to production domain
- [ ] Complete Stripe business verification
- [ ] Test complete payment flow
- [ ] Verify webhook signatures
- [ ] Set up monitoring and alerts

## 📱 Frontend Integration

The marketplace now includes:
- ✅ Purchase buttons with Stripe Checkout
- ✅ Success/failure handling
- ✅ Purchase confirmation pages
- ✅ Integration with user dashboard

## 🔄 Backend Features

- ✅ Stripe Checkout session creation
- ✅ Webhook handling for all events
- ✅ Purchase and subscription management
- ✅ Revenue sharing with sellers
- ✅ Stripe Connect for marketplace sellers

## 🚨 Troubleshooting

### Common Issues
1. **Webhook signature verification fails**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Verify webhook URL is accessible

2. **Payment fails**
   - Check Stripe dashboard for error details
   - Verify API keys are correct
   - Check account status and verification

3. **Connect accounts not working**
   - Ensure Stripe Connect is enabled
   - Check account verification status
   - Verify webhook events are configured

## 📞 Support

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **CodexOS Support**: support@codexos.dev
- **Documentation**: [stripe.com/docs](https://stripe.com/docs)
