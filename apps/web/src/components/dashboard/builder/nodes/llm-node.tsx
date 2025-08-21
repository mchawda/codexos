// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain } from 'lucide-react';

function LLMNode({ data, selected }: NodeProps) {
  const [model, setModel] = useState(data.model || 'gpt-4');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-500 text-white">
          <Brain className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">LLM</div>
          <div className="text-xs text-muted-foreground">Language Model</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Model</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-4">gpt-4</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="claude-3">claude-3</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Prompt</label>
          <textarea 
            className="w-full px-2 py-1 text-xs border rounded bg-background resize-none"
            rows={2}
            placeholder="Enter prompt..."
            defaultValue={data.prompt}
          />
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

export default memo(LLMNode);
