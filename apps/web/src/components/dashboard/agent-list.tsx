// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { Bot, Clock, Zap, TrendingUp, MoreVertical, Copy, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'customer-support' | 'code-generation' | 'data-analysis' | 'content-creation';
  status: 'active' | 'draft' | 'archived';
  lastRun: string;
  successRate: number;
  executions: number;
}

// Mock data
const agents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support tickets',
    type: 'customer-support',
    status: 'active',
    lastRun: '2 hours ago',
    successRate: 98.5,
    executions: 1250,
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    description: 'Analyzes code quality and suggests improvements',
    type: 'code-generation',
    status: 'active',
    lastRun: '5 hours ago',
    successRate: 95.2,
    executions: 832,
  },
  {
    id: '3',
    name: 'Data Pipeline Builder',
    description: 'Creates and optimizes data processing workflows',
    type: 'data-analysis',
    status: 'draft',
    lastRun: 'Never',
    successRate: 0,
    executions: 0,
  },
];

const typeColors = {
  'customer-support': 'from-blue-500 to-cyan-500',
  'code-generation': 'from-violet-500 to-purple-500',
  'data-analysis': 'from-emerald-500 to-green-500',
  'content-creation': 'from-amber-500 to-orange-500',
};

interface AgentListProps {
  selectedAgent: string | null;
  onSelectAgent: (agentId: string) => void;
}

export default function AgentList({ selectedAgent, onSelectAgent }: AgentListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Agents</h3>
      
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div
            className={cn(
              'relative group cursor-pointer rounded-lg border transition-all duration-200',
              selectedAgent === agent.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border/50 hover:border-border hover:bg-muted/5'
            )}
            onClick={() => onSelectAgent(agent.id)}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3">
                  <div className={cn('p-2 rounded-lg bg-gradient-to-r', typeColors[agent.type])}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={agent.status === 'active' ? 'success' : agent.status === 'draft' ? 'warning' : 'outline'}
                  className="text-xs"
                >
                  {agent.status}
                </Badge>
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {agent.lastRun}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {agent.executions > 0 && (
                <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center text-xs">
                    <Zap className="w-3 h-3 mr-1 text-amber-500" />
                    <span>{agent.executions} runs</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                    <span>{agent.successRate}% success</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
