'use client';

import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageSquare,
  Zap,
  Shield,
  Code2,
  Settings,
  CreditCard,
  Users,
  ChevronRight,
  FileText,
  Video,
  Headphones
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const helpCategories = [
  {
    icon: Zap,
    title: 'Getting Started',
    description: 'Learn the basics and get up and running quickly',
    articles: 23,
    popular: [
      'Quick Start Guide',
      'Creating Your First Agent',
      'Understanding the Flow Editor',
      'Connecting to External Services',
    ],
  },
  {
    icon: Code2,
    title: 'Agent Development',
    description: 'Build powerful autonomous agents',
    articles: 45,
    popular: [
      'Node Types and Usage',
      'Debugging Agent Flows',
      'Best Practices for Agent Design',
      'Performance Optimization',
    ],
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Keep your data and agents secure',
    articles: 18,
    popular: [
      'Security Best Practices',
      'Managing API Keys',
      'Role-Based Access Control',
      'Compliance Guidelines',
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing & Payments',
    description: 'Manage your subscription and billing',
    articles: 12,
    popular: [
      'Understanding Pricing Plans',
      'Managing Your Subscription',
      'Payment Methods',
      'Invoices and Receipts',
    ],
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Configure your account and preferences',
    articles: 15,
    popular: [
      'Account Settings Overview',
      'Team Management',
      'Notification Preferences',
      'API Configuration',
    ],
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work effectively with your team',
    articles: 20,
    popular: [
      'Inviting Team Members',
      'Setting Permissions',
      'Sharing Agents',
      'Collaboration Best Practices',
    ],
  },
];

const popularArticles = [
  {
    title: 'How to Create Your First AI Agent',
    category: 'Getting Started',
    readTime: '5 min',
    views: '12.3k',
  },
  {
    title: 'Understanding RAG and Knowledge Bases',
    category: 'Agent Development',
    readTime: '8 min',
    views: '8.7k',
  },
  {
    title: 'Debugging Common Agent Errors',
    category: 'Troubleshooting',
    readTime: '6 min',
    views: '7.2k',
  },
  {
    title: 'Setting Up Team Permissions',
    category: 'Team Collaboration',
    readTime: '4 min',
    views: '5.4k',
  },
];

const supportChannels = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    availability: 'Available 9am-6pm PST',
    action: 'Start Chat',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Comprehensive guides and API reference',
    availability: 'Always available',
    action: 'Browse Docs',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    availability: '50+ tutorials',
    action: 'Watch Now',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Dedicated support for Enterprise',
    availability: '24/7 availability',
    action: 'Contact Us',
  },
];

export default function HelpCenterPage() {
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
            <HelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Find answers, learn best practices, and get the support you need to succeed with CodexOS.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for articles, guides, and more..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors text-lg"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">Popular Articles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">
                        {article.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-violet-400 transition-colors mt-0.5" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span>{article.readTime} read</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-xl text-muted-foreground">
              Find help organized by topic
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20">
                      <category.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    {category.popular.slice(0, 3).map((article, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-white/30" />
                        <span className="text-white/60 hover:text-white transition-colors">
                          {article}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    View all →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-xl text-muted-foreground">
              Choose the support channel that works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <channel.icon className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 flex-1">{channel.description}</p>
                  <p className="text-xs text-violet-400 mb-4">{channel.availability}</p>
                  <button className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300 text-sm">
                    {channel.action}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {[
                {
                  question: 'How do I get started with CodexOS?',
                  answer: 'Getting started is easy! Sign up for a free account, follow our quick start guide, and create your first AI agent in minutes.',
                },
                {
                  question: 'What programming languages does CodexOS support?',
                  answer: 'CodexOS supports all major programming languages including Python, JavaScript, TypeScript, Go, Java, and more through our universal agent system.',
                },
                {
                  question: 'Can I use my own AI models?',
                  answer: 'Yes! CodexOS supports custom model integration. You can bring your own models or use our pre-configured options.',
                },
                {
                  question: 'Is my data secure?',
                  answer: 'Absolutely. We use enterprise-grade encryption, SOC2 compliance, and follow security best practices to keep your data safe.',
                },
                {
                  question: 'What kind of support is available?',
                  answer: 'We offer multiple support channels including documentation, community forums, live chat, and priority support for enterprise customers.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 rounded-xl border border-white/10 glass-dark"
                >
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
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
              <Book className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our support team is ready to help you succeed with CodexOS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Contact Support
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
