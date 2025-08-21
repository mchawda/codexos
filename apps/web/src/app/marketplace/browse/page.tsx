// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Download,
  DollarSign,
  Tag,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface MarketplaceItem {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  item_type: string;
  pricing_model: string;
  price: number;
  rating_average: number;
  rating_count: number;
  install_count: number;
  thumbnail_url: string;
  seller: {
    id: string;
    username: string;
    avatar_url: string;
  };
  categories: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  item_count: number;
}

export default function MarketplaceBrowsePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories([
        { id: '1', name: 'Customer Service', slug: 'customer-service', icon: '💬', item_count: 45 },
        { id: '2', name: 'Data Analysis', slug: 'data-analysis', icon: '📊', item_count: 38 },
        { id: '3', name: 'Content Creation', slug: 'content-creation', icon: '✍️', item_count: 52 },
        { id: '4', name: 'DevOps', slug: 'devops', icon: '🔧', item_count: 29 },
        { id: '5', name: 'Marketing', slug: 'marketing', icon: '📈', item_count: 41 },
      ]);

      setItems([
        {
          id: '1',
          name: 'AI Customer Support Agent',
          slug: 'ai-customer-support',
          short_description: 'Intelligent customer support automation with sentiment analysis',
          item_type: 'agent_template',
          pricing_model: 'subscription',
          price: 29.99,
          rating_average: 4.8,
          rating_count: 156,
          install_count: 1234,
          thumbnail_url: 'https://via.placeholder.com/400x300',
          seller: {
            id: '1',
            username: 'techpro',
            avatar_url: 'https://via.placeholder.com/100',
          },
          categories: ['customer-service'],
        },
        {
          id: '2',
          name: 'Data Pipeline Orchestrator',
          slug: 'data-pipeline',
          short_description: 'Complete ETL pipeline with monitoring and error handling',
          item_type: 'workflow',
          pricing_model: 'one_time',
          price: 99.99,
          rating_average: 4.9,
          rating_count: 89,
          install_count: 567,
          thumbnail_url: 'https://via.placeholder.com/400x300',
          seller: {
            id: '2',
            username: 'datamaster',
            avatar_url: 'https://via.placeholder.com/100',
          },
          categories: ['data-analysis', 'devops'],
        },
        {
          id: '3',
          name: 'Content Writer Pro',
          slug: 'content-writer-pro',
          short_description: 'Advanced content generation with SEO optimization',
          item_type: 'agent_template',
          pricing_model: 'free',
          price: 0,
          rating_average: 4.6,
          rating_count: 234,
          install_count: 3456,
          thumbnail_url: 'https://via.placeholder.com/400x300',
          seller: {
            id: '3',
            username: 'contentking',
            avatar_url: 'https://via.placeholder.com/100',
          },
          categories: ['content-creation', 'marketing'],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleItemClick = (item: MarketplaceItem) => {
    router.push(`/marketplace/item/${item.slug}`);
  };

  const getPricingBadge = (item: MarketplaceItem) => {
    if (item.pricing_model === 'free') {
      return <Badge variant="secondary">Free</Badge>;
    } else if (item.pricing_model === 'subscription') {
      return <Badge variant="default">${item.price}/mo</Badge>;
    } else {
      return <Badge variant="default">${item.price}</Badge>;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'agent_template':
        return <Sparkles className="w-4 h-4" />;
      case 'workflow':
        return <TrendingUp className="w-4 h-4" />;
      case 'tool_integration':
        return <Shield className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-44 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Discover and share AI agent templates, workflows, and tools
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search marketplace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.name} ({cat.item_count})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading marketplace...</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => handleItemClick(item)}
                className="cursor-pointer"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={item.thumbnail_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getPricingBadge(item)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center gap-2 text-white">
                        {getItemTypeIcon(item.item_type)}
                        <span className="text-sm capitalize">
                          {item.item_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{item.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{item.rating_average}</span>
                        <span className="text-sm text-muted-foreground">
                          ({item.rating_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download className="w-4 h-4" />
                        {item.install_count}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={item.seller.avatar_url}
                        alt={item.seller.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        by {item.seller.username}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleItemClick(item)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={item.thumbnail_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                            <p className="text-muted-foreground mb-3">
                              {item.short_description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPricingBadge(item)}
                            <Button size="sm">
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{item.rating_average}</span>
                            <span className="text-muted-foreground">
                              ({item.rating_count} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Download className="w-4 h-4" />
                            {item.install_count} installs
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={item.seller.avatar_url}
                              alt={item.seller.username}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-muted-foreground">
                              by {item.seller.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getItemTypeIcon(item.item_type)}
                            <span className="capitalize">
                              {item.item_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
