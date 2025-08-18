'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Download,
  Star,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarketplaceItem {
  id: string;
  name: string;
  status: 'draft' | 'pending_review' | 'published' | 'suspended';
  price: number;
  pricing_model: string;
  views: number;
  installs: number;
  revenue: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

const mockItems: MarketplaceItem[] = [
  {
    id: '1',
    name: 'AI Customer Support Agent',
    status: 'published',
    price: 29.99,
    pricing_model: 'subscription',
    views: 5234,
    installs: 1234,
    revenue: 36986.66,
    rating: 4.8,
    created_at: '2024-01-15',
    updated_at: '2024-02-20',
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    status: 'published',
    price: 0,
    pricing_model: 'free',
    views: 8932,
    installs: 3456,
    revenue: 0,
    rating: 4.6,
    created_at: '2024-01-20',
    updated_at: '2024-02-18',
  },
  {
    id: '3',
    name: 'Data Pipeline Orchestrator',
    status: 'draft',
    price: 99.99,
    pricing_model: 'one_time',
    views: 0,
    installs: 0,
    revenue: 0,
    rating: 0,
    created_at: '2024-02-25',
    updated_at: '2024-02-25',
  },
  {
    id: '4',
    name: 'Security Scanner Pro',
    status: 'pending_review',
    price: 49.99,
    pricing_model: 'subscription',
    views: 123,
    installs: 0,
    revenue: 0,
    rating: 0,
    created_at: '2024-02-24',
    updated_at: '2024-02-24',
  },
];

export default function MarketplaceSellerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [items] = useState<MarketplaceItem[]>(mockItems);

  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const totalInstalls = items.reduce((sum, item) => sum + item.installs, 0);
  const totalViews = items.reduce((sum, item) => sum + item.views, 0);
  const publishedItems = items.filter((item) => item.status === 'published').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', label: 'Draft' },
      pending_review: { variant: 'outline', label: 'Under Review' },
      published: { variant: 'default', label: 'Published' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your marketplace listings and track performance
          </p>
        </div>
        <Link href="/dashboard/marketplace/publish">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedItems}</div>
            <p className="text-xs text-muted-foreground">
              {items.length - publishedItems} drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">My Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Installs</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Updated {item.updated_at}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.pricing_model === 'free' ? (
                        <span className="text-green-500">Free</span>
                      ) : item.pricing_model === 'subscription' ? (
                        <span>${item.price}/mo</span>
                      ) : (
                        <span>${item.price}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.views.toLocaleString()}</TableCell>
                    <TableCell>{item.installs.toLocaleString()}</TableCell>
                    <TableCell>${item.revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span>{item.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          {item.status === 'published' ? (
                            <DropdownMenuItem>
                              <PauseCircle className="w-4 h-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : item.status === 'draft' ? (
                            <DropdownMenuItem>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track your marketplace performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p>Analytics charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Your marketplace revenue and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">$0.00</div>
                      <p className="text-sm text-muted-foreground">Pending Payout</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">$29,589.33</div>
                      <p className="text-sm text-muted-foreground">Paid Out</p>
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Tax Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                Manage and respond to customer feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-muted-foreground">
                <Star className="w-16 h-16 mx-auto mb-4" />
                <p>No reviews yet</p>
                <p className="text-sm">Reviews will appear here once customers start rating your items</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
