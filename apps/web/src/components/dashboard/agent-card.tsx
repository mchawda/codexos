'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Clock, 
  Zap, 
  TrendingUp, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit, 
  Eye,
  Play,
  Pause,
  GitBranch,
  ChevronDown,
  Link as LinkIcon,
  GitCompare,
  History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Agent, AgentVersion, LinkedAgent } from '@/lib/stores/agent-store';

interface AgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  onSelect?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onToggleStatus?: (agent: Agent) => void;
  onVersionChange?: (agent: Agent, version: AgentVersion) => void;
}

export function AgentCard({
  agent,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onVersionChange,
}: AgentCardProps) {
  const { toast } = useToast();
  const [showLinkedAgents, setShowLinkedAgents] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case 'running':
        return <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />;
      case 'inactive':
        return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
      case 'error':
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
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

  const getAgentTypeColor = (agentType: string) => {
    switch (agentType) {
      case 'LLM':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Tool':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'RAG':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'Trigger Agent':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = agent.versions.find(v => v.id === versionId);
    if (version && onVersionChange) {
      onVersionChange(agent, version);
      toast({
        title: "Version Loaded",
        description: `Switched to ${version.version}`,
      });
    }
  };

  const handleLinkedAgentsClick = () => {
    setShowLinkedAgents(true);
  };

  const handleVersionsClick = () => {
    setShowVersions(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative group cursor-pointer rounded-xl border transition-all duration-200 hover:shadow-lg',
          isSelected
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-border/50 hover:border-border hover:bg-muted/5'
        )}
        onClick={() => onSelect?.(agent)}
      >
        <div className="p-6">
          {/* Header with Version Control */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <Bot className="h-5 w-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{agent.name}</h3>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(agent.status)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(agent)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(agent)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVersionsClick}>
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(agent)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Version Control */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Version:</span>
              <Select
                value={agent.versions?.find(v => v.isCurrent)?.id || ''}
                onValueChange={handleVersionChange}
                onOpenChange={setShowVersions}
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agent.versions?.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agent.versions && agent.versions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleVersionsClick}
                >
                  <GitCompare className="h-3 w-3 mr-1" />
                  Diff
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getTypeColor(agent.type)}`}
              >
                {agent.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${getAgentTypeColor(agent.agentType)}`}
              >
                {agent.agentType}
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
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

          {/* Linked Agents */}
          {agent.linkedAgents && agent.linkedAgents.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Linked Agents ({agent.linkedAgents.length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleLinkedAgentsClick}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.linkedAgents.slice(0, 3).map((linkedAgent) => (
                  <Badge key={linkedAgent.id} variant="secondary" className="text-xs">
                    {linkedAgent.name}
                  </Badge>
                ))}
                {agent.linkedAgents.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.linkedAgents.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(agent);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(agent);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {agent.status === 'active' || agent.status === 'running' ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus?.(agent);
                  }}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus?.(agent);
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>

          {/* Footer Info */}
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
      </motion.div>

      {/* Linked Agents Modal */}
      <Dialog open={showLinkedAgents} onOpenChange={setShowLinkedAgents}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Linked Agents - {agent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {agent.linkedAgents?.map((linkedAgent) => (
              <div key={linkedAgent.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{linkedAgent.name}</p>
                    <p className="text-sm text-muted-foreground">{linkedAgent.type}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {linkedAgent.relationship}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Versions Modal */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History - {agent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {agent.versions?.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{version.version}</p>
                    <p className="text-sm text-muted-foreground">{version.description}</p>
                    <p className="text-xs text-muted-foreground">{version.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {version.isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleVersionChange(version.id);
                      setShowVersions(false);
                    }}
                  >
                    Load
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
