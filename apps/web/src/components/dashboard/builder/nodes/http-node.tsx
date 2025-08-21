// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';

function HttpNode({ data, selected }: NodeProps) {
  const [method, setMethod] = useState(data.method || 'GET');
  const [url, setUrl] = useState(data.url || '');
  const [headers, setHeaders] = useState(data.headers || '');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-cyan-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-cyan-500 text-white">
          <Globe className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">HTTP Request</div>
          <div className="text-xs text-muted-foreground">Make API calls</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <select 
            className="px-2 py-1 text-xs border rounded bg-background"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <input 
            className="flex-1 px-2 py-1 text-xs border rounded bg-background"
            placeholder="https://api.example.com/endpoint"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Headers (JSON)</label>
          <textarea 
            className="w-full px-2 py-1 text-xs border rounded bg-background resize-none font-mono"
            rows={2}
            placeholder='{"Authorization": "Bearer token"}'
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-cyan-500"
      />
    </div>
  );
}

export default memo(HttpNode);
