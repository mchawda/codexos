// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Zap, 
  Lock, 
  Play, 
  CheckCircle, 
  ChevronRight,
  CreditCard,
  Loader2
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with real API calls
const mockItem = {
  id: "agent-template-1",
  name: "Advanced Code Review Agent",
  slug: "advanced-code-review-agent",
  short_description: "AI-powered code review agent that analyzes code quality, security, and best practices",
  long_description: "This advanced code review agent uses state-of-the-art AI models to provide comprehensive code analysis. It can detect bugs, security vulnerabilities, code smells, and suggest improvements based on industry best practices. Perfect for development teams looking to maintain high code quality standards.",
  seller: {
    username: "CodeCraft Studios",
    avatar: "/avatars/seller-1.jpg",
    rating: 4.8,
    review_count: 127,
    verified: true
  },
  pricing_model: "one_time",
  price: 49.99,
  currency: "USD",
  has_free_trial: true,
  trial_days: 7,
  demo_available: true,
  status: "published",
  item_type: "agent_template",
  version: "2.1.0",
  changelog: "Added support for TypeScript, improved security analysis, enhanced performance",
  thumbnail_url: "/marketplace/code-review-agent.jpg",
  preview_images: [
    "/marketplace/code-review-agent-1.jpg",
    "/marketplace/code-review-agent-2.jpg",
    "/marketplace/code-review-agent-3.jpg"
  ],
  demo_video_url: "https://www.youtube.com/watch?v=example",
  features: [
    "Multi-language support (Python, JavaScript, TypeScript, Go, Rust)",
    "Security vulnerability detection",
    "Code quality metrics",
    "Best practices suggestions",
    "Integration with popular IDEs",
    "Custom rule configuration",
    "Team collaboration features"
  ],
  requirements: {
    "min_agents": 1,
    "supported_platforms": ["web", "desktop"],
    "api_requirements": ["openai", "anthropic"]
  },
  tags: ["code-review", "security", "quality", "ai", "development"],
  categories: ["Development", "Code Quality", "Security"],
  view_count: 15420,
  install_count: 3420,
  rating_average: 4.8,
  rating_count: 127,
  revenue_total: 171000,
  documentation_url: "/docs/code-review-agent",
  support_email: "support@codecraftstudios.com",
  support_url: "https://help.codecraftstudios.com",
  published_at: "2024-01-15T10:00:00Z",
  last_updated_at: "2024-08-20T14:30:00Z"
};

// Mock reviews
const mockReviews = [
  {
    id: 1,
    user: "DevTeam Lead",
    avatar: "/avatars/user-1.jpg",
    rating: 5,
    title: "Game changer for our code quality",
    comment: "This agent has significantly improved our code review process. It catches issues we would have missed and provides actionable suggestions.",
    date: "2 days ago",
    helpful: 12
  },
  {
    id: 2,
    user: "Senior Developer",
    avatar: "/avatars/user-2.jpg",
    rating: 4,
    title: "Great tool with room for improvement",
    comment: "Very useful for automated code review. The security analysis is particularly strong. Would love to see more language support.",
    date: "1 week ago",
    helpful: 8
  },
  {
    id: 3,
    user: "Tech Lead",
    avatar: "/avatars/user-3.jpg",
    rating: 5,
    title: "Excellent integration and performance",
    comment: "Seamlessly integrates with our existing workflow. The performance is impressive even with large codebases.",
    date: "2 weeks ago",
    helpful: 15
  }
];

export default function MarketplaceItemPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  
  const item = mockItem; // In real app, fetch by slug
  
  const handlePurchase = async () => {
    if (item.pricing_model === "free") {
      await handleInstall();
      return;
    }
    
    setIsPurchasing(true);
    try {
      // Call backend to create Stripe checkout session
      const response = await fetch('/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.id,
          success_url: `${window.location.origin}/marketplace/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/marketplace/item/${item.slug}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { checkout_url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
      
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      // Call backend to install the item
      const response = await fetch('/api/v1/marketplace/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to install item');
      }
      
      // Redirect to dashboard or show success message
      router.push('/dashboard?installed=true');
      
    } catch (error) {
      console.error('Install error:', error);
      alert('Failed to install item. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };
  
  const handleDemo = () => {
    if (item.demo_video_url) {
      window.open(item.demo_video_url, '_blank');
    } else {
      // Launch demo in new tab or modal
      window.open(`/marketplace/demo/${item.slug}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground">
              Marketplace
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/marketplace/browse?category=${item.categories[0]?.toLowerCase()}`} className="hover:text-foreground">
              {item.categories[0]}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{item.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Item Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{item.name}</h1>
                  <p className="text-xl text-muted-foreground">{item.short_description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{item.rating_average}</span>
                  <span className="text-muted-foreground">({item.rating_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{item.install_count.toLocaleString()} installs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{item.view_count.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Item Media */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={item.thumbnail_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {item.preview_images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {item.preview_images.map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${item.name} preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({item.rating_count})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-lg leading-relaxed">{item.long_description}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Feature Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.features.map((feature, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base">{feature}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Detailed description of {feature.toLowerCase()} functionality.
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Minimum Agents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{item.requirements.min_agents}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Supported Platforms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {item.requirements.supported_platforms.map((platform, index) => (
                            <Badge key={index} variant="outline">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">API Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {item.requirements.api_requirements.map((api, index) => (
                            <Badge key={index} variant="outline">
                              {api}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.user}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
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
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                  disabled={isPurchasing || isInstalling}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isInstalling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : item.pricing_model === 'free' ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Install Now
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {item.has_free_trial ? 'Start Free Trial' : 'Purchase Now'}
                    </>
                  )}
                </Button>
                {item.demo_available && (
                  <Button variant="outline" className="w-full" onClick={handleDemo}>
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
                </a>
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
