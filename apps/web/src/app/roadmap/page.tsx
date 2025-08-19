'use client';

import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  CheckCircle2, 
  Circle, 
  Clock,
  Calendar,
  Zap,
  Brain,
  Shield,
  Globe,
  Code2,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const roadmapItems = [
  {
    quarter: 'Q1 2024',
    status: 'completed',
    title: 'Foundation & Core Infrastructure',
    items: [
      { name: 'Visual Flow Editor', status: 'completed', icon: Code2 },
      { name: 'Agent Execution Engine', status: 'completed', icon: Zap },
      { name: 'Multi-modal Support (Vision, Voice)', status: 'completed', icon: Brain },
      { name: 'RAG Engine Integration', status: 'completed', icon: Globe },
      { name: 'Secure Vault System', status: 'completed', icon: Shield },
    ]
  },
  {
    quarter: 'Q2 2024',
    status: 'in-progress',
    title: 'Enterprise & Marketplace',
    items: [
      { name: 'Multi-tenant Architecture', status: 'completed', icon: Globe },
      { name: 'SSO & Auth0 Integration', status: 'completed', icon: Shield },
      { name: 'Agent Marketplace Launch', status: 'in-progress', icon: Sparkles },
      { name: 'Stripe Payment Integration', status: 'in-progress', icon: Zap },
      { name: 'Advanced Analytics Dashboard', status: 'planned', icon: Brain },
    ]
  },
  {
    quarter: 'Q3 2024',
    status: 'planned',
    title: 'Scale & Performance',
    items: [
      { name: 'Distributed Agent Execution', status: 'planned', icon: Globe },
      { name: 'GPU-accelerated Processing', status: 'planned', icon: Zap },
      { name: 'Real-time Collaboration', status: 'planned', icon: Brain },
      { name: 'Advanced Caching Layer', status: 'planned', icon: Shield },
      { name: 'Global CDN Integration', status: 'planned', icon: Globe },
    ]
  },
  {
    quarter: 'Q4 2024',
    status: 'planned',
    title: 'AI & Intelligence',
    items: [
      { name: 'Custom Model Fine-tuning', status: 'planned', icon: Brain },
      { name: 'Agent Learning & Memory', status: 'planned', icon: Sparkles },
      { name: 'Predictive Agent Suggestions', status: 'planned', icon: Zap },
      { name: 'Multi-agent Orchestration', status: 'planned', icon: Globe },
      { name: 'Advanced Debugging Tools', status: 'planned', icon: Code2 },
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-blue-400" />;
    default:
      return <Circle className="w-5 h-5 text-white/30" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
    case 'in-progress':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
    default:
      return <Badge className="bg-white/10 text-white/60 border-white/20">Planned</Badge>;
  }
};

export default function RoadmapPage() {
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
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Product Roadmap
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Our vision for the future of autonomous engineering. See what we're building 
            and where we're heading.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-white/30" />
              <span className="text-muted-foreground">Planned</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-600/50 via-purple-600/50 to-transparent" />
            
            {/* Timeline Items */}
            <div className="space-y-16">
              {roadmapItems.map((quarter, index) => (
                <motion.div
                  key={quarter.quarter}
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
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold">{quarter.quarter}</h3>
                      {getStatusBadge(quarter.status)}
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-6 text-muted-foreground">
                      {quarter.title}
                    </h4>
                    
                    <div className="grid gap-3">
                      {quarter.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300"
                        >
                          <div className="p-2 rounded-lg bg-white/5">
                            <item.icon className="w-5 h-5 text-violet-400" />
                          </div>
                          <span className="flex-1 font-medium">{item.name}</span>
                          {getStatusIcon(item.status)}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Future Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-20 p-8 rounded-2xl border border-white/10 glass-dark text-center"
          >
            <Target className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Looking Further Ahead</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our long-term vision includes quantum computing integration, advanced neural architectures, 
              and seamless collaboration between human developers and AI agents. We're building the 
              future of software development, one milestone at a time.
            </p>
          </motion.div>
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
              <Calendar className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get notified when we ship new features and reach important milestones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Subscribe to Updates
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  View Changelog
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
