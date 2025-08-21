// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X,
  Sparkles,
  Zap,
  Shield,
  Building,
  Users,
  Cpu,
  Database,
  Lock,
  Globe,
  HeartHandshake,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download
} from 'lucide-react';
import Navigation from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual developers',
    price: 0,
    priceLabel: 'Free forever',
    popular: false,
    features: [
      { text: 'Up to 3 active agents', included: true },
      { text: '1,000 agent executions/month', included: true },
      { text: 'Basic RAG with 100MB storage', included: true },
      { text: 'Community support', included: true },
      { text: 'Access to free marketplace agents', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Custom tools', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced security features', included: false },
      { text: 'Team collaboration', included: false }
    ]
  },
  {
    name: 'Professional',
    description: 'For growing teams and projects',
    price: 49,
    priceLabel: 'per user/month',
    popular: true,
    features: [
      { text: 'Unlimited active agents', included: true },
      { text: '50,000 agent executions/month', included: true },
      { text: 'Advanced RAG with 10GB storage', included: true },
      { text: 'Priority email support', included: true },
      { text: 'All marketplace agents', included: true },
      { text: 'Advanced analytics & monitoring', included: true },
      { text: 'Custom tools & integrations', included: true },
      { text: 'API access (100K calls/month)', included: true },
      { text: 'Team collaboration (up to 10)', included: true },
      { text: 'Role-based access control', included: true }
    ]
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: null,
    priceLabel: 'Custom pricing',
    popular: false,
    features: [
      { text: 'Unlimited everything', included: true },
      { text: 'Dedicated infrastructure', included: true },
      { text: 'Enterprise RAG with unlimited storage', included: true },
      { text: '24/7 phone & Slack support', included: true },
      { text: 'Private marketplace access', included: true },
      { text: 'Custom AI model fine-tuning', included: true },
      { text: 'SOC2 & ISO 27001 compliance', included: true },
      { text: 'Single Sign-On (SSO)', included: true },
      { text: 'Custom SLA', included: true },
      { text: 'Dedicated success manager', included: true }
    ]
  }
];

const faqs = [
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged a prorated amount for the remainder of your billing cycle. When downgrading, you\'ll receive credits for the unused portion.'
  },
  {
    question: 'What happens if I exceed my execution limits?',
    answer: 'We\'ll notify you when you reach 80% of your limit. You can either upgrade your plan or purchase additional execution packs. Your agents won\'t stop working - we\'ll help you find the right solution.'
  },
  {
    question: 'Do you offer educational or non-profit discounts?',
    answer: 'Yes! We offer 50% discounts for educational institutions and verified non-profits. Contact our sales team with proof of eligibility to get started.'
  },
  {
    question: 'Can I self-host CodexOS?',
    answer: 'Self-hosting is available for Professional and Enterprise plans. You\'ll get access to our Docker images and deployment guides. Enterprise customers also receive dedicated deployment support.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH transfers, and wire transfers for annual contracts. Enterprise customers can also pay via invoice with NET 30 terms.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required. You\'ll have full access to all features during the trial period.'
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (basePrice: number | null) => {
    if (basePrice === null) return null;
    if (basePrice === 0) return 0;
    return billingPeriod === 'annual' ? Math.floor(basePrice * 0.8) : basePrice;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-44 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <div className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground border-border/50 mb-4 px-4 py-1 text-sm">
            <DollarSign className="w-3 h-3 mr-1" />
            Save 20% with annual billing
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, no surprises.
            Cancel anytime with no questions asked.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingPeriod === 'annual' ? 'font-semibold' : 'text-muted-foreground'}>
              Annual
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass-dark rounded-2xl p-8 relative ${
                  plan.popular ? 'border-2 border-violet-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline mb-6">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">
                          ${getPrice(plan.price)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {plan.priceLabel}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">{plan.priceLabel}</span>
                    )}
                  </div>

                  <Link href={plan.price === null ? '/contact' : '/dashboard'}>
                    <Button 
                      className={`w-full ${plan.popular ? 'glow-primary' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.price === null ? 'Contact Sales' : 'Get Started'}
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start space-x-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? '' : 'text-muted-foreground/50'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-4 bg-muted/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Features</h2>
            <p className="text-muted-foreground">
              Built for scale, security, and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'SOC2 & ISO 27001', desc: 'Enterprise compliance' },
              { icon: Lock, title: 'SSO & SAML', desc: 'Seamless authentication' },
              { icon: Building, title: 'Dedicated Infrastructure', desc: 'Isolated resources' },
              { icon: HeartHandshake, title: 'SLA Guarantee', desc: '99.9% uptime' },
              { icon: Phone, title: '24/7 Support', desc: 'Phone & Slack' },
              { icon: Users, title: 'Unlimited Users', desc: 'Scale your team' },
              { icon: Cpu, title: 'Custom Models', desc: 'Fine-tune AI models' },
              { icon: Globe, title: 'Global CDN', desc: 'Low latency worldwide' }
            ].map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-dark rounded-lg p-6 text-center"
                >
                  <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 mb-4">
                    <FeatureIcon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-dark rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/5 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-dark rounded-2xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 animated-border opacity-20" />
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-violet-500" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers building the future with autonomous AI agents.
              Start free, upgrade when you need more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="glow-primary">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
