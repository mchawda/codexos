'use client';

import { motion } from 'framer-motion';
import { 
  Layers, 
  Code2, 
  Bot, 
  FileSearch,
  MessageSquare,
  Shield,
  Zap,
  Brain,
  Download,
  Star,
  Users,
  Eye,
  Copy,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    category: 'Development',
    icon: Code2,
    templates: [
      {
        name: 'Code Review Agent',
        description: 'Automated code review with best practices and security checks',
        downloads: '12.3k',
        rating: 4.8,
        tags: ['Code Quality', 'Security', 'Best Practices'],
        featured: true,
      },
      {
        name: 'Documentation Generator',
        description: 'Generate comprehensive documentation from your codebase',
        downloads: '8.7k',
        rating: 4.6,
        tags: ['Documentation', 'Markdown', 'API Docs'],
      },
      {
        name: 'Test Suite Builder',
        description: 'Automatically generate unit and integration tests',
        downloads: '6.2k',
        rating: 4.7,
        tags: ['Testing', 'TDD', 'Coverage'],
      },
    ]
  },
  {
    category: 'DevOps',
    icon: Zap,
    templates: [
      {
        name: 'CI/CD Pipeline',
        description: 'Complete CI/CD pipeline with testing and deployment',
        downloads: '9.1k',
        rating: 4.9,
        tags: ['Deployment', 'Automation', 'GitHub Actions'],
        featured: true,
      },
      {
        name: 'Infrastructure Monitor',
        description: 'Monitor and alert on infrastructure health',
        downloads: '5.4k',
        rating: 4.5,
        tags: ['Monitoring', 'Alerts', 'Metrics'],
      },
      {
        name: 'Security Scanner',
        description: 'Scan for vulnerabilities and security issues',
        downloads: '7.8k',
        rating: 4.8,
        tags: ['Security', 'SAST', 'Dependencies'],
      },
    ]
  },
  {
    category: 'AI & ML',
    icon: Brain,
    templates: [
      {
        name: 'Data Analysis Pipeline',
        description: 'Analyze and visualize data with AI-powered insights',
        downloads: '10.2k',
        rating: 4.7,
        tags: ['Data Science', 'Analytics', 'Visualization'],
      },
      {
        name: 'Content Generator',
        description: 'Generate high-quality content with context awareness',
        downloads: '15.6k',
        rating: 4.9,
        tags: ['Content', 'Writing', 'SEO'],
        featured: true,
      },
      {
        name: 'Image Processing Agent',
        description: 'Process and analyze images with computer vision',
        downloads: '4.3k',
        rating: 4.6,
        tags: ['Vision', 'Image', 'Processing'],
      },
    ]
  },
  {
    category: 'Business',
    icon: MessageSquare,
    templates: [
      {
        name: 'Customer Support Bot',
        description: 'Intelligent customer support with ticket management',
        downloads: '11.4k',
        rating: 4.8,
        tags: ['Support', 'Chat', 'Tickets'],
      },
      {
        name: 'Sales Assistant',
        description: 'Automate sales outreach and follow-ups',
        downloads: '7.9k',
        rating: 4.7,
        tags: ['Sales', 'CRM', 'Automation'],
      },
      {
        name: 'Report Generator',
        description: 'Generate business reports and insights',
        downloads: '6.5k',
        rating: 4.6,
        tags: ['Reports', 'Analytics', 'Business Intelligence'],
      },
    ]
  },
];

export default function TemplatesPage() {
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
            <Layers className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Agent Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Jump-start your development with pre-built agent templates. 
            Battle-tested, production-ready, and fully customizable.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">100k+ Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Community Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Security Tested</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Templates */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Templates</h2>
            <p className="text-xl text-muted-foreground">
              Most popular templates from our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {templates.flatMap(cat => cat.templates.filter(t => t.featured)).map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl p-8 h-full border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
                      Featured
                    </Badge>
                  </div>
                  
                  <Bot className="w-12 h-12 text-violet-400 mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{template.name}</h3>
                  <p className="text-muted-foreground mb-6">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{template.downloads}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <button className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                    Use Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Templates */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Browse All Templates</h2>
            <p className="text-xl text-muted-foreground">
              Find the perfect template for your use case
            </p>
          </motion.div>

          <div className="space-y-12">
            {templates.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <category.icon className="w-6 h-6 text-violet-400" />
                  <h3 className="text-2xl font-semibold">{category.category}</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {category.templates.map((template, templateIndex) => (
                    <motion.div
                      key={template.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: templateIndex * 0.05 }}
                      className="group cursor-pointer"
                    >
                      <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">
                            {template.name}
                          </h4>
                          <Eye className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                        
                        <p className="text-muted-foreground mb-4 flex-1">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{template.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{template.downloads}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 transition-all duration-300 flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" />
                            Use
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Template CTA */}
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
              <Code2 className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Share Your Templates
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Have an amazing agent template? Share it with the community and help others build faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Submit Template
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Contribution Guide
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
