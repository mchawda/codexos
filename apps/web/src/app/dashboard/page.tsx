'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Bot, 
  TrendingUp, 
  Zap, 
  Download,
  Code,
  FileText,
  Search,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Dynamically import React Flow to avoid SSR issues
const FlowEditor = dynamic(() => import('@/components/dashboard/flow-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="loading-dots flex space-x-2">
        <span className="w-3 h-3 bg-primary rounded-full"></span>
        <span className="w-3 h-3 bg-primary rounded-full"></span>
        <span className="w-3 h-3 bg-primary rounded-full"></span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your autonomous agents.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/dashboard/agents">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-dark rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Agents
              </p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-green-500">+2 from last week</p>
            </div>
            <Bot className="h-8 w-8 text-violet-500/20" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-dark rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Executions
              </p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-green-500">+15% from last week</p>
            </div>
            <Play className="h-8 w-8 text-blue-500/20" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-dark rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-2xl font-bold">98.5%</p>
              <p className="text-xs text-yellow-500">-0.5% from last week</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500/20" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-dark rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold">127ms</p>
              <p className="text-xs text-green-500">-23ms from last week</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500/20" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Agent Executions */}
        <div className="col-span-4 glass-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Agent Activity</h3>
          <div className="space-y-3">
            {[
              { name: 'Code Review Assistant', status: 'completed', time: '2 minutes ago', duration: '45s' },
              { name: 'Documentation Generator', status: 'running', time: 'Started 1 minute ago', duration: '-' },
              { name: 'Bug Triager', status: 'completed', time: '15 minutes ago', duration: '30s' },
              { name: 'Test Generator', status: 'failed', time: '1 hour ago', duration: '2m 15s' },
            ].map((activity, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={activity.status === 'completed' ? 'default' : activity.status === 'running' ? 'secondary' : 'destructive'}>
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Duration: {activity.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-3 space-y-4">
          <div className="glass-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/agents">
                <Button variant="outline" className="w-full justify-start">
                  <Code className="mr-2 h-4 w-4" />
                  Generate Code
                </Button>
              </Link>
              <Link href="/dashboard/agents">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Write Docs
                </Button>
              </Link>
              <Link href="/dashboard/rag">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Search RAG
                </Button>
              </Link>
              <Link href="/dashboard/agents">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Scan
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Gateway</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">RAG Engine</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">LLM Providers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">All Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Builder Preview */}
      <div className="glass-dark rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Agent Builder Preview</h3>
          <Link href="/dashboard/agents">
            <Button size="sm">
              Open Builder
            </Button>
          </Link>
        </div>
        <div className="h-64 rounded-lg bg-background/50 flex items-center justify-center">
          <FlowEditor />
        </div>
      </div>
    </div>
  );
}
