'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Mic } from 'lucide-react';
import BaseNode from './base-node';

const VoiceNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Mic className="w-4 h-4 text-white" />}
      label="Voice"
      color="bg-teal-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "Process voice and audio input"}
      </div>
    </BaseNode>
  );
});

VoiceNode.displayName = 'VoiceNode';

export default VoiceNode;