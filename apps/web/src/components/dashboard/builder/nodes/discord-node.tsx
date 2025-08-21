// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare } from 'lucide-react';

function DiscordNode({ data, selected }: NodeProps) {
  const [channel, setChannel] = useState(data.channel || '');
  const [message, setMessage] = useState(data.message || '');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-indigo-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-indigo-500 text-white">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Discord</div>
          <div className="text-xs text-muted-foreground">Send messages</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Channel ID</label>
          <input 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            placeholder="Channel ID"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Message</label>
          <textarea 
            className="w-full px-2 py-1 text-xs border rounded bg-background resize-none"
            rows={2}
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-indigo-500"
      />
    </div>
  );
}

export default memo(DiscordNode);
