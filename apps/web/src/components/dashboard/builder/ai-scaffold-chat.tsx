'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, Code, Zap, RefreshCw, X, Eye, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentScaffold?: AgentScaffold;
}

interface AgentScaffold {
  name: string;
  description: string;
  category: string;
  nodes: any[];
  connections: any[];
  metadata: {
    complexity: 'simple' | 'intermediate' | 'advanced';
    estimatedTime: string;
    capabilities: string[];
  };
}

interface AIScaffoldChatProps {
  onScaffold: (scaffold: AgentScaffold) => void;
  onClose: () => void;
  onPreview?: (scaffold: AgentScaffold) => void;
}

const EXAMPLE_PROMPTS = [
  "Create a customer support agent that can answer FAQs and escalate complex issues",
  "Build a content writer agent that researches topics and generates blog posts",
  "Design a data analysis agent that processes CSV files and creates reports",
  "Make a social media manager that schedules posts and responds to comments",
  "Create a code review agent that analyzes pull requests and suggests improvements"
];

export function AIScaffoldChat({ onScaffold, onClose, onPreview }: AIScaffoldChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hi! I'm your AI Agent Architect. Describe the type of agent you want to build, and I'll scaffold it for you in the visual builder.\n\nFor example:\n• \"Create a customer support agent\"\n• \"Build a content writer for blogs\"\n• \"Design a data processor for CSV files\"",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<AgentScaffold | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scaffold = await generateAgentScaffold(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Perfect! I've designed a **${scaffold.name}** for you. This ${scaffold.metadata.complexity} agent will:\n\n${scaffold.description}\n\n**Capabilities:**\n${scaffold.metadata.capabilities.map(cap => `• ${cap}`).join('\n')}\n\n**Estimated build time:** ${scaffold.metadata.estimatedTime}\n\nClick "Apply Scaffold" to add it to your builder!`,
        timestamp: new Date(),
        agentScaffold: scaffold,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to generate scaffold:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate agent scaffold. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAgentScaffold = async (userInput: string): Promise<AgentScaffold> => {
    // AI-powered agent scaffolding logic
    // In a real implementation, this would call an LLM API
    
    const input = userInput.toLowerCase();
    
    // Determine agent type and complexity
    let agentType = 'general';
    let complexity: 'simple' | 'intermediate' | 'advanced' = 'simple';
    
    if (input.includes('customer support') || input.includes('help desk')) {
      agentType = 'customer-support';
      complexity = 'intermediate';
    } else if (input.includes('content') || input.includes('writer') || input.includes('blog')) {
      agentType = 'content-writer';
      complexity = 'intermediate';
    } else if (input.includes('data') || input.includes('analysis') || input.includes('csv')) {
      agentType = 'data-analyst';
      complexity = 'advanced';
    } else if (input.includes('social media') || input.includes('social')) {
      agentType = 'social-media';
      complexity = 'intermediate';
    } else if (input.includes('code') || input.includes('review') || input.includes('programming')) {
      agentType = 'code-review';
      complexity = 'advanced';
    }

    return generateScaffoldByType(agentType, complexity);
  };

  const generateScaffoldByType = (type: string, complexity: 'simple' | 'intermediate' | 'advanced'): AgentScaffold => {
    const scaffolds: Record<string, AgentScaffold> = {
      'customer-support': {
        name: 'Customer Support Agent',
        description: 'An intelligent customer support agent that can handle common inquiries, search knowledge bases, and escalate complex issues to human agents.',
        category: 'Support',
        metadata: {
          complexity: 'intermediate',
          estimatedTime: '15-20 minutes',
          capabilities: [
            'Answer frequently asked questions',
            'Search knowledge base and documentation',
            'Classify and route support tickets',
            'Escalate complex issues to human agents',
            'Collect customer feedback and satisfaction scores'
          ]
        },
        nodes: [
          {
            id: 'entry-1',
            type: 'entry',
            position: { x: 100, y: 100 },
            data: { label: 'Customer Inquiry' }
          },
          {
            id: 'llm-1',
            type: 'llm',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Intent Classifier',
              model: 'gpt-4',
              prompt: 'Classify this customer inquiry into categories: FAQ, Technical Issue, Billing, General, or Escalation Required.'
            }
          },
          {
            id: 'condition-1',
            type: 'condition',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Route Request',
              condition: 'intent'
            }
          },
          {
            id: 'rag-1',
            type: 'rag',
            position: { x: 300, y: 300 },
            data: { 
              label: 'Search FAQ',
              collection: 'customer-faq'
            }
          },
          {
            id: 'llm-2',
            type: 'llm',
            position: { x: 500, y: 300 },
            data: { 
              label: 'Generate Response',
              model: 'gpt-4',
              prompt: 'Provide a helpful response based on the FAQ information found.'
            }
          },
          {
            id: 'webhook-1',
            type: 'webhook',
            position: { x: 700, y: 200 },
            data: { 
              label: 'Escalate to Human',
              url: '/api/escalate-ticket'
            }
          },
          {
            id: 'exit-1',
            type: 'exit',
            position: { x: 700, y: 400 },
            data: { label: 'Response Sent' }
          }
        ],
        connections: [
          { id: 'e1-2', source: 'entry-1', target: 'llm-1' },
          { id: 'e2-3', source: 'llm-1', target: 'condition-1' },
          { id: 'e3-4', source: 'condition-1', target: 'rag-1', sourceHandle: 'faq' },
          { id: 'e4-5', source: 'rag-1', target: 'llm-2' },
          { id: 'e5-6', source: 'llm-2', target: 'exit-1' },
          { id: 'e3-7', source: 'condition-1', target: 'webhook-1', sourceHandle: 'escalate' }
        ]
      },
      'content-writer': {
        name: 'Content Writer Agent',
        description: 'An AI content creator that researches topics, generates outlines, writes engaging blog posts, and optimizes content for SEO.',
        category: 'Content',
        metadata: {
          complexity: 'intermediate',
          estimatedTime: '20-25 minutes',
          capabilities: [
            'Research topics and gather information',
            'Generate content outlines and structures',
            'Write engaging blog posts and articles',
            'Optimize content for SEO keywords',
            'Create meta descriptions and titles'
          ]
        },
        nodes: [
          {
            id: 'entry-1',
            type: 'entry',
            position: { x: 100, y: 100 },
            data: { label: 'Content Request' }
          },
          {
            id: 'llm-1',
            type: 'llm',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Topic Research',
              model: 'gpt-4',
              prompt: 'Research and gather key information about this topic. Provide insights, statistics, and interesting angles.'
            }
          },
          {
            id: 'llm-2',
            type: 'llm',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Create Outline',
              model: 'gpt-4',
              prompt: 'Create a detailed content outline with headings, subheadings, and key points to cover.'
            }
          },
          {
            id: 'llm-3',
            type: 'llm',
            position: { x: 300, y: 300 },
            data: { 
              label: 'Write Content',
              model: 'gpt-4',
              prompt: 'Write engaging, informative content following the outline. Make it conversational and valuable.'
            }
          },
          {
            id: 'llm-4',
            type: 'llm',
            position: { x: 500, y: 300 },
            data: { 
              label: 'SEO Optimization',
              model: 'gpt-4',
              prompt: 'Optimize the content for SEO. Add meta descriptions, title tags, and ensure keyword density.'
            }
          },
          {
            id: 'exit-1',
            type: 'exit',
            position: { x: 700, y: 200 },
            data: { label: 'Content Ready' }
          }
        ],
        connections: [
          { id: 'e1-2', source: 'entry-1', target: 'llm-1' },
          { id: 'e2-3', source: 'llm-1', target: 'llm-2' },
          { id: 'e3-4', source: 'llm-2', target: 'llm-3' },
          { id: 'e4-5', source: 'llm-3', target: 'llm-4' },
          { id: 'e5-6', source: 'llm-4', target: 'exit-1' }
        ]
      },
      'data-analyst': {
        name: 'Data Analysis Agent',
        description: 'A sophisticated data processing agent that analyzes CSV files, generates insights, creates visualizations, and produces comprehensive reports.',
        category: 'Analytics',
        metadata: {
          complexity: 'advanced',
          estimatedTime: '25-30 minutes',
          capabilities: [
            'Process and clean CSV data files',
            'Perform statistical analysis and calculations',
            'Generate data insights and trends',
            'Create charts and visualizations',
            'Produce executive summary reports'
          ]
        },
        nodes: [
          {
            id: 'entry-1',
            type: 'entry',
            position: { x: 100, y: 100 },
            data: { label: 'Data Upload' }
          },
          {
            id: 'tool-1',
            type: 'tool',
            position: { x: 300, y: 100 },
            data: { 
              label: 'CSV Parser',
              tool: 'csv-reader'
            }
          },
          {
            id: 'llm-1',
            type: 'llm',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Data Validator',
              model: 'gpt-4',
              prompt: 'Analyze this dataset structure. Identify data types, missing values, and potential issues.'
            }
          },
          {
            id: 'tool-2',
            type: 'tool',
            position: { x: 300, y: 300 },
            data: { 
              label: 'Statistical Analysis',
              tool: 'pandas-stats'
            }
          },
          {
            id: 'tool-3',
            type: 'tool',
            position: { x: 500, y: 300 },
            data: { 
              label: 'Chart Generator',
              tool: 'matplotlib'
            }
          },
          {
            id: 'llm-2',
            type: 'llm',
            position: { x: 700, y: 200 },
            data: { 
              label: 'Insights Generator',
              model: 'gpt-4',
              prompt: 'Generate key insights and business recommendations based on the statistical analysis.'
            }
          },
          {
            id: 'exit-1',
            type: 'exit',
            position: { x: 900, y: 200 },
            data: { label: 'Report Generated' }
          }
        ],
        connections: [
          { id: 'e1-2', source: 'entry-1', target: 'tool-1' },
          { id: 'e2-3', source: 'tool-1', target: 'llm-1' },
          { id: 'e3-4', source: 'llm-1', target: 'tool-2' },
          { id: 'e4-5', source: 'tool-2', target: 'tool-3' },
          { id: 'e5-6', source: 'tool-3', target: 'llm-2' },
          { id: 'e6-7', source: 'llm-2', target: 'exit-1' }
        ]
      }
    };

    return scaffolds[type] || scaffolds['customer-support'];
  };

  const handleApplyScaffold = (scaffold: AgentScaffold) => {
    onScaffold(scaffold);
    toast({
      title: 'Scaffold Applied & Saved!',
      description: `${scaffold.name} has been added to your builder and automatically saved`,
    });
  };

  const handlePreviewScaffold = (scaffold: AgentScaffold) => {
    if (onPreview) {
      onPreview(scaffold);
    } else {
      // Show preview in modal
      setShowPreview(scaffold);
    }
  };

  const handleDownloadScaffold = (scaffold: AgentScaffold) => {
    const scaffoldData = {
      name: scaffold.name,
      description: scaffold.description,
      category: scaffold.category,
      nodes: scaffold.nodes,
      connections: scaffold.connections,
      metadata: scaffold.metadata,
      created: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(scaffoldData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scaffold.name.toLowerCase().replace(/\s+/g, '-')}-scaffold.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Scaffold Downloaded!',
      description: `${scaffold.name} configuration has been saved to your downloads`,
    });
  };

  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            AI Agent Architect
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Example Prompts */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            💡 Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExamplePrompt(prompt)}
                className="text-xs h-auto py-1 px-2"
              >
                {prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div className={`flex-1 space-y-2 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>

                  {/* Scaffold Preview */}
                  {message.agentScaffold && (
                    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-sm">Agent Scaffold Ready</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {message.agentScaffold.metadata.complexity}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Nodes:</span>
                          <span className="ml-2 font-medium">{message.agentScaffold.nodes.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Connections:</span>
                          <span className="ml-2 font-medium">{message.agentScaffold.connections.length}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handleApplyScaffold(message.agentScaffold!)}
                          className="w-full gap-2"
                          size="sm"
                        >
                          <Wand2 className="w-4 h-4" />
                          Apply & Auto-Save to Builder
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePreviewScaffold(message.agentScaffold!)}
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleDownloadScaffold(message.agentScaffold!)}
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Message */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 inline-block p-3 rounded-lg">
                    <div className="text-sm">
                      🧠 Analyzing your request and designing the perfect agent...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the agent you want to build..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
