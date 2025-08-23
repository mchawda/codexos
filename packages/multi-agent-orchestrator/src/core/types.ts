// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Type definitions for Multi-Agent Orchestrator
 */

import { z } from 'zod';

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'hybrid' | 'custom';
  capabilities: string[];
  configuration: AgentConfiguration;
  status: 'available' | 'busy' | 'offline';
  metrics?: AgentMetrics;
}

export interface AgentConfiguration {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  customConfig?: Record<string, any>;
}

export interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecutionTime?: Date;
}

// Workflow Types
export interface AgentWorkflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tasks: AgentTask[];
  metadata?: WorkflowMetadata;
}

export interface AgentTask {
  id: string;
  name: string;
  agentId: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'loop';
  input: TaskInput;
  dependencies?: string[];
  conditions?: TaskCondition[];
  retryPolicy?: RetryPolicy;
  timeout?: number;
}

export interface TaskInput {
  prompt?: string;
  data?: any;
  schema?: z.ZodSchema;
  transform?: (input: any) => any;
}

export interface TaskCondition {
  type: 'dependency' | 'state' | 'custom';
  expression: string;
  evaluate: (context: any) => boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffType: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
}

export interface WorkflowMetadata {
  author?: string;
  created?: Date;
  updated?: Date;
  tags?: string[];
  category?: string;
}

// Execution Types
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  context: any;
  tasks: TaskExecution[];
  results: Record<string, any>;
  metrics: ExecutionMetrics;
  error?: string;
}

export interface TaskExecution {
  taskId: string;
  executionId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  attempts?: number;
}

export interface ExecutionMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  totalDuration?: number;
  resourceUsage?: ResourceUsage;
}

export interface ResourceUsage {
  cpuUsage: number;
  memoryUsage: number;
  networkBandwidth?: number;
  apiCalls?: number;
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost?: number;
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  workflowId: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  endTime?: Date;
  sharedContext: SharedContext;
}

export interface Participant {
  id: string;
  type: 'agent' | 'human' | 'system';
  role: string;
  permissions: Permission[];
  joinedAt: Date;
  leftAt?: Date;
}

export interface Permission {
  action: string;
  resource: string;
  constraints?: Record<string, any>;
}

export interface SharedContext {
  data: Record<string, any>;
  locks: Record<string, Lock>;
  version: number;
  lastUpdated: Date;
}

export interface Lock {
  holderId: string;
  acquiredAt: Date;
  expiresAt: Date;
  type: 'read' | 'write' | 'exclusive';
}

// Configuration Types
export interface OrchestratorConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  workflow: WorkflowConfig;
  agents: AgentPoolConfig;
  monitoring: MonitoringConfig;
  collaboration: CollaborationConfig;
  maxConcurrentWorkflows?: number;
  rateLimitInterval?: number;
  rateLimitCap?: number;
}

export interface WorkflowConfig {
  maxDepth: number;
  maxTasks: number;
  defaultTimeout: number;
  enableValidation: boolean;
}

export interface AgentPoolConfig {
  minAgents: number;
  maxAgents: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  healthCheckInterval: number;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableTracing: boolean;
  enableProfiling: boolean;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  taskFailureRate: number;
  executionDuration: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface CollaborationConfig {
  enableRealtime: boolean;
  maxParticipants: number;
  sessionTimeout: number;
  conflictResolution: 'last-write-wins' | 'operational-transform' | 'crdt';
}

// Analytics Types
export interface WorkflowAnalytics {
  workflowId: string;
  period: AnalyticsPeriod;
  executions: ExecutionSummary[];
  performance: PerformanceMetrics;
  insights: Insight[];
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface ExecutionSummary {
  executionId: string;
  startTime: Date;
  duration: number;
  status: string;
  taskCount: number;
  successRate: number;
}

export interface PerformanceMetrics {
  averageDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  throughput: number;
  errorRate: number;
}

export interface Insight {
  type: 'bottleneck' | 'optimization' | 'anomaly' | 'trend';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation?: string;
  affectedTasks?: string[];
}

// Event Types
export interface OrchestratorEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface WorkflowEvent extends OrchestratorEvent {
  type: 'workflow:started' | 'workflow:completed' | 'workflow:failed' | 'workflow:cancelled';
  workflowId: string;
  executionId: string;
}

export interface TaskEvent extends OrchestratorEvent {
  type: 'task:started' | 'task:completed' | 'task:failed' | 'task:retrying';
  taskId: string;
  executionId: string;
  agentId: string;
}

export interface CollaborationEvent extends OrchestratorEvent {
  type: 'collaboration:started' | 'collaboration:joined' | 'collaboration:left' | 'collaboration:ended';
  sessionId: string;
  participantId?: string;
}

// Model Integration Types
export interface ModelProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'cohere' | 'huggingface' | 'custom';
  models: Model[];
  configuration: ModelProviderConfig;
}

export interface Model {
  id: string;
  name: string;
  capabilities: ModelCapability[];
  contextLength: number;
  pricing?: ModelPricing;
  performance?: ModelPerformance;
}

export interface ModelCapability {
  type: 'text-generation' | 'code-generation' | 'reasoning' | 'tool-use' | 'vision' | 'audio';
  quality: 'basic' | 'good' | 'excellent';
}

export interface ModelPricing {
  inputTokenCost: number;
  outputTokenCost: number;
  currency: string;
}

export interface ModelPerformance {
  latency: number;
  throughput: number;
  accuracy?: number;
}

export interface ModelProviderConfig {
  apiKey?: string;
  endpoint?: string;
  maxRetries?: number;
  timeout?: number;
  rateLimit?: RateLimit;
}

export interface RateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
  concurrentRequests: number;
}
