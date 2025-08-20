'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Settings, ChevronRight, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RAGNodeData {
  contextItems?: number;
  searchQuery?: string;
  template?: string;
  filters?: {
    sources?: string[];
    scoreThreshold?: number;
  };
  onOpenComposer?: () => void;
}

function RAGNode({ data, selected }: NodeProps<RAGNodeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const hasContext = (data.contextItems || 0) > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative px-4 py-3 shadow-lg rounded-lg border-2 bg-background transition-all ${
        selected ? 'border-primary shadow-primary/20' : 'border-border hover:border-orange-500/50'
      }`}
      style={{ minWidth: '220px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />
      
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full w-10 h-10 flex items-center justify-center bg-orange-500 text-white">
              <Database className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold">RAG Engine</div>
              <div className="text-xs text-muted-foreground">Context Retrieval</div>
            </div>
          </div>
          {isHovered && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 animate-in fade-in duration-200"
              onClick={() => data.onOpenComposer?.()}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Context Status */}
        {hasContext ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Context Ready</span>
              <Badge variant="secondary" className="text-xs">
                <Package className="w-3 h-3 mr-1" />
                {data.contextItems} chunks
              </Badge>
            </div>
            
            {data.searchQuery && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Search className="w-3 h-3" />
                <span className="truncate">{data.searchQuery}</span>
              </div>
            )}

            {data.template && (
              <div className="text-xs">
                <span className="text-muted-foreground">Template: </span>
                <span className="text-primary">{data.template}</span>
              </div>
            )}

            {data.filters?.sources && data.filters.sources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.filters.sources.map((source) => (
                  <Badge key={source} variant="outline" className="text-xs h-5">
                    {source}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-2">No context configured</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => data.onOpenComposer?.()}
            >
              <Search className="w-3 h-3 mr-1" />
              Configure RAG
            </Button>
          </div>
        )}

        {/* Action Hint */}
        {isHovered && hasContext && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -right-2 top-1/2 -translate-y-1/2"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <ChevronRight className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500"
      />
    </motion.div>
  );
}

export default memo(RAGNode);
