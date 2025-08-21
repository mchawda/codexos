// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Agent {
  id: string;
  name: string;
  description: string;
}

function TriggerAgentNode({ data, selected }: NodeProps) {
  const [agentId, setAgentId] = useState(data.agentId || '');
  const [inputData, setInputData] = useState(data.inputData || '');
  const [contextData, setContextData] = useState(data.contextData || '');
  const [mode, setMode] = useState(data.mode || 'autonomous');
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  // Fetch available agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // In a real implementation, this would fetch from your API
        // For now, using mock data
        const mockAgents: Agent[] = [
          { id: 'bug-triager', name: 'Bug Triager', description: 'Analyzes and categorizes bug reports' },
          { id: 'code-reviewer', name: 'Code Reviewer', description: 'Reviews code quality and suggests improvements' },
          { id: 'data-analyzer', name: 'Data Analyzer', description: 'Processes and analyzes data sets' },
          { id: 'content-writer', name: 'Content Writer', description: 'Generates and edits content' },
        ];
        setAvailableAgents(mockAgents);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    fetchAgents();
  }, []);

  // Update data when inputs change
  useEffect(() => {
    if (data.onChange) {
      data.onChange({
        agentId,
        inputData,
        contextData,
        mode,
      });
    }
  }, [agentId, inputData, contextData, mode, data.onChange]);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[280px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-500 text-white">
          <Bot className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Trigger Agent</div>
          <div className="text-xs text-muted-foreground">Execute another agent</div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Agent Selection */}
        <div>
          <Label className="text-xs text-muted-foreground">Agent</Label>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-xs text-muted-foreground">{agent.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input Data */}
        <div>
          <Label className="text-xs text-muted-foreground">Input</Label>
          <Textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Data to pass to the agent"
            className="w-full h-16 text-xs resize-none"
          />
        </div>

        {/* Context */}
        <div>
          <Label className="text-xs text-muted-foreground">Context</Label>
          <Textarea
            value={contextData}
            onChange={(e) => setContextData(e.target.value)}
            placeholder="Additional context (optional)"
            className="w-full h-16 text-xs resize-none"
          />
        </div>

        {/* Mode */}
        <div>
          <Label className="text-xs text-muted-foreground">Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="autonomous">Autonomous</SelectItem>
              <SelectItem value="supervised">Supervised</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500"
      />
    </div>
  );
}

export default memo(TriggerAgentNode);
