// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Rocket, 
  Award,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Code2,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const partnerTypes = [
  {
    title: 'Technology Partners',
    description: 'Integrate your technology with CodexOS to create powerful solutions',
    icon: Code2,
    benefits: [
      'API access and technical support',
      'Co-marketing opportunities',
      'Joint solution development',
      'Revenue sharing programs',
    ],
  },
  {
    title: 'Solution Partners',
    description: 'Build and deploy custom solutions on the CodexOS platform',
    icon: Rocket,
    benefits: [
      'Certified partner status',
      'Lead referral program',
      'Training and certification',
      'Partner portal access',
    ],
  },
  {
    title: 'Reseller Partners',
    description: 'Sell CodexOS to your customers and earn competitive commissions',
    icon: TrendingUp,
    benefits: [
      'Attractive commission structure',
      'Sales enablement resources',
      'Deal registration protection',
      'Dedicated partner support',
    ],
  },
];

const currentPartners = [
  { name: 'Microsoft', logo: '🏢', category: 'Technology' },
  { name: 'Google Cloud', logo: '☁️', category: 'Infrastructure' },
  { name: 'Stripe', logo: '💳', category: 'Payments' },
  { name: 'GitHub', logo: '🐙', category: 'Development' },
  { name: 'Slack', logo: '💬', category: 'Communication' },
  { name: 'Datadog', logo: '📊', category: 'Monitoring' },
];

const partnerBenefits = [
  {
    icon: Users,
    title: 'Access to 10,000+ Developers',
    description: 'Tap into our growing community of AI-forward developers',
  },
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Be recognized as a leader in AI-powered development',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Expand your market reach through our global platform',
  },
  {
    icon: Zap,
    title: 'Innovation Opportunities',
    description: 'Collaborate on cutting-edge AI agent technology',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 mb-8"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Partner with CodexOS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join our partner ecosystem and help shape the future of AI-powered development. 
            Together, we can deliver extraordinary value to developers worldwide.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <Badge className="px-4 py-2 text-sm">
              <Building2 className="w-4 h-4 mr-2" />
              50+ Partners
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              30+ Countries
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise Ready
            </Badge>
          </div>
        </motion.div>
      </section>

      {/* Partner Types */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Partnership Programs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the partnership model that best fits your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <div className="p-8 rounded-2xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 mb-6">
                    <type.icon className="w-8 h-8 text-violet-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
                  <p className="text-muted-foreground mb-6">{type.description}</p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {type.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Our Partners</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trusted by leading technology companies worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {currentPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="text-center"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className="text-4xl mb-3">{partner.logo}</div>
                  <h4 className="font-medium text-sm">{partner.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{partner.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Why Partner with CodexOS?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join a thriving ecosystem and unlock new growth opportunities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Partner Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how our partners are driving innovation and growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Partnering with CodexOS has accelerated our AI development capabilities and opened new market opportunities.",
                author: "Sarah Johnson",
                role: "VP of Partnerships, TechCorp",
                metric: "300% ROI",
                metricLabel: "in first year",
              },
              {
                quote: "The CodexOS partner program provided us with the tools and support needed to deliver AI solutions to our enterprise clients.",
                author: "Michael Chen",
                role: "CEO, AI Solutions Inc",
                metric: "50+ Projects",
                metricLabel: "delivered",
              },
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-white/10 glass-dark"
              >
                <div className="mb-6">
                  <p className="text-lg italic mb-6">"{story.quote}"</p>
                  <div>
                    <p className="font-semibold">{story.author}</p>
                    <p className="text-sm text-muted-foreground">{story.role}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-3xl font-bold text-violet-400">{story.metric}</p>
                  <p className="text-sm text-muted-foreground">{story.metricLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Become a Partner</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Ready to join our partner ecosystem? Tell us about your company and partnership goals.
          </p>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="john@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Partnership Type</label>
              <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors">
                <option value="">Select partnership type</option>
                <option value="technology">Technology Partner</option>
                <option value="solution">Solution Partner</option>
                <option value="reseller">Reseller Partner</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tell us about your partnership goals</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors resize-none"
                placeholder="Describe how you'd like to partner with CodexOS..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Submit Application
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl p-12 glass-dark border border-white/10">
            <div className="absolute inset-0 gradient-mesh opacity-20" />
            
            <div className="relative z-10 text-center">
              <TrendingUp className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Let's Grow Together
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Have questions about our partner program? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Schedule a Call
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Download Partner Guide
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
