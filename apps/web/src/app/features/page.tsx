'use client';

import { motion } from 'framer-motion';
import { 
  Bot, 
  Brain, 
  Shield, 
  Zap, 
  Code, 
  Globe,
  Workflow,
  Eye,
  Mic,
  MousePointer,
  Database,
  Lock,
  Sparkles,
  Layers,
  GitBranch,
  Terminal,
  Cloud,
  Server,
  Users,
  BarChart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  {
    category: 'Autonomous Agents',
    icon: Bot,
    description: 'Build intelligent agents that complete complex engineering tasks independently',
    items: [
      {
        title: 'Visual Flow Editor',
        description: 'Drag-and-drop interface to create sophisticated AI workflows without code',
        icon: Workflow,
      },
      {
        title: 'Multi-Modal Intelligence',
        description: 'Process images, voice, and take actions with vision, speech, and browser automation',
        icon: Eye,
      },
      {
        title: 'Self-Improving Agents',
        description: 'Agents that learn from execution history and optimize their performance',
        icon: Brain,
      },
      {
        title: 'Parallel Execution',
        description: 'Run multiple agents simultaneously with intelligent resource management',
        icon: Zap,
      }
    ]
  },
  {
    category: 'RAG Engine',
    icon: Database,
    description: 'Context-aware AI with powerful knowledge retrieval from multiple sources',
    items: [
      {
        title: 'Multi-Source Ingestion',
        description: 'Ingest from GitHub repos, PDFs, documentation, and web sources',
        icon: Globe,
      },
      {
        title: 'Smart Chunking',
        description: 'Intelligent document splitting with semantic understanding',
        icon: Layers,
      },
      {
        title: 'Vector Search',
        description: 'Lightning-fast semantic search across millions of documents',
        icon: Sparkles,
      },
      {
        title: 'Real-time Updates',
        description: 'Automatically sync and update knowledge bases as sources change',
        icon: GitBranch,
      }
    ]
  },
  {
    category: 'Enterprise Security',
    icon: Shield,
    description: 'Bank-grade security with compliance certifications',
    items: [
      {
        title: 'Encrypted Vault',
        description: 'AES-256-GCM encryption for all credentials and sensitive data',
        icon: Lock,
      },
      {
        title: 'SOC2 & ISO 27001',
        description: 'Enterprise compliance certifications for security and privacy',
        icon: Shield,
      },
      {
        title: 'Audit Trails',
        description: 'Complete activity logging with immutable audit records',
        icon: BarChart,
      },
      {
        title: 'Role-Based Access',
        description: 'Granular permissions with team and organization management',
        icon: Users,
      }
    ]
  },
  {
    category: 'Developer Experience',
    icon: Code,
    description: 'Built by developers, for developers',
    items: [
      {
        title: 'CLI & SDK',
        description: 'Command-line tools and SDKs for Python, JavaScript, and more',
        icon: Terminal,
      },
      {
        title: 'API-First Design',
        description: 'RESTful and GraphQL APIs for complete programmatic control',
        icon: Code,
      },
      {
        title: 'Self-Hosted Option',
        description: 'Deploy on your infrastructure with Docker and Kubernetes',
        icon: Server,
      },
      {
        title: 'Cloud Native',
        description: 'Auto-scaling, multi-region deployment with 99.9% uptime SLA',
        icon: Cloud,
      }
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">

      
      {/* Hero Section */}
      <section className="relative pt-44 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Features that <span className="text-gradient">Empower</span> Developers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything you need to build, deploy, and scale autonomous AI agents. 
            From visual workflows to enterprise security, we've got you covered.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="glow-primary">
                Start Building
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-20"
        >
          {features.map((category, categoryIdx) => {
            const CategoryIcon = category.icon;
            return (
              <motion.div
                key={category.category}
                variants={itemVariants}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 mb-4">
                    <CategoryIcon className="w-8 h-8 text-violet-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{category.category}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.items.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIdx * 0.1 + idx * 0.05 }}
                        className="glass-dark rounded-xl p-6 hover:bg-accent/5 transition-all duration-300 group"
                      >
                        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                          <FeatureIcon className="w-6 h-6 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-dark rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 animated-border opacity-20" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Future of Development?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers building with CodexOS
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="glow-primary">
                Get Started Free
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
