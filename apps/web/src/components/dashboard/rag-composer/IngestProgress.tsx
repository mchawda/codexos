// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Github,
  Globe,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileUp,
  Database,
  Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IngestProgress as IngestProgressType } from './types';
import { cn } from '@/lib/utils';

interface IngestProgressProps {
  ingestQueue: IngestProgressType[];
  onRetry?: (documentId: string) => void;
  onCancel?: (documentId: string) => void;
}

const statusConfig = {
  pending: {
    icon: Upload,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Processing',
  },
  embedding: {
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Generating embeddings',
  },
  indexing: {
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Indexing',
  },
  complete: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Complete',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Error',
  },
};

const stepProgress = {
  pending: 0,
  processing: 25,
  embedding: 50,
  indexing: 75,
  complete: 100,
  error: 0,
};

export default function IngestProgress({
  ingestQueue,
  onRetry,
  onCancel,
}: IngestProgressProps) {
  const activeIngests = ingestQueue.filter((item) => item.status !== 'complete');
  const completedIngests = ingestQueue.filter((item) => item.status === 'complete');

  return (
    <div className="space-y-4">
      {/* Active Ingests */}
      {activeIngests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              Document Processing
            </CardTitle>
            <CardDescription>
              {activeIngests.length} document{activeIngests.length !== 1 ? 's' : ''} being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {activeIngests.map((ingest) => {
                const config = statusConfig[ingest.status];
                const Icon = config.icon;
                const isAnimated = ['processing', 'embedding', 'indexing'].includes(ingest.status);
                
                return (
                  <motion.div
                    key={ingest.documentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg',
                              config.bgColor
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-4 h-4',
                                config.color,
                                isAnimated && 'animate-spin'
                              )}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{ingest.fileName}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {config.label}
                            </p>
                          </div>
                        </div>
                        {ingest.status === 'error' && onRetry && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetry(ingest.documentId)}
                          >
                            Retry
                          </Button>
                        )}
                        {['pending', 'processing', 'embedding', 'indexing'].includes(
                          ingest.status
                        ) &&
                          onCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCancel(ingest.documentId)}
                            >
                              Cancel
                            </Button>
                          )}
                      </div>

                      {/* Progress */}
                      {ingest.status !== 'error' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{ingest.progress || stepProgress[ingest.status]}%</span>
                          </div>
                          <Progress
                            value={ingest.progress || stepProgress[ingest.status]}
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {ingest.chunksCreated !== undefined && (
                          <div className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            <span>{ingest.chunksCreated} chunks</span>
                          </div>
                        )}
                        {ingest.status === 'embedding' && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Creating embeddings...</span>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {ingest.error && (
                        <div className="flex items-start gap-2 p-2 rounded bg-red-50 text-red-600">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="text-xs">{ingest.error}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Completed Ingests Summary */}
      {completedIngests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedIngests.slice(0, 3).map((ingest) => (
                <div
                  key={ingest.documentId}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{ingest.fileName}</span>
                  </div>
                  {ingest.chunksCreated && (
                    <Badge variant="secondary" className="text-xs">
                      {ingest.chunksCreated} chunks
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
