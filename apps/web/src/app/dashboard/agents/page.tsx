// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreateAgentDialog } from '@/components/dashboard/create-agent-dialog';
import { AgentToolbar } from '@/components/dashboard/agent-toolbar';
import { AgentCard } from '@/components/dashboard/agent-card';
import { AgentGraphView } from '@/components/dashboard/agent-graph-view';
import { useAgentStore } from '@/lib/stores/agent-store';
import type { Agent, AgentVersion } from '@/lib/stores/agent-store';
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

export default function AgentsPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { 
    agents, 
    setAgents, 
    selectedAgent, 
    selectAgent, 
    showGraphView, 
    filteredAgents 
  } = useAgentStore();

  // Initialize with mock data
  useEffect(() => {
    const mockAgents = [
      {
        id: '1',
        name: 'Code Review Assistant',
        description: 'Automatically reviews pull requests and provides feedback',
        type: 'autonomous' as const,
        agentType: 'LLM' as const,
        status: 'active' as const,
        lastRun: '2 minutes ago',
        successRate: 98.5,
        executionCount: 1247,
        avgExecutionTime: '45s',
        nodes: 12,
        version: 'v2.1.0',
        linkedAgents: [
          {
            id: '2',
            name: 'Documentation Generator',
            type: 'scheduled',
            relationship: 'triggers' as const,
          },
          {
            id: '3',
            name: 'Bug Triager',
            type: 'autonomous',
            relationship: 'depends_on' as const,
          }
        ],
        versions: [
          {
            id: 'v1',
            version: 'v2.1.0',
            createdAt: '2024-01-15',
            description: 'Latest stable version with improved code analysis',
            flowData: {},
            isCurrent: true,
          },
          {
            id: 'v2',
            version: 'v2.0.5',
            createdAt: '2024-01-10',
            description: 'Previous version with basic functionality',
            flowData: {},
            isCurrent: false,
          }
        ]
      },
      {
        id: '2',
        name: 'Documentation Generator',
        description: 'Generates and updates API documentation from code',
        type: 'scheduled' as const,
        agentType: 'Tool' as const,
        status: 'running' as const,
        lastRun: 'Running now',
        successRate: 100,
        executionCount: 89,
        avgExecutionTime: '2m 15s',
        nodes: 8,
        version: 'v1.3.2',
        linkedAgents: [
          {
            id: '1',
            name: 'Code Review Assistant',
            type: 'autonomous',
            relationship: 'triggered_by' as const,
          }
        ],
        versions: [
          {
            id: 'v1',
            version: 'v1.3.2',
            createdAt: '2024-01-12',
            description: 'Current version with enhanced doc generation',
            flowData: {},
            isCurrent: true,
          }
        ]
      },
      {
        id: '3',
        name: 'Bug Triager',
        description: 'Analyzes and categorizes incoming bug reports',
        type: 'autonomous' as const,
        agentType: 'RAG' as const,
        status: 'inactive' as const,
        lastRun: '1 hour ago',
        successRate: 92.3,
        executionCount: 456,
        avgExecutionTime: '30s',
        nodes: 15,
        version: 'v1.0.0',
        linkedAgents: [
          {
            id: '1',
            name: 'Code Review Assistant',
            type: 'autonomous',
            relationship: 'triggers' as const,
          }
        ],
        versions: [
          {
            id: 'v1',
            version: 'v1.0.0',
            createdAt: '2024-01-01',
            description: 'Initial release version',
            flowData: {},
            isCurrent: true,
          }
        ]
      },
      {
        id: '4',
        name: 'Dependency Updater',
        description: 'Monitors and updates project dependencies safely',
        type: 'scheduled' as const,
        agentType: 'Trigger Agent' as const,
        status: 'error' as const,
        lastRun: '3 hours ago',
        successRate: 87.5,
        executionCount: 234,
        avgExecutionTime: '5m 30s',
        nodes: 20,
        version: 'v1.5.1',
        linkedAgents: [],
        versions: [
          {
            id: 'v1',
            version: 'v1.5.1',
            createdAt: '2024-01-08',
            description: 'Latest version with security patches',
            flowData: {},
            isCurrent: true,
          }
        ]
      }
    ];

    setAgents(mockAgents as any);
  }, [setAgents]);

  const handleCreateAgent = (newAgent: any) => {
    // This would be handled by the store in a real implementation
    toast({
      title: "Agent Created",
      description: `${newAgent.name} has been created successfully.`,
    });
  };

  const handleEditAgent = (agent: any) => {
    toast({
      title: "Edit Agent",
      description: `Opening editor for ${agent.name}...`,
    });
  };

  const handleDeleteAgent = (agent: any) => {
    toast({
      title: "Delete Agent",
      description: `Are you sure you want to delete ${agent.name}?`,
      variant: "destructive",
    });
  };

  const handleDuplicateAgent = (agent: any) => {
    toast({
      title: "Agent Copied",
      description: `${agent.name} has been duplicated.`,
    });
  };

  const handleToggleStatus = (agent: Agent) => {
    const updatedAgents = agents.map(a => 
      a.id === agent.id 
        ? { 
            ...a, 
            status: (a.status === 'active' || a.status === 'running') ? 'inactive' as const : 'active' as const
          } 
        : a
    );
    setAgents(updatedAgents);
    
    const action = agent.status === 'active' || agent.status === 'running' ? 'paused' : 'started';
    toast({
      title: `Agent ${action}`,
      description: `${agent.name} has been ${action} successfully.`,
    });
  };

  const handleVersionChange = (agent: Agent, version: AgentVersion) => {
    // In a real implementation, this would load the flow from the version
    toast({
      title: "Version Loaded",
      description: `Loaded ${version.version} for ${agent.name}`,
    });
  };

  const filteredAgentsList = filteredAgents();

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
          <Button 
            variant="outline" 
            onClick={() => {
              toast({
                title: "Import Agent",
                description: "Import functionality coming soon!",
              });
            }}
          >
            <Code className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Link href="/dashboard/builder">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </Link>
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

      {/* Toolbar with Filters */}
      <AgentToolbar />

      {/* Content Area */}
      {showGraphView ? (
        <AgentGraphView />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgentsList.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent?.id === agent.id}
              onSelect={selectAgent}
              onEdit={handleEditAgent}
              onDelete={handleDeleteAgent}
              onDuplicate={handleDuplicateAgent}
              onToggleStatus={handleToggleStatus}
              onVersionChange={handleVersionChange}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAgentsList.length === 0 && (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <div className="text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No agents found</p>
            <p className="text-sm">Try adjusting your filters or create a new agent</p>
          </div>
        </div>
      )}

      {/* Create Agent Dialog */}
      <CreateAgentDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateAgent={handleCreateAgent}
      />
    </div>
  );
}
