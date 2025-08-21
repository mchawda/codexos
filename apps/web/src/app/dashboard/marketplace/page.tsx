// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Download, 
  Star,
  TrendingUp,
  Search,
  Filter,
  Package,
  Zap,
  Shield,
  Code,
  Brain,
  Globe,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Heart,
  MessageSquare,
  GitBranch,
  DollarSign
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  category: 'agent' | 'tool' | 'integration' | 'template';
  price: number | 'free';
  rating: number;
  reviews: number;
  downloads: number;
  lastUpdated: string;
  version: string;
  verified: boolean;
  trending: boolean;
  tags: string[];
  compatibility: string[];
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');

  const marketplaceItems: MarketplaceItem[] = [
    {
      id: '1',
      name: 'Advanced Code Reviewer',
      description: 'AI-powered code review agent with support for 15+ languages and security scanning',
      author: 'CodexOS Team',
      category: 'agent',
      price: 'free',
      rating: 4.9,
      reviews: 247,
      downloads: 12450,
      lastUpdated: '2 days ago',
      version: 'v3.2.1',
      verified: true,
      trending: true,
      tags: ['code-review', 'security', 'ai', 'multi-language'],
      compatibility: ['CodexOS 1.0+', 'Node.js 18+']
    },
    {
      id: '2',
      name: 'Slack Integration Plus',
      description: 'Enterprise-grade Slack integration with advanced notification routing and custom workflows',
      author: 'IntegrationPro',
      category: 'integration',
      price: 49,
      rating: 4.7,
      reviews: 89,
      downloads: 3567,
      lastUpdated: '1 week ago',
      version: 'v2.0.0',
      verified: true,
      trending: false,
      tags: ['slack', 'notifications', 'enterprise', 'communication'],
      compatibility: ['CodexOS 1.0+', 'Slack API v2']
    },
    {
      id: '3',
      name: 'RAG Document Processor',
      description: 'Advanced document processing tool with OCR, multi-format support, and intelligent chunking',
      author: 'DataFlow Inc',
      category: 'tool',
      price: 99,
      rating: 4.8,
      reviews: 156,
      downloads: 8923,
      lastUpdated: '3 days ago',
      version: 'v1.5.2',
      verified: true,
      trending: true,
      tags: ['rag', 'documents', 'ocr', 'pdf', 'processing'],
      compatibility: ['CodexOS 1.0+', 'ChromaDB 0.4+']
    },
    {
      id: '4',
      name: 'DevOps Automation Suite',
      description: 'Complete DevOps workflow automation with CI/CD, monitoring, and deployment agents',
      author: 'AutomateX',
      category: 'template',
      price: 199,
      rating: 4.6,
      reviews: 203,
      downloads: 5678,
      lastUpdated: '5 days ago',
      version: 'v4.1.0',
      verified: false,
      trending: false,
      tags: ['devops', 'ci/cd', 'automation', 'deployment'],
      compatibility: ['CodexOS 1.0+', 'Docker', 'Kubernetes']
    },
    {
      id: '5',
      name: 'Voice Command Interface',
      description: 'Add voice control to your agents with advanced NLP and multi-language support',
      author: 'VoiceAI Labs',
      category: 'tool',
      price: 'free',
      rating: 4.5,
      reviews: 421,
      downloads: 15678,
      lastUpdated: '1 day ago',
      version: 'v1.0.3',
      verified: true,
      trending: true,
      tags: ['voice', 'nlp', 'multimodal', 'accessibility'],
      compatibility: ['CodexOS 1.0+', 'Web Audio API']
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Package },
    { id: 'agent', name: 'Agents', icon: Brain },
    { id: 'tool', name: 'Tools', icon: Code },
    { id: 'integration', name: 'Integrations', icon: Globe },
    { id: 'template', name: 'Templates', icon: Zap }
  ];

  const filteredItems = marketplaceItems
    .filter(item => 
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // For 'recent', items are already in order
    });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and share AI agents, tools, and integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Heart className="mr-2 h-4 w-4" />
            My Favorites
          </Button>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Publish Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Items
              </p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Publishers
              </p>
              <p className="text-2xl font-bold">523</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </p>
              <p className="text-2xl font-bold">1.2M</p>
            </div>
            <Download className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Revenue Share
              </p>
              <p className="text-2xl font-bold">$45.2K</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500/20" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 glass-dark rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search marketplace..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-2 flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          <select 
            className="bg-transparent border-none outline-none text-sm pr-8"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Updated</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Marketplace Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass-dark rounded-xl p-6 hover:bg-accent/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.verified && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                  {item.trending && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">by {item.author}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {item.description}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">{item.rating}</span>
                <span className="text-xs text-muted-foreground">({item.reviews})</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.downloads.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center space-x-2">
                {item.price === 'free' ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Free
                  </Badge>
                ) : (
                  <span className="text-lg font-semibold">${item.price}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  v{item.version}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm">
                  {item.price === 'free' ? 'Install' : 'Purchase'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{item.lastUpdated}</span>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-3 w-3" />
                <GitBranch className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
