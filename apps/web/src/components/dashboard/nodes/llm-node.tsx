// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Bot } from 'lucide-react';
import BaseNode from './base-node';
import { Badge } from '@/components/ui/badge';

const LLMNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Bot className="w-4 h-4 text-white" />}
      label="LLM"
      color="bg-violet-500"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Model</span>
          <Badge variant="secondary" className="text-xs">
            {data.model || 'gpt-4'}
          </Badge>
        </div>
        {data.prompt && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {data.prompt}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

LLMNode.displayName = 'LLMNode';

export default LLMNode;
