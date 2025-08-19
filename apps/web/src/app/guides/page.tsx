'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Rocket, 
  Code2, 
  Brain,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Star,
  Users,
  Globe,
  Workflow
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const guides = [
  {
    category: 'Getting Started',
    icon: Rocket,
    guides: [
      {
        title: 'Quick Start Guide',
        description: 'Get up and running with CodexOS in under 5 minutes',
        readTime: '5 min',
        difficulty: 'Beginner',
        popular: true,
      },
      {
        title: 'Your First Agent',
        description: 'Build your first autonomous agent step by step',
        readTime: '10 min',
        difficulty: 'Beginner',
      },
      {
        title: 'Understanding Nodes',
        description: 'Learn about different node types and their capabilities',
        readTime: '15 min',
        difficulty: 'Intermediate',
      },
    ]
  },
  {
    category: 'Advanced Concepts',
    icon: Brain,
    guides: [
      {
        title: 'Multi-Agent Orchestration',
        description: 'Coordinate multiple agents to solve complex problems',
        readTime: '20 min',
        difficulty: 'Advanced',
      },
      {
        title: 'Custom Node Development',
        description: 'Create your own custom nodes for specialized tasks',
        readTime: '30 min',
        difficulty: 'Advanced',
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize your agents for speed and efficiency',
        readTime: '25 min',
        difficulty: 'Advanced',
        popular: true,
      },
    ]
  },
  {
    category: 'Integrations',
    icon: Globe,
    guides: [
      {
        title: 'GitHub Integration',
        description: 'Connect your agents to GitHub repositories',
        readTime: '15 min',
        difficulty: 'Intermediate',
      },
      {
        title: 'Slack Bot Agent',
        description: 'Build a Slack bot powered by CodexOS agents',
        readTime: '20 min',
        difficulty: 'Intermediate',
        popular: true,
      },
      {
        title: 'API Webhooks',
        description: 'Trigger agents with webhooks and external events',
        readTime: '15 min',
        difficulty: 'Intermediate',
      },
    ]
  },
  {
    category: 'Best Practices',
    icon: Shield,
    guides: [
      {
        title: 'Security Best Practices',
        description: 'Keep your agents and data secure',
        readTime: '20 min',
        difficulty: 'Intermediate',
      },
      {
        title: 'Error Handling',
        description: 'Build resilient agents that handle failures gracefully',
        readTime: '15 min',
        difficulty: 'Intermediate',
      },
      {
        title: 'Testing Your Agents',
        description: 'Write tests to ensure your agents work correctly',
        readTime: '25 min',
        difficulty: 'Advanced',
      },
    ]
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Intermediate':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Advanced':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-white/10 text-white/60 border-white/20';
  }
};

export default function GuidesPage() {
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
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Guides & Tutorials
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Learn how to build powerful autonomous agents with our comprehensive guides 
            and step-by-step tutorials.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Community Driven</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Regular Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Code Examples</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Guides */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Guides</h2>
            <p className="text-xl text-muted-foreground">
              Start with our most popular guides
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Building Your First AI Agent',
                description: 'A complete walkthrough of creating, configuring, and deploying your first autonomous agent.',
                icon: Workflow,
                gradient: 'from-violet-600 to-purple-600',
              },
              {
                title: 'RAG Engine Deep Dive',
                description: 'Master the Retrieval-Augmented Generation engine for building knowledge-aware agents.',
                icon: Brain,
                gradient: 'from-blue-600 to-cyan-600',
              },
              {
                title: 'Production Best Practices',
                description: 'Learn how to deploy and monitor agents in production with enterprise-grade reliability.',
                icon: Shield,
                gradient: 'from-green-600 to-emerald-600',
              },
            ].map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl p-8 h-full border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${guide.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  <guide.icon className="w-12 h-12 text-white mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{guide.title}</h3>
                  <p className="text-muted-foreground mb-6">{guide.description}</p>
                  
                  <div className="flex items-center text-violet-400 group-hover:text-violet-300 transition-colors">
                    <span className="text-sm font-medium">Read Guide</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Guides */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">All Guides</h2>
            <p className="text-xl text-muted-foreground">
              Browse our complete collection of guides and tutorials
            </p>
          </motion.div>

          <div className="space-y-12">
            {guides.map((category, categoryIndex) => (
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
                  {category.guides.map((guide, guideIndex) => (
                    <motion.div
                      key={guide.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: guideIndex * 0.05 }}
                      className="group cursor-pointer"
                    >
                      <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">
                            {guide.title}
                          </h4>
                          {guide.popular && (
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-4 flex-1">
                          {guide.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getDifficultyColor(guide.difficulty)}>
                              {guide.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {guide.readTime}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-violet-400 transition-colors" />
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
              <Users className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Can't Find What You Need?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community to get help from other developers and the CodexOS team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Join Discord
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Browse Forums
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
