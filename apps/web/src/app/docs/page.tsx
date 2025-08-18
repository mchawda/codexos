'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Code, 
  Rocket,
  FileText,
  Terminal,
  GitBranch,
  Settings,
  Shield,
  Zap,
  Search,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  PlayCircle,
  Download,
  Users,
  MessageSquare,
  Github
} from 'lucide-react';
import Navigation from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const docCategories = [
  {
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { title: 'Introduction', href: '/docs/intro', time: '5 min' },
      { title: 'Quick Start', href: '/docs/quickstart', time: '10 min' },
      { title: 'Installation', href: '/docs/installation', time: '3 min' },
      { title: 'Your First Agent', href: '/docs/first-agent', time: '15 min' }
    ]
  },
  {
    title: 'Core Concepts',
    icon: Book,
    items: [
      { title: 'Agent Architecture', href: '/docs/agents', time: '10 min' },
      { title: 'Visual Flow Editor', href: '/docs/flow-editor', time: '8 min' },
      { title: 'Node Types', href: '/docs/nodes', time: '12 min' },
      { title: 'Execution Model', href: '/docs/execution', time: '15 min' }
    ]
  },
  {
    title: 'RAG Engine',
    icon: FileText,
    items: [
      { title: 'RAG Overview', href: '/docs/rag-overview', time: '8 min' },
      { title: 'Document Ingestion', href: '/docs/ingestion', time: '10 min' },
      { title: 'Vector Search', href: '/docs/vector-search', time: '12 min' },
      { title: 'Query Optimization', href: '/docs/query-opt', time: '15 min' }
    ]
  },
  {
    title: 'API Reference',
    icon: Code,
    items: [
      { title: 'REST API', href: '/docs/api/rest', time: '20 min' },
      { title: 'GraphQL API', href: '/docs/api/graphql', time: '20 min' },
      { title: 'WebSocket Events', href: '/docs/api/websocket', time: '15 min' },
      { title: 'SDK Reference', href: '/docs/api/sdk', time: '25 min' }
    ]
  },
  {
    title: 'Deployment',
    icon: GitBranch,
    items: [
      { title: 'Cloud Deployment', href: '/docs/deploy/cloud', time: '10 min' },
      { title: 'Self-Hosted', href: '/docs/deploy/self-hosted', time: '20 min' },
      { title: 'Docker & K8s', href: '/docs/deploy/docker', time: '15 min' },
      { title: 'Environment Config', href: '/docs/deploy/config', time: '8 min' }
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { title: 'Security Overview', href: '/docs/security/overview', time: '10 min' },
      { title: 'Authentication', href: '/docs/security/auth', time: '12 min' },
      { title: 'Vault System', href: '/docs/security/vault', time: '15 min' },
      { title: 'Compliance', href: '/docs/security/compliance', time: '20 min' }
    ]
  }
];

const popularGuides = [
  {
    title: 'Build a Code Review Agent',
    description: 'Learn how to create an AI agent that reviews pull requests',
    icon: Code,
    difficulty: 'Intermediate',
    time: '30 min'
  },
  {
    title: 'RAG-Powered Documentation Bot',
    description: 'Create a bot that answers questions from your docs',
    icon: MessageSquare,
    difficulty: 'Beginner',
    time: '20 min'
  },
  {
    title: 'Multi-Agent Workflows',
    description: 'Orchestrate multiple agents for complex tasks',
    icon: GitBranch,
    difficulty: 'Advanced',
    time: '45 min'
  },
  {
    title: 'Custom Tool Development',
    description: 'Build and integrate custom tools for your agents',
    icon: Settings,
    difficulty: 'Advanced',
    time: '40 min'
  }
];

const codeExamples = [
  {
    title: 'Python SDK',
    lang: 'python',
    code: `from codexos import Agent, Flow

# Create an agent
agent = Agent(name="Code Reviewer")

# Add nodes to the flow
agent.add_llm_node(
    prompt="Review this code for bugs",
    model="gpt-4"
)

# Execute the agent
result = agent.run(input_data)`
  },
  {
    title: 'JavaScript SDK',
    lang: 'javascript',
    code: `import { Agent, Flow } from '@codexos/sdk';

// Create an agent
const agent = new Agent({ name: 'Code Reviewer' });

// Add nodes to the flow
agent.addLLMNode({
  prompt: 'Review this code for bugs',
  model: 'gpt-4'
});

// Execute the agent
const result = await agent.run(inputData);`
  }
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, title: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(title);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
            <span className="text-gradient">Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything you need to know about building with CodexOS. 
            From quick starts to advanced deployments.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="glass-dark rounded-lg p-2 flex items-center">
              <Search className="w-5 h-5 text-muted-foreground ml-3" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent px-4 py-3 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="mr-2">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/docs/quickstart">
              <Button variant="outline">
                <Rocket className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </Link>
            <Link href="/docs/api/rest">
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                API Reference
              </Button>
            </Link>
            <Link href="https://github.com/codexos/codexos">
              <Button variant="outline">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map((category, idx) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-dark rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                      <CategoryIcon className="w-5 h-5 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 transition-colors group"
                      >
                        <span className="text-sm">{item.title}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-20 px-4 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Guides</h2>
            <p className="text-muted-foreground">
              Step-by-step tutorials to help you build amazing agents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGuides.map((guide, idx) => {
              const GuideIcon = guide.icon;
              return (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-dark rounded-xl p-6 hover:bg-accent/5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                      <GuideIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <Badge
                      variant={
                        guide.difficulty === 'Beginner' ? 'default' :
                        guide.difficulty === 'Intermediate' ? 'secondary' :
                        'outline'
                      }
                    >
                      {guide.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {guide.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      <PlayCircle className="w-3 h-3 inline mr-1" />
                      {guide.time}
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start Examples</h2>
            <p className="text-muted-foreground">
              Get started with CodexOS in your favorite language
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {codeExamples.map((example) => (
              <div key={example.title} className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{example.title}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCode(example.code, example.title)}
                  >
                    {copiedCode === example.title ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <pre className="bg-background/50 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-muted-foreground">
                    {example.code}
                  </code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our community or explore additional resources
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/community">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Community Discord
                </Button>
              </Link>
              <Link href="https://github.com/codexos/codexos">
                <Button variant="outline" className="w-full">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Repo
                </Button>
              </Link>
              <Link href="/changelog">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Changelog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
