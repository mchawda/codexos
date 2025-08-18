'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Package,
  DollarSign,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const steps = [
  { id: 'basic', title: 'Basic Info', icon: Package },
  { id: 'media', title: 'Media', icon: Image },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'technical', title: 'Technical', icon: FileText },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

export default function PublishMarketplaceItem() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    itemType: 'agent_template',
    categories: [],
    tags: [],
    
    // Media
    thumbnailUrl: '',
    previewImages: [],
    demoVideoUrl: '',
    
    // Pricing
    pricingModel: 'free',
    price: 0,
    subscriptionMonthly: 0,
    subscriptionYearly: 0,
    hasFreeTrial: false,
    trialDays: 14,
    
    // Technical
    agentFlowId: '',
    features: [],
    requirements: {},
    documentationUrl: '',
    supportEmail: '',
    
    // Flags
    isDraft: true,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    // In real app, submit to API
    console.log('Submitting:', { ...formData, isDraft: !publish });
    router.push('/dashboard/marketplace/seller');
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Publish to Marketplace</h1>
          <p className="text-muted-foreground">
            Share your AI agent with the community
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center gap-2 ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : index === currentStep
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="AI Customer Support Agent"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    marketplace.codexos.dev/item/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="ai-customer-support"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  placeholder="Brief description that appears in search results (max 200 chars)"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.shortDescription.length}/200 characters
                </p>
              </div>

              <div>
                <Label htmlFor="longDescription">Full Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, longDescription: e.target.value })
                  }
                  placeholder="Detailed description of your item. Support markdown formatting."
                  rows={8}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supports markdown formatting
                </p>
              </div>

              <div>
                <Label htmlFor="itemType">Item Type *</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, itemType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent_template">Agent Template</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="tool_integration">Tool Integration</SelectItem>
                    <SelectItem value="prompt_pack">Prompt Pack</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Customer Service',
                    'Data Analysis',
                    'Content Creation',
                    'DevOps',
                    'Marketing',
                    'Security',
                  ].map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              categories: [...formData.categories, category],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              categories: formData.categories.filter(
                                (c) => c !== category
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  onBlur={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag);
                    setFormData({ ...formData, tags });
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Add tags to help users find your item
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Thumbnail Image *</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop image here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 800x600px, max 2MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Preview Images</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border-2 border-dashed rounded-lg p-4 text-center"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Screenshot {i}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="demoVideo">Demo Video URL</Label>
                <Input
                  id="demoVideo"
                  value={formData.demoVideoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, demoVideoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  YouTube or Vimeo URL
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Pricing Model *</Label>
                <RadioGroup
                  value={formData.pricingModel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pricingModel: value })
                  }
                >
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <RadioGroupItem value="free" className="mt-1" />
                      <div>
                        <div className="font-medium">Free</div>
                        <div className="text-sm text-muted-foreground">
                          No cost to users
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <RadioGroupItem value="one_time" className="mt-1" />
                      <div>
                        <div className="font-medium">One-time Purchase</div>
                        <div className="text-sm text-muted-foreground">
                          Users pay once for lifetime access
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <RadioGroupItem value="subscription" className="mt-1" />
                      <div>
                        <div className="font-medium">Subscription</div>
                        <div className="text-sm text-muted-foreground">
                          Recurring monthly or yearly payments
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {formData.pricingModel === 'one_time' && (
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) })
                      }
                      placeholder="99.99"
                      className="pl-9"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              )}

              {formData.pricingModel === 'subscription' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlyPrice">Monthly Price (USD) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="monthlyPrice"
                          type="number"
                          value={formData.subscriptionMonthly}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subscriptionMonthly: parseFloat(e.target.value),
                            })
                          }
                          placeholder="29.99"
                          className="pl-9"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="yearlyPrice">Yearly Price (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="yearlyPrice"
                          type="number"
                          value={formData.subscriptionYearly}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subscriptionYearly: parseFloat(e.target.value),
                            })
                          }
                          placeholder="299.99"
                          className="pl-9"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formData.pricingModel !== 'free' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Free Trial</div>
                      <div className="text-sm text-muted-foreground">
                        Allow users to try before buying
                      </div>
                    </div>
                    <Switch
                      checked={formData.hasFreeTrial}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasFreeTrial: checked })
                      }
                    />
                  </div>

                  {formData.hasFreeTrial && (
                    <div>
                      <Label htmlFor="trialDays">Trial Period (days)</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        value={formData.trialDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            trialDays: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        max="90"
                      />
                    </div>
                  )}

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Revenue Sharing</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            CodexOS takes a 20% platform fee. You keep 80% of all sales.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="agentFlow">Agent Flow</Label>
                <Select
                  value={formData.agentFlowId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agentFlowId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent flow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow1">Customer Support Flow v2</SelectItem>
                    <SelectItem value="flow2">Data Analysis Pipeline</SelectItem>
                    <SelectItem value="flow3">Content Generator Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Key Features</Label>
                <div className="space-y-2 mt-2">
                  <Input placeholder="Feature 1" />
                  <Input placeholder="Feature 2" />
                  <Input placeholder="Feature 3" />
                  <Button variant="outline" size="sm">
                    Add Feature
                  </Button>
                </div>
              </div>

              <div>
                <Label>System Requirements</Label>
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Requirement" />
                    <Input placeholder="Value" />
                  </div>
                  <Button variant="outline" size="sm">
                    Add Requirement
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="docs">Documentation URL</Label>
                <Input
                  id="docs"
                  value={formData.documentationUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, documentationUrl: e.target.value })
                  }
                  placeholder="https://docs.example.com"
                />
              </div>

              <div>
                <Label htmlFor="support">Support Email</Label>
                <Input
                  id="support"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                  placeholder="support@example.com"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Ready to Publish!</h2>
                <p className="text-muted-foreground">
                  Review your listing before submitting
                </p>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{formData.name || 'Untitled'}</CardTitle>
                    <CardDescription>
                      {formData.shortDescription || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{' '}
                        {formData.itemType.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pricing:</span>{' '}
                        {formData.pricingModel === 'free'
                          ? 'Free'
                          : formData.pricingModel === 'subscription'
                          ? `$${formData.subscriptionMonthly}/mo`
                          : `$${formData.price}`}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categories:</span>{' '}
                        {formData.categories.length || 0}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tags:</span>{' '}
                        {formData.tags.length || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Review Process</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          After submission, our team will review your listing within 2-3
                          business days. You'll receive an email once approved.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(false)}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={() => handleSubmit(true)}>
              Submit for Review
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
