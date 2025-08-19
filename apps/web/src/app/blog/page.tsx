'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User,
  ArrowRight,
  Tag,
  TrendingUp,
  Code2,
  Brain,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    id: 1,
    title: 'Introducing CodexOS v1.0: Production-Ready Autonomous Agents',
    excerpt: 'After months of development and feedback from our beta users, we're thrilled to announce the general availability of CodexOS v1.0.',
    author: 'Sarah Chen',
    date: 'January 15, 2024',
    readTime: '8 min read',
    category: 'Product',
    featured: true,
    image: '/blog/v1-launch.jpg',
    tags: ['Product', 'Launch', 'Features'],
  },
  {
    id: 2,
    title: 'Building Smarter Agents with RAG: A Deep Dive',
    excerpt: 'Learn how to leverage our Retrieval-Augmented Generation engine to build context-aware agents that can access and utilize your knowledge base.',
    author: 'Jordan Kim',
    date: 'January 10, 2024',
    readTime: '12 min read',
    category: 'Engineering',
    image: '/blog/rag-deep-dive.jpg',
    tags: ['RAG', 'Tutorial', 'AI'],
  },
  {
    id: 3,
    title: 'The Future of Software Development: AI Agents and Human Creativity',
    excerpt: 'Exploring how autonomous AI agents are transforming the way we build software and enhancing human creativity rather than replacing it.',
    author: 'Alex Rivera',
    date: 'January 5, 2024',
    readTime: '10 min read',
    category: 'Insights',
    featured: true,
    image: '/blog/future-dev.jpg',
    tags: ['AI', 'Future', 'Development'],
  },
  {
    id: 4,
    title: 'Security Best Practices for AI Agent Development',
    excerpt: 'A comprehensive guide to securing your autonomous agents, protecting sensitive data, and implementing proper access controls.',
    author: 'Maya Patel',
    date: 'December 28, 2023',
    readTime: '15 min read',
    category: 'Security',
    image: '/blog/security-practices.jpg',
    tags: ['Security', 'Best Practices', 'Enterprise'],
  },
  {
    id: 5,
    title: 'Case Study: How Acme Corp Reduced Development Time by 70%',
    excerpt: 'Learn how Acme Corp leveraged CodexOS to automate their development workflow and achieve remarkable productivity gains.',
    author: 'Product Team',
    date: 'December 20, 2023',
    readTime: '6 min read',
    category: 'Case Study',
    image: '/blog/case-study-acme.jpg',
    tags: ['Case Study', 'Success Story', 'ROI'],
  },
  {
    id: 6,
    title: 'Multi-Agent Orchestration: Patterns and Best Practices',
    excerpt: 'Discover advanced patterns for coordinating multiple agents to solve complex problems and build sophisticated workflows.',
    author: 'Jordan Kim',
    date: 'December 15, 2023',
    readTime: '14 min read',
    category: 'Engineering',
    image: '/blog/multi-agent.jpg',
    tags: ['Architecture', 'Advanced', 'Patterns'],
  },
];

const categories = [
  { name: 'All Posts', count: 42, icon: BookOpen },
  { name: 'Product', count: 12, icon: TrendingUp },
  { name: 'Engineering', count: 18, icon: Code2 },
  { name: 'Insights', count: 8, icon: Brain },
  { name: 'Security', count: 4, icon: Zap },
];

export default function BlogPage() {
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
            CodexOS Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Insights, tutorials, and updates from the CodexOS team. 
            Learn about AI agents, best practices, and the future of development.
          </p>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                  index === 0
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-white/10 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="text-sm opacity-60">({category.count})</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Posts</h2>
            <p className="text-xl text-muted-foreground">
              Our most popular and impactful articles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.filter(post => post.featured).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-violet-600/20 to-purple-600/20" />
                    
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                          {post.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-violet-400 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-6 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">{post.author}</p>
                            <p className="text-muted-foreground">{post.date}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">All Posts</h2>
            <p className="text-xl text-muted-foreground">
              Browse our complete collection of articles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="h-full border border-white/10 rounded-xl glass-dark hover:border-white/20 transition-all duration-300 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-violet-600/10 to-purple-600/10" />
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.readTime}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{post.author}</span>
                        <span className="text-muted-foreground">{post.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
              Load More Posts
            </button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
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
              <Tag className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get the latest insights and tutorials delivered to your inbox. 
                No spam, just valuable content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
