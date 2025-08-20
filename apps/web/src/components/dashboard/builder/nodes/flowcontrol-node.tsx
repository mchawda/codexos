'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Filter } from 'lucide-react';

function FlowControlNode({ data, selected }: NodeProps) {
  const [filterExpression, setFilterExpression] = useState(data.filterExpression || '');
  const [action, setAction] = useState(data.action || 'continue');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-red-500 text-white">
          <Filter className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Flow Control</div>
          <div className="text-xs text-muted-foreground">Filter and control flow</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Action</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="continue">Continue if true</option>
            <option value="stop">Stop if true</option>
            <option value="error">Throw error</option>
            <option value="ignore">Ignore errors</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Filter Expression</label>
          <textarea 
            className="w-full px-2 py-1 text-xs border rounded bg-background resize-none font-mono"
            rows={2}
            placeholder="value > 100"
            value={filterExpression}
            onChange={(e) => setFilterExpression(e.target.value)}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-red-500"
      />
    </div>
  );
}

export default memo(FlowControlNode);
