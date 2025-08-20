'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Database,
  FileText,
  Github,
  Globe,
  Hash,
  Calendar,
  Star,
  StarOff,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { RAGChunk, RAGFilter } from './types';
import { cn } from '@/lib/utils';

interface ChunkListProps {
  chunks: RAGChunk[];
  onChunkSelect: (chunk: RAGChunk) => void;
  onChunkPin: (chunkId: string) => void;
  onAddToBasket: (chunk: RAGChunk) => void;
  selectedChunkIds: Set<string>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: RAGFilter;
  onFiltersChange: (filters: RAGFilter) => void;
}

const sourceIcons = {
  pdf: FileText,
  github: Github,
  web: Globe,
  text: FileText,
  markdown: FileText,
};

export default function ChunkList({
  chunks,
  onChunkSelect,
  onChunkPin,
  onAddToBasket,
  selectedChunkIds,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: ChunkListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [hoveredChunk, setHoveredChunk] = useState<string | null>(null);

  // Group chunks by source
  const groupedChunks = chunks.reduce((acc, chunk) => {
    const source = chunk.metadata.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(chunk);
    return acc;
  }, {} as Record<string, RAGChunk[]>);

  const toggleGroup = (source: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(source)) {
      newExpanded.delete(source);
    } else {
      newExpanded.add(source);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, chunk: RAGChunk) => {
    e.dataTransfer.setData('chunk', JSON.stringify(chunk));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chunks..."
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold">Filter by Source</div>
              <DropdownMenuSeparator />
              {['pdf', 'github', 'web', 'text', 'markdown'].map((source) => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={filters.sources?.includes(source) ?? true}
                  onCheckedChange={(checked) => {
                    const newSources = filters.sources || [];
                    if (checked) {
                      onFiltersChange({
                        ...filters,
                        sources: [...newSources, source],
                      });
                    } else {
                      onFiltersChange({
                        ...filters,
                        sources: newSources.filter((s) => s !== source),
                      });
                    }
                  }}
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">Score Threshold</div>
              <DropdownMenuItem
                onClick={() => onFiltersChange({ ...filters, scoreThreshold: 0.8 })}
              >
                High relevance (&gt; 80%)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFiltersChange({ ...filters, scoreThreshold: 0.5 })}
              >
                Medium relevance (&gt; 50%)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFiltersChange({ ...filters, scoreThreshold: undefined })}
              >
                All results
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active Filters */}
        {(filters.sources?.length || filters.scoreThreshold) && (
          <div className="flex flex-wrap gap-2">
            {filters.sources?.map((source) => (
              <Badge key={source} variant="secondary" className="text-xs">
                {source}
              </Badge>
            ))}
            {filters.scoreThreshold && (
              <Badge variant="secondary" className="text-xs">
                Score &gt; {(filters.scoreThreshold * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Chunks List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <AnimatePresence>
            {Object.entries(groupedChunks).map(([source, sourceChunks]) => {
              const Icon = sourceIcons[source as keyof typeof sourceIcons] || Database;
              const isExpanded = expandedGroups.has(source);
              
              return (
                <motion.div
                  key={source}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  {/* Source Header */}
                  <button
                    onClick={() => toggleGroup(source)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{source}</span>
                      <Badge variant="outline" className="text-xs">
                        {sourceChunks.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Chunks */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-2"
                      >
                        {sourceChunks.map((chunk) => (
                          <motion.div
                            key={chunk.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, chunk)}
                            onMouseEnter={() => setHoveredChunk(chunk.id)}
                            onMouseLeave={() => setHoveredChunk(null)}
                            whileHover={{ scale: 1.01 }}
                            className={cn(
                              'relative p-4 rounded-lg border cursor-move transition-all',
                              selectedChunkIds.has(chunk.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50',
                              hoveredChunk === chunk.id && 'shadow-md'
                            )}
                            onClick={() => onChunkSelect(chunk)}
                          >
                            {/* Drag Handle */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>

                            <div className="space-y-2">
                              {/* Chunk Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">
                                    {chunk.metadata.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>Chunk {chunk.metadata.chunkIndex}</span>
                                    {chunk.metadata.score && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" />
                                          {(chunk.metadata.score * 100).toFixed(0)}%
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onChunkPin(chunk.id);
                                    }}
                                  >
                                    {chunk.pinned ? (
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <StarOff className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Chunk Content Preview */}
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {chunk.content}
                              </p>

                              {/* Tags */}
                              {chunk.metadata.tags && chunk.metadata.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {chunk.metadata.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      <Hash className="w-2.5 h-2.5 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              {hoveredChunk === chunk.id && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex justify-end pt-2"
                                >
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddToBasket(chunk);
                                    }}
                                  >
                                    Add to Context
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
