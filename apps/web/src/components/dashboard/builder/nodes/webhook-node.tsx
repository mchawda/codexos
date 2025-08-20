'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Webhook } from 'lucide-react';

function WebhookNode({ data, selected }: NodeProps) {
  const [endpoint, setEndpoint] = useState(data.endpoint || '');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-orange-500 text-white">
          <Webhook className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Webhook</div>
          <div className="text-xs text-muted-foreground">HTTP endpoint</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Endpoint URL</label>
          <input 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            placeholder="https://api.example.com/webhook"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500"
      />
    </div>
  );
}

export default memo(WebhookNode);
