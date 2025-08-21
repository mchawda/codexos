// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Code2, Sparkles, Zap, Shield, Brain, GitBranch, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent?: (agent: any) => void;
}

const agentTemplates = [
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    description: 'Automatically reviews pull requests and provides feedback',
    icon: Code2,
    type: 'autonomous',
    nodes: ['input', 'code-analysis', 'review-generation', 'output']
  },
  {
    id: 'doc-generator',
    name: 'Documentation Generator',
    description: 'Generates and updates API documentation from code',
    icon: Sparkles,
    type: 'scheduled',
    nodes: ['input', 'code-parser', 'doc-generator', 'formatter', 'output']
  },
  {
    id: 'bug-triager',
    name: 'Bug Triager',
    description: 'Analyzes and categorizes incoming bug reports',
    icon: Shield,
    type: 'autonomous',
    nodes: ['input', 'issue-parser', 'classifier', 'priority-analyzer', 'output']
  },
  {
    id: 'test-generator',
    name: 'Test Generator',
    description: 'Automatically generates unit tests for your code',
    icon: Terminal,
    type: 'assisted',
    nodes: ['input', 'code-analyzer', 'test-generator', 'validator', 'output']
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Build your own agent from scratch',
    icon: Bot,
    type: 'autonomous',
    nodes: []
  }
];

export function CreateAgentDialog({ open, onOpenChange, onCreateAgent }: CreateAgentDialogProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState<string>('autonomous');
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = agentTemplates.find(t => t.id === templateId);
    if (template && templateId !== 'custom') {
      setAgentName(template.name);
      setAgentDescription(template.description);
      setAgentType(template.type);
    }
  };

  const handleCreateAgent = async () => {
    if (!agentName || !agentDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and description for your agent.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    // Simulate agent creation
    setTimeout(() => {
      const newAgent = {
        id: Date.now().toString(),
        name: agentName,
        description: agentDescription,
        type: agentType,
        status: 'inactive',
        lastRun: 'Never',
        successRate: 0,
        executionCount: 0,
        avgExecutionTime: '0s',
        nodes: agentTemplates.find(t => t.id === selectedTemplate)?.nodes.length || 0,
        version: 'v1.0.0'
      };

      if (onCreateAgent) {
        onCreateAgent(newAgent);
      }

      toast({
        title: "Agent Created",
        description: `${agentName} has been created successfully!`,
      });

      // Reset form
      setSelectedTemplate('');
      setAgentName('');
      setAgentDescription('');
      setAgentType('autonomous');
      setIsCreating(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Agent</DialogTitle>
          <DialogDescription>
            Choose a template or start from scratch to create your AI agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div>
            <Label className="text-base mb-3 block">Choose a Template</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {agentTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left hover:bg-accent/5 ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedTemplate === template.id 
                          ? 'bg-primary/10' 
                          : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Configuration */}
          {selectedTemplate && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea
                  id="agent-description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Describe what your agent does..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-type">Agent Type</Label>
                <Select value={agentType} onValueChange={setAgentType}>
                  <SelectTrigger id="agent-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autonomous">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20">
                          Autonomous
                        </Badge>
                        <span className="text-xs text-muted-foreground">Runs independently</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="assisted">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Assisted
                        </Badge>
                        <span className="text-xs text-muted-foreground">Requires user input</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Scheduled
                        </Badge>
                        <span className="text-xs text-muted-foreground">Runs on schedule</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedTemplate !== 'custom' && (
                <div className="space-y-2">
                  <Label>Workflow Preview</Label>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {agentTemplates.find(t => t.id === selectedTemplate)?.nodes.map((node, index) => (
                        <div key={node} className="flex items-center">
                          <div className="px-3 py-1.5 rounded-md bg-background border text-xs font-medium whitespace-nowrap">
                            {node}
                          </div>
                          {index < (agentTemplates.find(t => t.id === selectedTemplate)?.nodes.length || 0) - 1 && (
                            <Zap className="w-4 h-4 mx-2 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAgent} 
            disabled={!selectedTemplate || isCreating}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
