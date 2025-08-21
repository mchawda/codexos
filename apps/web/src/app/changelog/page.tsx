// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  History, 
  Sparkles, 
  Zap, 
  Shield,
  Bug,
  Wrench,
  Star,
  GitCommit,
  ArrowUp,
  Code2,
  Database,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const changelog = [
  {
    version: 'v1.0.0',
    date: 'January 15, 2024',
    type: 'major',
    title: 'Production Ready Release',
    highlights: [
      'Complete multi-tenant architecture',
      'Enterprise SSO integration',
      'Agent marketplace launch',
      'Advanced security features',
    ],
    changes: {
      features: [
        'Multi-tenant isolation with row-level security',
        'Auth0/Okta/Azure AD SSO integration',
        'Agent marketplace with revenue sharing',
        'Advanced RAG engine with hybrid search',
        'Real-time collaboration features',
      ],
      improvements: [
        'Performance optimizations across the platform',
        'Enhanced UI/UX with new design system',
        'Better error handling and recovery',
        'Improved documentation and guides',
      ],
      security: [
        'SOC2 Type II compliance features',
        'AES-256-GCM encryption for vault',
        'Comprehensive audit logging',
        'MFA support with TOTP',
      ],
    },
  },
  {
    version: 'v0.9.0',
    date: 'December 20, 2023',
    type: 'minor',
    title: 'Agent Engine Enhancements',
    changes: {
      features: [
        'Visual flow editor with drag-and-drop',
        'Multi-modal support (vision, voice, action)',
        'Custom node development SDK',
        'Execution history and debugging',
      ],
      improvements: [
        'Faster agent execution times',
        'Better memory management',
        'Improved error messages',
      ],
      fixes: [
        'Fixed race condition in parallel node execution',
        'Resolved memory leak in long-running agents',
        'Fixed UI rendering issues in Safari',
      ],
    }
  },
  {
    version: 'v0.8.0',
    date: 'November 15, 2023',
    type: 'minor',
    title: 'RAG Engine & Knowledge Base',
    changes: {
      features: [
        'Complete RAG engine implementation',
        'Multi-source document ingestion',
        'Semantic search with reranking',
        'Knowledge base management UI',
      ],
      improvements: [
        'Better chunking strategies',
        'Optimized vector storage',
        'Faster embedding generation',
      ],
      fixes: [
        'Fixed PDF parsing issues',
        'Resolved ChromaDB connection errors',
        'Fixed metadata extraction bugs',
      ],
    }
  },
  {
    version: 'v0.7.0',
    date: 'October 10, 2023',
    type: 'minor',
    title: 'Security & Vault System',
    changes: {
      features: [
        'Encrypted vault for credentials',
        'Role-based access control',
        'API key management',
        'Secure environment variables',
      ],
      security: [
        'End-to-end encryption implementation',
        'Security headers configuration',
        'Rate limiting and DDoS protection',
      ],
    }
  },
];

const getVersionBadge = (type: string) => {
  switch (type) {
    case 'major':
      return <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">Major Release</Badge>;
    case 'minor':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Minor Release</Badge>;
    case 'patch':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Patch Release</Badge>;
    default:
      return null;
  }
};

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'features':
      return <Sparkles className="w-5 h-5 text-violet-400" />;
    case 'improvements':
      return <ArrowUp className="w-5 h-5 text-blue-400" />;
    case 'fixes':
      return <Bug className="w-5 h-5 text-green-400" />;
    case 'security':
      return <Shield className="w-5 h-5 text-yellow-400" />;
    default:
      return <GitCommit className="w-5 h-5 text-white/60" />;
  }
};

const getChangeTitle = (type: string) => {
  switch (type) {
    case 'features':
      return 'New Features';
    case 'improvements':
      return 'Improvements';
    case 'fixes':
      return 'Bug Fixes';
    case 'security':
      return 'Security Updates';
    default:
      return type;
  }
};

export default function ChangelogPage() {
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
            <History className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Track our progress and see what's new in each release. 
            We ship fast and iterate based on your feedback.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Weekly Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Community Driven</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Stable Releases</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-600/50 via-purple-600/50 to-transparent" />
            
            {/* Releases */}
            <div className="space-y-16">
              {changelog.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 -top-1 w-8 h-8 rounded-full bg-background border-2 border-violet-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-violet-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="ml-20">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-3xl font-bold">{release.version}</h3>
                      {getVersionBadge(release.type)}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{release.date}</p>
                    
                    <h4 className="text-xl font-semibold mb-6">{release.title}</h4>
                    
                    {release.highlights && (
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-600/20">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-violet-400" />
                          Release Highlights
                        </h5>
                        <ul className="space-y-2">
                          {release.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-violet-400 mt-0.5">•</span>
                              <span className="text-white/80">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="space-y-6">
                      {Object.entries(release.changes).map(([type, changes]) => (
                        <div key={type}>
                          <h5 className="font-semibold mb-3 flex items-center gap-2">
                            {getChangeIcon(type)}
                            {getChangeTitle(type)}
                          </h5>
                          <ul className="space-y-2">
                            {changes.map((change: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <span className="text-white/30 mt-0.5">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-16 ml-20"
            >
              <div className="p-8 rounded-2xl border border-white/10 glass-dark">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20">
                    <Code2 className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold">What's Next?</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  We're constantly working on new features and improvements. Here's what's coming:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Globe, title: 'Global Deployment', desc: 'Multi-region support' },
                    { icon: Database, title: 'Advanced Analytics', desc: 'Deep insights & metrics' },
                    { icon: Zap, title: 'GPU Acceleration', desc: 'Faster AI processing' },
                    { icon: Shield, title: 'Enhanced Security', desc: 'Zero-trust architecture' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-violet-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
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
              <Wrench className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay in the Loop
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get notified about new releases, features, and important updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Subscribe to Updates
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  RSS Feed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
