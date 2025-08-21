// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Download,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Code,
  GitBranch,
  Globe,
  Heart,
  Share2,
  Flag,
  ChevronRight,
  Play,
  Lock,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  reviewer: {
    name: string;
    avatar: string;
  };
  date: string;
  helpful: number;
}

export default function MarketplaceItemPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  // Mock data - in real app, fetch based on slug
  const item = {
    id: '1',
    name: 'AI Customer Support Agent',
    slug: 'ai-customer-support',
    short_description: 'Intelligent customer support automation with sentiment analysis',
    long_description: `Transform your customer support with our advanced AI agent. This comprehensive solution includes:

• **Sentiment Analysis**: Real-time emotion detection to prioritize and route tickets
• **Multi-language Support**: Handles 25+ languages with native-level accuracy
• **Smart Routing**: Automatically assigns tickets to the right department
• **Knowledge Base Integration**: Learns from your existing documentation
• **Custom Training**: Fine-tune responses based on your brand voice

Perfect for SaaS companies, e-commerce platforms, and any business looking to scale their support operations efficiently.`,
    version: '2.3.1',
    item_type: 'agent_template',
    pricing_model: 'subscription',
    price: 29.99,
    currency: 'USD',
    rating_average: 4.8,
    rating_count: 156,
    install_count: 1234,
    view_count: 5678,
    thumbnail_url: 'https://via.placeholder.com/800x600',
    preview_images: [
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
    ],
    demo_video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    features: [
      'Real-time sentiment analysis',
      'Multi-language support (25+ languages)',
      'Smart ticket routing',
      'Knowledge base integration',
      'Custom training capabilities',
      'Analytics dashboard',
      'API access',
      'Webhook support',
    ],
    requirements: {
      'Node.js': '>=16.0.0',
      'Memory': '4GB RAM minimum',
      'Storage': '10GB available space',
      'API Keys': 'OpenAI API key required',
    },
    tags: ['customer-service', 'ai', 'automation', 'nlp', 'sentiment-analysis'],
    seller: {
      id: '1',
      username: 'techpro',
      full_name: 'TechPro Solutions',
      avatar_url: 'https://via.placeholder.com/100',
      verified: true,
      items_count: 23,
      total_sales: 4567,
      rating: 4.9,
    },
    published_at: '2024-01-15',
    last_updated: '2024-02-20',
    documentation_url: 'https://docs.example.com',
    support_email: 'support@techpro.com',
    has_free_trial: true,
    trial_days: 14,
    demo_available: true,
  };

  const reviews: Review[] = [
    {
      id: '1',
      rating: 5,
      title: 'Game changer for our support team',
      comment: 'This AI agent has reduced our response time by 80%. The sentiment analysis is incredibly accurate.',
      reviewer: {
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/50',
      },
      date: '2024-02-15',
      helpful: 23,
    },
    {
      id: '2',
      rating: 4,
      title: 'Great tool with minor issues',
      comment: 'Works well overall. Had some initial setup challenges but support was helpful.',
      reviewer: {
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/50',
      },
      date: '2024-02-10',
      helpful: 15,
    },
  ];

  const ratingDistribution = {
    5: 65,
    4: 25,
    3: 7,
    2: 2,
    1: 1,
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {item.short_description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={liked ? 'w-5 h-5 fill-current' : 'w-5 h-5'} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Seller info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar>
                  <AvatarImage src={item.seller.avatar_url} />
                  <AvatarFallback>{item.seller.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.seller.full_name}</span>
                    {item.seller.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.seller.items_count} items</span>
                    <span>{item.seller.total_sales} sales</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span>{item.seller.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
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
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Updated {item.last_updated}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Code className="w-4 h-4" />
                  Version {item.version}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                {item.demo_video_url ? (
                  <iframe
                    src={item.demo_video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={item.thumbnail_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {item.preview_images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.long_description.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div className="grid gap-3">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <div className="space-y-4">
                  {Object.entries(item.requirements).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">{key}</div>
                        <div className="text-sm text-muted-foreground">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-4xl font-bold">{item.rating_average}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(item.rating_average)
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.rating_count} reviews
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          {Object.entries(ratingDistribution)
                            .reverse()
                            .map(([rating, percentage]) => (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-3">{rating}</span>
                                <Progress value={percentage} className="flex-1" />
                                <span className="text-sm text-muted-foreground w-10">
                                  {percentage}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.reviewer.avatar} />
                              <AvatarFallback>
                                {review.reviewer.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {review.reviewer.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating
                                          ? 'fill-yellow-500 text-yellow-500'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <h4 className="font-medium mb-1">{review.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {review.comment}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{review.date}</span>
                                <button className="hover:text-foreground">
                                  Helpful ({review.helpful})
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div>
                    {item.pricing_model === 'subscription' ? (
                      <>
                        <span className="text-3xl font-bold">${item.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : item.pricing_model === 'free' ? (
                      <span className="text-3xl font-bold text-green-500">Free</span>
                    ) : (
                      <span className="text-3xl font-bold">${item.price}</span>
                    )}
                  </div>
                  {item.has_free_trial && (
                    <Badge variant="secondary">
                      {item.trial_days} day trial
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  {item.pricing_model === 'free' ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Install Now
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>
                {item.demo_available && (
                  <Button variant="outline" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Premium support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={item.documentation_url}
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span>Documentation</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href={`mailto:${item.support_email}`}
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span>Email Support</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
                <Link
                  href="/community"
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span>Community Forum</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* More from Seller */}
            <Card>
              <CardHeader>
                <CardTitle>More from {item.seller.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View All Items
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
