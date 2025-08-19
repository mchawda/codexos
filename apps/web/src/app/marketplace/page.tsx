'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Search,
  Filter,
  TrendingUp,
  Star,
  Download,
  Package,
  Zap,
  Brain,
  Code,
  Globe,
  Shield,
  Users,
  DollarSign,
  ChevronRight,
  Heart,
  GitBranch,
  Clock,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const featuredAgents = [
  {
    id: 1,
    name: 'Code Review Assistant Pro',
    author: 'CodexOS Team',
    description: 'Advanced AI-powered code review with security scanning, performance analysis, and best practices enforcement',
    category: 'Development',
    price: 'Free',
    rating: 4.9,
    downloads: 15420,
    verified: true,
    trending: true,
    icon: Code,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 2,
    name: 'API Documentation Generator',
    author: 'DocuFlow Inc',
    description: 'Automatically generate comprehensive API documentation from your codebase with examples and test cases',
    category: 'Documentation',
    price: '$49/mo',
    rating: 4.8,
    downloads: 8932,
    verified: true,
    trending: false,
    icon: Globe,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    name: 'Security Vulnerability Scanner',
    author: 'SecureAI Labs',
    description: 'Enterprise-grade security scanning with OWASP compliance and automated fix suggestions',
    category: 'Security',
    price: '$99/mo',
    rating: 4.9,
    downloads: 12103,
    verified: true,
    trending: true,
    icon: Shield,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 4,
    name: 'Test Suite Generator',
    author: 'TestCraft',
    description: 'Generate comprehensive test suites with edge cases, mocks, and CI/CD integration',
    category: 'Testing',
    price: 'Free',
    rating: 4.7,
    downloads: 9876,
    verified: false,
    trending: false,
    icon: Zap,
    color: 'from-green-500 to-emerald-500'
  }
];

const categories = [
  { name: 'All', count: 2847, icon: Package },
  { name: 'Development', count: 892, icon: Code },
  { name: 'Security', count: 234, icon: Shield },
  { name: 'Documentation', count: 456, icon: Globe },
  { name: 'Testing', count: 378, icon: Zap },
  { name: 'DevOps', count: 567, icon: GitBranch },
  { name: 'AI/ML', count: 320, icon: Brain }
];

const stats = [
  { label: 'Active Agents', value: '2,847', icon: Package, color: 'text-violet-500' },
  { label: 'Developers', value: '45.2K', icon: Users, color: 'text-blue-500' },
  { label: 'Downloads', value: '1.2M', icon: Download, color: 'text-green-500' },
  { label: 'Revenue Shared', value: '$892K', icon: DollarSign, color: 'text-yellow-500' }
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
            <TrendingUp className="w-3 h-3 mr-1" />
            New agents added daily
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Agent <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover, share, and monetize AI agents. From code review to deployment automation,
            find the perfect agent for your workflow.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="glass-dark rounded-lg p-2 flex items-center">
              <Search className="w-5 h-5 text-muted-foreground ml-3" />
              <input
                type="text"
                placeholder="Search agents, tools, and integrations..."
                className="flex-1 bg-transparent px-4 py-3 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="mr-2">
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="glass-dark rounded-lg p-4"
                >
                  <StatIcon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-10 px-4 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="whitespace-nowrap"
                >
                  <CategoryIcon className="w-4 h-4 mr-2" />
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Agents</h2>
              <p className="text-muted-foreground">Hand-picked by our team</p>
            </div>
            <Link href="/marketplace/browse">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAgents.map((agent, idx) => {
              const AgentIcon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-dark rounded-xl p-6 hover:bg-accent/5 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${agent.color} bg-opacity-10`}>
                      <AgentIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {agent.trending && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">by {agent.author}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{agent.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({agent.downloads.toLocaleString()})
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {agent.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {agent.price === 'Free' ? (
                        <span className="text-green-500">Free</span>
                      ) : (
                        agent.price
                      )}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        {agent.price === 'Free' ? 'Install' : 'Subscribe'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Become a Publisher */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-dark rounded-2xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 animated-border opacity-20" />
            <Store className="w-16 h-16 mx-auto mb-6 text-violet-500" />
            <h2 className="text-3xl font-bold mb-4">Become a Publisher</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Share your AI agents with thousands of developers and earn revenue.
              We handle payments, distribution, and updates.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="glow-primary">
                  Start Publishing
                </Button>
              </Link>
              <Link href="/docs/marketplace">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
