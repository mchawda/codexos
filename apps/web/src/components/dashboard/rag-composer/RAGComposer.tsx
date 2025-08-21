// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Upload,
  Settings,
  Brain,
  Sparkles,
  Eye,
  EyeOff,
  Layout,
  LayoutGrid,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import ChunkList from './ChunkList';
import ContextBasket from './ContextBasket';
import IngestProgress from './IngestProgress';
import { RAGChunk, ContextBasketItem, RAGFilter, IngestProgress as IngestProgressType } from './types';
import { useToast } from '@/hooks/use-toast';

interface RAGComposerProps {
  onClose?: () => void;
  onExecuteWithAgent?: (agentId: string, context: ContextBasketItem[]) => void;
  initialQuery?: string;
  showAsModal?: boolean;
}

export default function RAGComposer({
  onClose,
  onExecuteWithAgent,
  initialQuery = '',
  showAsModal = false,
}: RAGComposerProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  const [contextBasket, setContextBasket] = useState<ContextBasketItem[]>([]);
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RAGFilter>({});
  const [viewMode, setViewMode] = useState<'split' | 'focus'>('split');
  const [showSettings, setShowSettings] = useState(false);
  const [ingestQueue, setIngestQueue] = useState<IngestProgressType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    // Simulate initial chunks load
    const mockChunks: RAGChunk[] = [
      {
        id: '1',
        content: 'CodexOS provides a comprehensive platform for building intelligent agents with advanced RAG capabilities. The system supports multiple embedding models and vector stores for optimal performance.',
        documentId: 'doc1',
        metadata: {
          source: 'text',
          title: 'CodexOS Documentation',
          chunkIndex: 1,
          score: 0.95,
          tags: ['platform', 'agents', 'rag'],
          createdAt: new Date().toISOString(),
        },
      },
      {
        id: '2',
        content: 'The Agent Builder uses a visual flow-based interface powered by React Flow. Agents can be composed of various nodes including LLM, RAG, Tool, Vision, and Voice nodes.',
        documentId: 'doc1',
        metadata: {
          source: 'text',
          title: 'Agent Builder Guide',
          chunkIndex: 2,
          score: 0.87,
          tags: ['builder', 'visual', 'nodes'],
        },
      },
      {
        id: '3',
        content: 'RAG (Retrieval Augmented Generation) enhances agent responses by providing relevant context from your knowledge base. This improves accuracy and reduces hallucinations.',
        documentId: 'doc2',
        metadata: {
          source: 'pdf',
          title: 'AI Best Practices',
          chunkIndex: 5,
          score: 0.92,
          tags: ['rag', 'best-practices', 'accuracy'],
        },
      },
    ];
    
    if (initialQuery) {
      // Simulate search if initial query provided
      setIsSearching(true);
      setTimeout(() => {
        setChunks(mockChunks);
        setIsSearching(false);
      }, 1000);
    } else {
      setChunks(mockChunks);
    }
  }, [initialQuery]);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      // In real app, this would call the API
      // const response = await fetch('/api/rag/search', { ... });
      // const results = await response.json();
      
      // Simulate search delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // For demo, just filter existing chunks
      const filtered = chunks.filter((chunk) =>
        chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.metadata.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setChunks(filtered);
      toast({
        title: 'Search complete',
        description: `Found ${filtered.length} relevant chunks`,
      });
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Failed to search chunks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, chunks, toast]);

  const handleChunkSelect = useCallback((chunk: RAGChunk) => {
    setSelectedChunkIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chunk.id)) {
        newSet.delete(chunk.id);
      } else {
        newSet.add(chunk.id);
      }
      return newSet;
    });
  }, []);

  const handleChunkPin = useCallback((chunkId: string) => {
    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.id === chunkId ? { ...chunk, pinned: !chunk.pinned } : chunk
      )
    );
  }, []);

  const handleAddToBasket = useCallback((chunk: RAGChunk) => {
    if (!contextBasket.find((item) => item.chunkId === chunk.id)) {
      const newItem: ContextBasketItem = {
        chunkId: chunk.id,
        chunk,
        order: contextBasket.length,
      };
      setContextBasket([...contextBasket, newItem]);
      toast({
        title: 'Added to context',
        description: `"${chunk.metadata.title}" added to context basket`,
      });
    }
  }, [contextBasket, toast]);

  const handleBasketReorder = useCallback((items: ContextBasketItem[]) => {
    setContextBasket(
      items.map((item, index) => ({
        ...item,
        order: index,
      }))
    );
  }, []);

  const handleBasketItemRemove = useCallback((chunkId: string) => {
    setContextBasket((prev) => prev.filter((item) => item.chunkId !== chunkId));
  }, []);

  const handleBasketItemUpdate = useCallback((chunkId: string, customPrompt: string) => {
    setContextBasket((prev) =>
      prev.map((item) =>
        item.chunkId === chunkId ? { ...item, customPrompt } : item
      )
    );
  }, []);

  const handleSaveAsTemplate = useCallback((name: string, description: string) => {
    // In real app, this would save to API
    console.log('Saving template:', { name, description, items: contextBasket });
    toast({
      title: 'Template saved',
      description: `RAG template "${name}" has been saved successfully.`,
    });
  }, [contextBasket, toast]);

  const handleExecuteWithAgent = useCallback((agentId: string) => {
    if (onExecuteWithAgent) {
      onExecuteWithAgent(agentId, contextBasket);
    }
    toast({
      title: 'Context applied',
      description: 'RAG context has been applied to the agent',
    });
  }, [contextBasket, onExecuteWithAgent, toast]);

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <Brain className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">RAG Context Composer</h2>
            <p className="text-sm text-muted-foreground">
              Build intelligent context for your agents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'split' ? 'focus' : 'split')}
          >
            {viewMode === 'split' ? (
              <Layout className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {showAsModal && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="search" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 grid w-fit grid-cols-3">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="ingest">
              <Upload className="w-4 h-4 mr-2" />
              Ingest
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 mt-4 px-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your knowledge base..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <span className="animate-spin mr-2">⚪</span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results Section */}
            <ResizablePanelGroup
              direction="horizontal"
              className="h-[calc(100%-60px)] rounded-lg border"
            >
              <ResizablePanel
                defaultSize={viewMode === 'split' ? 60 : 100}
                minSize={30}
              >
                <ChunkList
                  chunks={chunks}
                  onChunkSelect={handleChunkSelect}
                  onChunkPin={handleChunkPin}
                  onAddToBasket={handleAddToBasket}
                  selectedChunkIds={selectedChunkIds}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </ResizablePanel>
              
              {viewMode === 'split' && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={40} minSize={30}>
                    <ContextBasket
                      items={contextBasket}
                      onItemsReorder={handleBasketReorder}
                      onItemRemove={handleBasketItemRemove}
                      onItemUpdate={handleBasketItemUpdate}
                      onClear={() => setContextBasket([])}
                      onSaveAsTemplate={handleSaveAsTemplate}
                      onExecuteWithAgent={handleExecuteWithAgent}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </TabsContent>

          <TabsContent value="ingest" className="flex-1 mt-4 px-4">
            <IngestProgress
              ingestQueue={ingestQueue}
              onRetry={(documentId) => {
                console.log('Retry ingest:', documentId);
              }}
              onCancel={(documentId) => {
                setIngestQueue((prev) =>
                  prev.filter((item) => item.documentId !== documentId)
                );
              }}
            />
          </TabsContent>

          <TabsContent value="templates" className="flex-1 mt-4 px-4">
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">RAG Templates</h3>
              <p className="text-sm text-muted-foreground">
                Save and reuse context configurations
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>RAG Settings</SheetTitle>
            <SheetDescription>
              Configure retrieval and generation settings
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            {/* Settings content would go here */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Embedding Model</label>
              <select className="w-full p-2 border rounded-md">
                <option>OpenAI text-embedding-ada-002</option>
                <option>Cohere embed-multilingual-v3.0</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chunk Strategy</label>
              <select className="w-full p-2 border rounded-md">
                <option>Recursive Text Splitter</option>
                <option>Semantic Splitter</option>
                <option>Fixed Size</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reranking</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rerank" defaultChecked />
                <label htmlFor="rerank" className="text-sm">
                  Enable reranking for better relevance
                </label>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  if (showAsModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-7xl h-[90vh] bg-background rounded-lg border shadow-lg overflow-hidden"
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return content;
}
