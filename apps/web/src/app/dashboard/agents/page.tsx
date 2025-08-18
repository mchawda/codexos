'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Plus, 
  Play, 
  Pause,
  Settings,
  Copy,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  GitBranch,
  Cpu
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'autonomous' | 'assisted' | 'scheduled';
  status: 'active' | 'inactive' | 'error' | 'running';
  lastRun: string;
  successRate: number;
  executionCount: number;
  avgExecutionTime: string;
  nodes: number;
  version: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Code Review Assistant',
      description: 'Automatically reviews pull requests and provides feedback',
      type: 'autonomous',
      status: 'active',
      lastRun: '2 minutes ago',
      successRate: 98.5,
      executionCount: 1247,
      avgExecutionTime: '45s',
      nodes: 12,
      version: 'v2.1.0'
    },
    {
      id: '2',
      name: 'Documentation Generator',
      description: 'Generates and updates API documentation from code',
      type: 'scheduled',
      status: 'running',
      lastRun: 'Running now',
      successRate: 100,
      executionCount: 89,
      avgExecutionTime: '2m 15s',
      nodes: 8,
      version: 'v1.3.2'
    },
    {
      id: '3',
      name: 'Bug Triager',
      description: 'Analyzes and categorizes incoming bug reports',
      type: 'autonomous',
      status: 'inactive',
      lastRun: '1 hour ago',
      successRate: 92.3,
      executionCount: 456,
      avgExecutionTime: '30s',
      nodes: 15,
      version: 'v1.0.0'
    },
    {
      id: '4',
      name: 'Dependency Updater',
      description: 'Monitors and updates project dependencies safely',
      type: 'scheduled',
      status: 'error',
      lastRun: '3 hours ago',
      successRate: 87.5,
      executionCount: 234,
      avgExecutionTime: '5m 30s',
      nodes: 20,
      version: 'v1.5.1'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'autonomous':
        return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'assisted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'scheduled':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
          <p className="text-muted-foreground">
            Manage and monitor your autonomous AI agents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Code className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Agents
              </p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <Bot className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Agents
              </p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.status === 'active' || a.status === 'running').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Executions
              </p>
              <p className="text-2xl font-bold">
                {agents.reduce((acc, a) => acc + a.executionCount, 0).toLocaleString()}
              </p>
            </div>
            <Play className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Success Rate
              </p>
              <p className="text-2xl font-bold">
                {(agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500/20" />
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="glass-dark rounded-xl p-6 hover:bg-accent/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                  <Bot className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(agent.status)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getTypeColor(agent.type)}`}
              >
                {agent.type}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {agent.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-sm font-semibold">{agent.successRate}%</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Executions</p>
                <p className="text-sm font-semibold">{agent.executionCount}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Avg Time</p>
                <p className="text-sm font-semibold">{agent.avgExecutionTime}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Nodes</p>
                <p className="text-sm font-semibold">{agent.nodes}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                {agent.status === 'active' || agent.status === 'running' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{agent.lastRun}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                <span>{agent.version}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
