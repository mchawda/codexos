// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Database, 
  Settings, 
  ChevronRight, 
  Search, 
  Package, 
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RAGNodeData {
  // Context Configuration
  contextItems?: number;
  searchQuery?: string;
  template?: string;
  embeddingModel?: string;
  vectorStore?: string;
  
  // Retrieval Settings
  topK?: number;
  scoreThreshold?: number;
  reranking?: boolean;
  hybridSearch?: boolean;
  
  // Filters
  filters?: {
    sources?: string[];
    documentTypes?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
    tags?: string[];
  };
  
  // Status
  status?: 'idle' | 'searching' | 'ready' | 'error';
  lastUpdated?: string;
  indexStatus?: 'healthy' | 'syncing' | 'error';
  
  // Callbacks
  onOpenComposer?: () => void;
  onConfigure?: () => void;
}

function RAGNode({ data, selected }: NodeProps<RAGNodeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const hasContext = (data.contextItems || 0) > 0;
  const status = data.status || 'idle';
  const indexStatus = data.indexStatus || 'healthy';

  // Status indicator component
  const getStatusIcon = () => {
    switch (status) {
      case 'searching':
        return <Clock className="w-3 h-3 animate-pulse text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Database className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getIndexStatusColor = () => {
    switch (indexStatus) {
      case 'healthy':
        return 'bg-green-500';
      case 'syncing':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getNodeBorderColor = () => {
    if (selected) return 'border-primary shadow-primary/20';
    if (status === 'error') return 'border-red-500/50 hover:border-red-500/70';
    if (status === 'ready') return 'border-green-500/50 hover:border-green-500/70';
    return 'border-border hover:border-orange-500/50';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative px-4 py-3 shadow-lg rounded-lg border-2 bg-background transition-all',
        getNodeBorderColor()
      )}
      style={{ minWidth: '260px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />
      
      {/* Index Status Indicator */}
      <div className={cn('absolute top-2 right-2 w-2 h-2 rounded-full', getIndexStatusColor())} />
      
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white relative">
              <Brain className="w-5 h-5" />
              {status === 'searching' && (
                <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold flex items-center gap-2">
                RAG Engine
                {getStatusIcon()}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.embeddingModel || 'OpenAI Ada-002'}
              </div>
            </div>
          </div>
          
          {isHovered && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 animate-in fade-in duration-200"
                onClick={() => data.onConfigure?.()}
                title="Configure Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 animate-in fade-in duration-200"
                onClick={() => data.onOpenComposer?.()}
                title="Open RAG Composer"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Configuration Display */}
        <div className="space-y-2">
          {/* Retrieval Settings */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="text-muted-foreground">Retrieval</span>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs h-5">
                Top-{data.topK || 5}
              </Badge>
              {data.reranking && (
                <Badge variant="outline" className="text-xs h-5">
                  <Zap className="w-2 h-2 mr-1" />
                  Rerank
                </Badge>
              )}
              {data.hybridSearch && (
                <Badge variant="outline" className="text-xs h-5">
                  Hybrid
                </Badge>
              )}
            </div>
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
                  <span className="truncate max-w-[180px]">{data.searchQuery}</span>
                </div>
              )}

              {data.template && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Template: </span>
                  <span className="text-primary font-medium">{data.template}</span>
                </div>
              )}

              {/* Score Threshold */}
              {data.scoreThreshold && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Min Score: </span>
                  <span className="font-medium">{data.scoreThreshold}</span>
                </div>
              )}

              {/* Active Filters */}
              {data.filters && (
                <div className="space-y-1">
                  {data.filters.sources && data.filters.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">Sources:</span>
                      </div>
                      {data.filters.sources.slice(0, 2).map((source) => (
                        <Badge key={source} variant="outline" className="text-xs h-5">
                          {source}
                        </Badge>
                      ))}
                      {data.filters.sources.length > 2 && (
                        <Badge variant="outline" className="text-xs h-5">
                          +{data.filters.sources.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {data.filters.tags && data.filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {data.filters.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs h-5">
                          #{tag}
                        </Badge>
                      ))}
                      {data.filters.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs h-5">
                          +{data.filters.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Last Updated */}
              {data.lastUpdated && (
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground mb-3">No context configured</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 w-full"
                  onClick={() => data.onOpenComposer?.()}
                >
                  <Search className="w-3 h-3 mr-1" />
                  Configure Context
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 w-full"
                  onClick={() => data.onConfigure?.()}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Performance Indicator */}
        {status === 'ready' && data.scoreThreshold && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Quality</span>
            <div className="flex items-center gap-1">
              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${Math.min(data.scoreThreshold * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(data.scoreThreshold * 100)}%</span>
            </div>
          </div>
        )}

        {/* Action Hint */}
        {isHovered && hasContext && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -right-2 top-1/2 -translate-y-1/2"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-1 shadow-lg">
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
