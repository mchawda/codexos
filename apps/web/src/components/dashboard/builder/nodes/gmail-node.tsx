// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Mail } from 'lucide-react';

function GmailNode({ data, selected }: NodeProps) {
  const [to, setTo] = useState(data.to || '');
  const [subject, setSubject] = useState(data.subject || '');

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
          <Mail className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Gmail</div>
          <div className="text-xs text-muted-foreground">Send emails</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <input 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            placeholder="email@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Subject</label>
          <input 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            placeholder="Email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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

export default memo(GmailNode);
