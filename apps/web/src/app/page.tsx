'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bot, Code2, Cpu, Sparkles, Zap, Shield, Globe, Play, Code, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/layout/navigation';
import Footer from '@/components/layout/footer';
import FeatureCard from '@/components/home/feature-card';

const features = [
  {
    icon: Bot,
    title: 'Autonomous Agents',
    description: 'Build intelligent agents that complete complex engineering tasks independently',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Code2,
    title: 'Visual Flow Editor',
    description: 'Drag-and-drop interface to create sophisticated AI workflows without code',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Cpu,
    title: 'Multimodal Intelligence',
    description: 'Process images, voice, and take actions with vision, speech, and browser automation',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Sparkles,
    title: 'RAG Engine',
    description: 'Context-aware AI with powerful knowledge retrieval from multiple sources',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 & ISO 27001 compliant with encrypted vault for credentials',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Globe,
    title: 'Agent Marketplace',
    description: 'Share and monetize your AI agents with the global developer community',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const logos = [
  { name: 'OPENAI', description: 'AI Provider' },
  { name: 'ANTHROPIC', description: 'Claude Integration' },
  { name: 'GITHUB', description: 'Version Control' },
  { name: 'DOCKER', description: 'Containerization' },
  { name: 'VERCEL', description: 'Deployment' },
  { name: 'SUPABASE', description: 'Database' },
];

export default function HomePage() {
  return (
    <>
      <Navigation />
      
      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-44 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Content */}
            <div className="order-2 lg:order-1">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="p-10 lg:p-12 shadow-2xl border border-white/10 rounded-3xl glass-dark"
              >
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 star-rating" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-white/50">4.9 • 2,847 developers</span>
                </div>
                
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight mb-8 font-manrope font-medium">
                  Build with<br />
                  <span className="text-gradient-blue font-manrope font-medium">AI agents</span> autonomously.
                </h1>
                
                {/* Description */}
                <p className="text-lg text-white/60 leading-relaxed mb-12">
                  The autonomous engineering OS that orchestrates AI agents to build, test, and deploy software. Enterprise-ready, secure, and infinitely scalable.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Link href="/dashboard">
                    <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl hover:bg-blue-500/10 text-white text-sm font-medium border border-blue-500/20 transition-all duration-300 hover:border-blue-500/30 btn-premium w-full sm:w-auto">
                      <span>Start Building</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
                  <Link href="/docs">
                    <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl hover:bg-white/5 text-white/80 text-sm font-medium border border-white/10 transition-all duration-300 hover:border-white/20 glass-ultra w-full sm:w-auto">
                      <Play className="w-4 h-4 mr-2" />
                      <span>Watch Demo</span>
                    </button>
                  </Link>
                </div>
                
                {/* Features */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-10 h-10 flex border-white/10 border rounded-xl mx-auto mb-3 items-center justify-center glass-ultra">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-white/70">Real-time</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/10 glass-ultra">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-white/70">SOC2 Certified</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/10 glass-ultra">
                      <Code className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-white/70">Open Source</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Image/Visual */}
            <div className="relative order-1 lg:order-2">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="overflow-hidden border border-white/10 rounded-3xl shadow-2xl glass-dark"
              >
                {/* Badge */}
                <div className="absolute top-8 left-8 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium border border-white/20 z-10 glass-blue">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-white">Live Execution</span>
                </div>

                {/* Flow Editor Preview */}
                <div className="relative h-[500px] lg:h-[650px] bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Bot className="w-20 h-20 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">AI Agent Builder</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-6">
                  <div className="border-white/10 border rounded-2xl p-6 glass-blue backdrop-blur-xl">
                    <div className="text-2xl text-white font-manrope font-medium">2.8K+</div>
                    <div className="text-sm text-white/60 mt-1">Active Agents</div>
                  </div>
                  <div className="rounded-2xl p-6 border border-white/10 glass-blue backdrop-blur-xl">
                    <div className="text-2xl text-white font-manrope font-medium">99.9%</div>
                    <div className="text-sm text-white/60 mt-1">Uptime SLA</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="max-w-7xl lg:px-8 mx-auto px-6 space-y-20 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:p-16 border-white/10 border rounded-3xl p-12 glass-dark"
          >
            <div className="text-center mb-12">
              <p className="uppercase text-sm font-medium text-white/40 tracking-wide mb-3">Trusted Partners</p>
              <h3 className="text-2xl text-white tracking-tight mb-4 font-manrope font-medium">Powered by Industry Leaders</h3>
              <p className="text-base text-white/60 max-w-2xl mx-auto">
                Built on the most advanced AI models and enterprise infrastructure, ensuring reliability and performance at scale.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {logos.map((logo) => (
                <div key={logo.name} className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/10 glass-ultra">
                  <span className="text-lg font-semibold text-white/60 hover:text-white/80 transition-colors duration-300 tracking-tight mb-2">
                    {logo.name}
                  </span>
                  <p className="text-xs text-white/40">{logo.description}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl text-white mb-2 font-manrope font-medium">99.8%</div>
                <p className="text-sm text-white/60">API Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-3xl text-white mb-2 font-manrope font-medium">15+</div>
                <p className="text-sm text-white/60">AI Models</p>
              </div>
              <div className="text-center">
                <div className="text-3xl text-white mb-2 font-manrope font-medium">500+</div>
                <p className="text-sm text-white/60">Tools Available</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4" variant="outline">
                Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need to build
                <span className="block text-gradient">autonomous AI systems</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From visual development tools to enterprise-grade security, 
                our platform provides the complete stack for AI-powered engineering.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="relative overflow-hidden rounded-3xl p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 gradient-mesh opacity-70" />
              <div className="relative z-10">
                <Badge className="mb-4" variant="default">
                  Limited Time Offer
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to revolutionize your workflow?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of developers building the future with autonomous AI agents.
                  Start free and scale as you grow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg" className="glow-primary">
                      Start Building Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline">
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}