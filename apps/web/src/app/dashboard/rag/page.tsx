// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  FileText,
  Globe,
  Github,
  Database,
  Trash2,
  RefreshCw,
  Filter,
  Download,
  ChevronRight,
  FileUp,
  Link2,
  Code2,
  Brain,
  Sparkles,
  Layout,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RAGComposer } from '@/components/dashboard/rag-composer';

interface Document {
  id: string;
  name: string;
  source: 'pdf' | 'github' | 'web' | 'text';
  chunks: number;
  size: string;
  ingested: string;
  status: 'ready' | 'processing' | 'error';
}

interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: {
    source: string;
    title: string;
    chunk: number;
  };
  highlights: string[];
}

export default function RAGEnginePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'CodexOS Documentation',
      source: 'text',
      chunks: 45,
      size: '2.4 MB',
      ingested: '2 hours ago',
      status: 'ready',
    },
    {
      id: '2',
      name: 'github.com/langchain-ai/langchain',
      source: 'github',
      chunks: 156,
      size: '8.7 MB',
      ingested: '1 day ago',
      status: 'ready',
    },
    {
      id: '3',
      name: 'AI Best Practices Guide.pdf',
      source: 'pdf',
      chunks: 89,
      size: '4.2 MB',
      ingested: '3 days ago',
      status: 'processing',
    },
  ]);
  const [selectedTab, setSelectedTab] = useState('composer');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showComposer, setShowComposer] = useState(false);

  const handleSearch = () => {
    // Simulate search results
    setSearchResults([
      {
        id: '1',
        content: 'The RAG engine uses advanced semantic search to find relevant context from your knowledge base. It combines vector embeddings with keyword search for optimal results...',
        score: 0.95,
        metadata: {
          source: 'CodexOS Documentation',
          title: 'RAG Engine Overview',
          chunk: 12,
        },
        highlights: ['RAG engine', 'semantic search', 'vector embeddings'],
      },
      {
        id: '2',
        content: 'LangChain provides a framework for developing applications powered by language models. It enables applications that are context-aware and reason...',
        score: 0.87,
        metadata: {
          source: 'github.com/langchain-ai/langchain',
          title: 'Introduction to LangChain',
          chunk: 3,
        },
        highlights: ['LangChain', 'language models', 'context-aware'],
      },
    ]);
  };

  const sourceIcons = {
    pdf: FileText,
    github: Github,
    web: Globe,
    text: FileText,
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RAG Engine</h1>
          <p className="text-muted-foreground mt-2">
            Retrieval Augmented Generation for intelligent context-aware agents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Database className="w-3 h-3 mr-1" />
            {documents.length} Documents
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Brain className="w-3 h-3 mr-1" />
            {documents.reduce((acc, doc) => acc + doc.chunks, 0)} Chunks
          </Badge>
          <Button
            onClick={() => setShowComposer(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Layout className="w-4 h-4 mr-2" />
            Open Composer
          </Button>
        </div>
      </div>

      {/* Show Composer Modal */}
      {showComposer && (
        <RAGComposer
          showAsModal
          onClose={() => setShowComposer(false)}
          onExecuteWithAgent={(agentId, context) => {
            console.log('Execute with agent:', agentId, context);
            setShowComposer(false);
          }}
        />
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="composer">
            <Layout className="w-4 h-4 mr-2" />
            Composer
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="ingest">
            <Upload className="w-4 h-4 mr-2" />
            Ingest
          </TabsTrigger>
        </TabsList>

        {/* Composer Tab */}
        <TabsContent value="composer" className="space-y-6">
          <RAGComposer
            onExecuteWithAgent={(agentId, context) => {
              console.log('Execute with agent:', agentId, context);
            }}
          />
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                Search across all your ingested documents with AI-powered understanding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question or search for information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search Filters */}
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="pdf">PDF Files</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="web">Web Pages</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="source">By Source</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Search Results
              </h3>
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-dark rounded-lg p-6 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{result.metadata.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{result.metadata.source}</span>
                        <span>•</span>
                        <span>Chunk {result.metadata.chunk}</span>
                        <span>•</span>
                        <span>Score: {(result.score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed">{result.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                Manage your ingested documents and knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => {
                  const Icon = sourceIcons[doc.source];
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.chunks} chunks</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.ingested}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            doc.status === 'ready' ? 'default' :
                            doc.status === 'processing' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {doc.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingest Tab */}
        <TabsContent value="ingest" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload PDF, text, or markdown files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                  <FileUp className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      or drag and drop here
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, TXT, MD up to 50MB
                  </p>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URL Import */}
            <Card>
              <CardHeader>
                <CardTitle>Import from URL</CardTitle>
                <CardDescription>
                  Import content from web pages or GitHub
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <Input placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Type</label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="github">GitHub Repository</SelectItem>
                      <SelectItem value="web">Web Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Link2 className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </CardContent>
            </Card>

            {/* Text Input */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Direct Text Input</CardTitle>
                <CardDescription>
                  Paste or type text content directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text content here..."
                  className="min-h-[200px]"
                />
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="Document name (optional)"
                    className="max-w-xs"
                  />
                  <Button>
                    <Code2 className="w-4 h-4 mr-2" />
                    Ingest Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}