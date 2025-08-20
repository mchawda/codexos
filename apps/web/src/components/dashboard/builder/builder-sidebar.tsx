'use client';

import { useState } from 'react';
import { 
  Bot, 
  Brain,
  Wrench,
  Database,
  Eye,
  Mic,
  Zap,
  GitBranch,
  LogOut,
  Plus,
  Search,
  MessageSquare,
  Globe,
  FileText,
  Mail,
  Calendar,
  BarChart3,
  Shield,
  Cloud,
  Code,
  Users,
  Settings2,
  ChevronRight,
  ChevronLeft,
  Hash,
  FileJson,
  Clock,
  Repeat,
  Layers,
  Filter,
  Moon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const appIntegrations = [
  {
    type: 'openai',
    label: 'OpenAI (ChatGPT, Whisper, DALL-E)',
    icon: Brain,
    color: 'bg-emerald-500',
    description: 'AI models for text, speech, and images',
    category: 'ai',
    popular: true
  },
  {
    type: 'anthropic',
    label: 'Anthropic Claude',
    icon: MessageSquare,
    color: 'bg-orange-500',
    description: 'Claude AI Assistant',
    category: 'ai',
    popular: true
  },
  {
    type: 'sheets',
    label: 'Google Sheets',
    icon: FileText,
    color: 'bg-green-500',
    description: 'Read, write, and update spreadsheets',
    category: 'productivity',
    popular: true
  },
  {
    type: 'gmail',
    label: 'Gmail',
    icon: Mail,
    color: 'bg-red-500',
    description: 'Send emails and manage inbox',
    category: 'communication'
  },
  {
    type: 'slack',
    label: 'Slack',
    icon: Hash,
    color: 'bg-purple-500',
    description: 'Send messages to channels',
    category: 'communication',
    popular: true
  },
  {
    type: 'webhook',
    label: 'Webhooks',
    icon: Globe,
    color: 'bg-blue-500',
    description: 'Receive and send HTTP requests',
    category: 'developer',
    builtin: true
  },
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    color: 'bg-indigo-500',
    description: 'Query and update databases',
    category: 'data'
  },
  {
    type: 'http',
    label: 'HTTP Request',
    icon: Globe,
    color: 'bg-cyan-500',
    description: 'Make API calls',
    category: 'developer',
    builtin: true
  },
  {
    type: 'calendar',
    label: 'Google Calendar',
    icon: Calendar,
    color: 'bg-blue-600',
    description: 'Create and manage events',
    category: 'productivity'
  },
  {
    type: 'json',
    label: 'JSON',
    icon: FileJson,
    color: 'bg-emerald-500',
    description: 'Parse and create JSON',
    category: 'developer',
    builtin: true
  }
];

const flowControlNodes = [
  {
    type: 'router',
    label: 'Router',
    icon: GitBranch,
    color: 'bg-purple-500',
    description: 'Route based on conditions'
  },
  {
    type: 'iterator',
    label: 'Iterator', 
    icon: Repeat,
    color: 'bg-yellow-500',
    description: 'Process array items'
  },
  {
    type: 'aggregator',
    label: 'Aggregator',
    icon: Layers,
    color: 'bg-green-500',
    description: 'Merge multiple bundles'
  },
  {
    type: 'flowControl',
    label: 'Flow control',
    icon: Filter,
    color: 'bg-red-500',
    description: 'Filter and control flow'
  },
  {
    type: 'tools',
    label: 'Tools',
    icon: Wrench,
    color: 'bg-gray-600',
    description: 'Text, math, date tools'
  },
  {
    type: 'sleep',
    label: 'Sleep',
    icon: Moon,
    color: 'bg-blue-700',
    description: 'Delay execution'
  }
];

interface BuilderSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function BuilderSidebar({ collapsed = false, onToggleCollapse }: BuilderSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('apps');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredApps = appIntegrations.filter(app => 
    app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFlowControl = flowControlNodes.filter(node => 
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full transition-all duration-300 relative`}>
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg"
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      {collapsed ? (
        <div className="p-2 border-b space-y-2">
          <Button
            variant={activeTab === 'apps' ? 'secondary' : 'ghost'}
            size="icon"
            className="w-full"
            onClick={() => setActiveTab('apps')}
            title="Apps"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTab === 'flow' ? 'secondary' : 'ghost'}
            size="icon"
            className="w-full"
            onClick={() => setActiveTab('flow')}
            title="Flow Control"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTab === 'basic' ? 'secondary' : 'ghost'}
            size="icon"
            className="w-full"
            onClick={() => setActiveTab('basic')}
            title="Basic Nodes"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps or modules"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="flow">Flow</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className={collapsed ? "p-2" : "p-4"}>
          {collapsed ? (
            // Collapsed view - icons only
            <div className="space-y-2">
              {activeTab === 'apps' && filteredApps.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.type}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-accent cursor-move transition-colors group"
                    onDragStart={(event) => onDragStart(event, app.type)}
                    draggable
                    title={app.label}
                  >
                    <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                );
              })}
              {activeTab === 'flow' && filteredFlowControl.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-accent cursor-move transition-colors group"
                    onDragStart={(event) => onDragStart(event, node.type)}
                    draggable
                    title={node.label}
                  >
                    <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                );
              })}
              {activeTab === 'basic' && [
                { type: 'entry', label: 'Entry', icon: Bot, color: 'bg-green-500' },
                { type: 'llm', label: 'LLM', icon: Brain, color: 'bg-purple-500' },
                { type: 'exit', label: 'Exit', icon: LogOut, color: 'bg-red-500' },
              ].map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-accent cursor-move transition-colors"
                    onDragStart={(event) => onDragStart(event, node.type)}
                    draggable
                    title={node.label}
                  >
                    <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Expanded view - full content
            <>
              {activeTab === 'apps' && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Apps in scenario
                  </p>
              {filteredApps.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.type}
                    className="flex items-center p-3 rounded-lg hover:bg-accent cursor-move transition-colors group"
                    onDragStart={(event) => onDragStart(event, app.type)}
                    draggable
                  >
                    <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{app.label}</p>
                        {app.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                        {app.builtin && <Badge variant="outline" className="text-xs">Built-in</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{app.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
              
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {}}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another app
              </Button>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Flow Control
              </p>
              {filteredFlowControl.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    className="flex items-center p-3 rounded-lg hover:bg-accent cursor-move transition-colors group"
                    onDragStart={(event) => onDragStart(event, node.type)}
                    draggable
                  >
                    <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{node.label}</p>
                      <p className="text-xs text-muted-foreground">{node.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Basic Nodes
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'entry', label: 'Entry', icon: Bot, color: 'bg-green-500' },
                    { type: 'llm', label: 'LLM', icon: Brain, color: 'bg-purple-500' },
                    { type: 'exit', label: 'Exit', icon: LogOut, color: 'bg-red-500' },
                  ].map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.type}
                        className="flex flex-col items-center p-3 border rounded-lg cursor-move hover:bg-accent/50 transition-colors"
                        onDragStart={(event) => onDragStart(event, node.type)}
                        draggable
                      >
                        <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium">{node.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}