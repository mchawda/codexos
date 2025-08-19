'use client';

import { motion } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Book, 
  Zap,
  Shield,
  Globe,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/v1/agents',
    description: 'Create a new agent',
    category: 'Agents',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/agents/{id}',
    description: 'Get agent details',
    category: 'Agents',
  },
  {
    method: 'PUT',
    endpoint: '/api/v1/agents/{id}',
    description: 'Update an agent',
    category: 'Agents',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/agents/{id}/execute',
    description: 'Execute an agent',
    category: 'Execution',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/executions/{id}',
    description: 'Get execution status',
    category: 'Execution',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/rag/ingest',
    description: 'Ingest documents',
    category: 'RAG',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/rag/search',
    description: 'Search knowledge base',
    category: 'RAG',
  },
];

const codeExamples = {
  python: `import codexos

# Initialize the client
client = codexos.Client(api_key="your_api_key")

# Create an agent
agent = client.agents.create(
    name="Code Review Agent",
    description="Reviews code for best practices",
    nodes=[
        {"type": "entry", "id": "start"},
        {"type": "llm", "id": "review", "config": {...}},
        {"type": "exit", "id": "end"}
    ],
    edges=[
        {"source": "start", "target": "review"},
        {"source": "review", "target": "end"}
    ]
)

# Execute the agent
result = client.agents.execute(
    agent_id=agent.id,
    inputs={"code": "def hello(): print('world')"}
)`,
  
  javascript: `import { CodexOS } from '@codexos/sdk';

// Initialize the client
const client = new CodexOS({ apiKey: 'your_api_key' });

// Create an agent
const agent = await client.agents.create({
  name: 'Code Review Agent',
  description: 'Reviews code for best practices',
  nodes: [
    { type: 'entry', id: 'start' },
    { type: 'llm', id: 'review', config: {...} },
    { type: 'exit', id: 'end' }
  ],
  edges: [
    { source: 'start', target: 'review' },
    { source: 'review', target: 'end' }
  ]
});

// Execute the agent
const result = await client.agents.execute({
  agentId: agent.id,
  inputs: { code: "const hello = () => console.log('world')" }
});`,

  curl: `# Create an agent
curl -X POST https://api.codexos.dev/v1/agents \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Code Review Agent",
    "description": "Reviews code for best practices",
    "nodes": [...],
    "edges": [...]
  }'

# Execute the agent
curl -X POST https://api.codexos.dev/v1/agents/{agent_id}/execute \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": {
      "code": "def hello(): print('world')"
    }
  }'`
};

export default function APIReferencePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'curl'>('python');

  const copyCode = (lang: string) => {
    navigator.clipboard.writeText(codeExamples[lang as keyof typeof codeExamples]);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-400';
      case 'POST':
        return 'text-blue-400';
      case 'PUT':
        return 'text-yellow-400';
      case 'DELETE':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

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
            <Terminal className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            API Reference
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Build powerful autonomous agents with our comprehensive REST API. 
            Full documentation for all endpoints and SDKs.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <Badge className="px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              REST API v1
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              OAuth 2.0
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              Global CDN
            </Badge>
          </div>
        </motion.div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
            
            {/* Language Selector */}
            <div className="flex gap-2 mb-6">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang as any)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 ${
                    selectedLang === lang
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            
            {/* Code Example */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 glass-dark">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm text-muted-foreground">Example</span>
                <button
                  onClick={() => copyCode(selectedLang)}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  {copiedCode === selectedLang ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className="text-sm text-white/80">
                  {codeExamples[selectedLang]}
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>
            
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-white/80">{endpoint.endpoint}</code>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {endpoint.category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">Official SDKs</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Get started quickly with our official SDKs for popular languages.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Python SDK', icon: '🐍', command: 'pip install codexos' },
                { name: 'JavaScript SDK', icon: '📦', command: 'npm install @codexos/sdk' },
                { name: 'Go SDK', icon: '🐹', command: 'go get github.com/codexos/go-sdk' },
              ].map((sdk, index) => (
                <motion.div
                  key={sdk.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{sdk.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{sdk.name}</h3>
                  <code className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded">
                    {sdk.command}
                  </code>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
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
              <Book className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Need More Help?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore our comprehensive guides, tutorials, and examples to get the most out of CodexOS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  View Documentation
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Join Discord
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
