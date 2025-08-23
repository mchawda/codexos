// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Execution Monitor for advanced analytics and performance insights
 */

import { EventEmitter } from 'eventemitter3';
import {
  WorkflowExecution,
  TaskExecution,
  MonitoringConfig,
  WorkflowAnalytics,
  PerformanceMetrics,
  Insight,
  AlertThresholds,
  ExecutionMetrics,
  ResourceUsage
} from './types';

export interface MonitoringData {
  executionId: string;
  metrics: ExecutionMetrics;
  alerts: Alert[];
  insights: Insight[];
}

export interface Alert {
  id: string;
  type: 'performance' | 'resource' | 'error' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  executionId?: string;
  taskId?: string;
  metrics?: Record<string, number>;
}

export interface PerformanceProfile {
  executionId: string;
  taskProfiles: Map<string, TaskProfile>;
  bottlenecks: Bottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface TaskProfile {
  taskId: string;
  executionTime: number;
  resourceUsage: ResourceUsage;
  inputSize: number;
  outputSize: number;
  errorRate: number;
}

export interface Bottleneck {
  taskId: string;
  type: 'cpu' | 'memory' | 'io' | 'network' | 'dependency';
  impact: number; // 0-100
  description: string;
  recommendation: string;
}

export interface OptimizationOpportunity {
  type: 'parallelization' | 'caching' | 'batching' | 'model-selection';
  taskIds: string[];
  estimatedImprovement: number; // percentage
  description: string;
  implementation: string;
}

export class ExecutionMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private executions: Map<string, WorkflowExecution>;
  private alerts: Map<string, Alert[]>;
  private performanceProfiles: Map<string, PerformanceProfile>;
  private metricsHistory: Map<string, ExecutionMetrics[]>;
  private anomalyDetector: AnomalyDetector;
  private insightEngine: InsightEngine;
  private resourceMonitor: ResourceMonitor;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.executions = new Map();
    this.alerts = new Map();
    this.performanceProfiles = new Map();
    this.metricsHistory = new Map();
    
    this.anomalyDetector = new AnomalyDetector();
    this.insightEngine = new InsightEngine();
    this.resourceMonitor = new ResourceMonitor();
    
    this.startMonitoring();
  }

  /**
   * Monitor a workflow execution
   */
  async monitorExecution(execution: WorkflowExecution): Promise<MonitoringData> {
    this.executions.set(execution.id, execution);
    
    // Initialize monitoring data
    const alerts: Alert[] = [];
    const insights: Insight[] = [];
    
    // Start resource monitoring
    if (this.config.enableMetrics) {
      this.resourceMonitor.startMonitoring(execution.id);
    }
    
    // Check thresholds
    const thresholdAlerts = this.checkThresholds(execution);
    alerts.push(...thresholdAlerts);
    
    // Detect anomalies
    if (this.config.enableProfiling) {
      const anomalies = await this.detectAnomalies(execution);
      alerts.push(...anomalies);
    }
    
    // Generate insights
    const executionInsights = await this.generateInsights(execution);
    insights.push(...executionInsights);
    
    // Create performance profile
    if (this.config.enableProfiling) {
      const profile = await this.createPerformanceProfile(execution);
      this.performanceProfiles.set(execution.id, profile);
    }
    
    // Store alerts
    this.alerts.set(execution.id, alerts);
    
    // Update metrics history
    this.updateMetricsHistory(execution);
    
    const monitoringData: MonitoringData = {
      executionId: execution.id,
      metrics: execution.metrics,
      alerts,
      insights,
    };
    
    // Emit high-severity alerts
    alerts
      .filter(alert => alert.severity === 'high' || alert.severity === 'critical')
      .forEach(alert => this.emit('alert', alert));
    
    return monitoringData;
  }

  /**
   * Check threshold violations
   */
  private checkThresholds(execution: WorkflowExecution): Alert[] {
    const alerts: Alert[] = [];
    const thresholds = this.config.alertThresholds;
    
    // Check task failure rate
    if (execution.metrics.totalTasks > 0) {
      const failureRate = (execution.metrics.failedTasks / execution.metrics.totalTasks) * 100;
      if (failureRate > thresholds.taskFailureRate) {
        alerts.push({
          id: `alert-${Date.now()}-failure-rate`,
          type: 'error',
          severity: failureRate > thresholds.taskFailureRate * 2 ? 'critical' : 'high',
          title: 'High Task Failure Rate',
          description: `Task failure rate is ${failureRate.toFixed(2)}% (threshold: ${thresholds.taskFailureRate}%)`,
          timestamp: new Date(),
          executionId: execution.id,
          metrics: { failureRate },
        });
      }
    }
    
    // Check execution duration
    if (execution.endTime && execution.startTime) {
      const duration = execution.endTime.getTime() - execution.startTime.getTime();
      if (duration > thresholds.executionDuration) {
        alerts.push({
          id: `alert-${Date.now()}-duration`,
          type: 'performance',
          severity: 'medium',
          title: 'Long Execution Duration',
          description: `Execution took ${duration}ms (threshold: ${thresholds.executionDuration}ms)`,
          timestamp: new Date(),
          executionId: execution.id,
          metrics: { duration },
        });
      }
    }
    
    // Check resource usage
    if (execution.metrics.resourceUsage) {
      const { memoryUsage, cpuUsage } = execution.metrics.resourceUsage;
      
      if (memoryUsage > thresholds.memoryUsage) {
        alerts.push({
          id: `alert-${Date.now()}-memory`,
          type: 'resource',
          severity: memoryUsage > thresholds.memoryUsage * 1.5 ? 'high' : 'medium',
          title: 'High Memory Usage',
          description: `Memory usage is ${(memoryUsage / 1024 / 1024).toFixed(2)}MB (threshold: ${(thresholds.memoryUsage / 1024 / 1024).toFixed(2)}MB)`,
          timestamp: new Date(),
          executionId: execution.id,
          metrics: { memoryUsage },
        });
      }
      
      if (cpuUsage > thresholds.cpuUsage) {
        alerts.push({
          id: `alert-${Date.now()}-cpu`,
          type: 'resource',
          severity: 'medium',
          title: 'High CPU Usage',
          description: `CPU usage is ${cpuUsage.toFixed(2)}% (threshold: ${thresholds.cpuUsage}%)`,
          timestamp: new Date(),
          executionId: execution.id,
          metrics: { cpuUsage },
        });
      }
    }
    
    return alerts;
  }

  /**
   * Detect anomalies in execution
   */
  private async detectAnomalies(execution: WorkflowExecution): Promise<Alert[]> {
    const anomalies: Alert[] = [];
    
    // Get historical data for comparison
    const history = this.metricsHistory.get(execution.workflowId) || [];
    if (history.length < 5) {
      return anomalies; // Not enough data for anomaly detection
    }
    
    // Detect execution time anomalies
    const executionTime = execution.endTime ? 
      execution.endTime.getTime() - execution.startTime.getTime() : 0;
    
    const avgExecutionTime = history.reduce((sum, m) => sum + (m.totalDuration || 0), 0) / history.length;
    const stdDev = Math.sqrt(
      history.reduce((sum, m) => sum + Math.pow((m.totalDuration || 0) - avgExecutionTime, 2), 0) / history.length
    );
    
    if (executionTime > avgExecutionTime + 2 * stdDev) {
      anomalies.push({
        id: `anomaly-${Date.now()}-execution-time`,
        type: 'anomaly',
        severity: 'medium',
        title: 'Anomalous Execution Time',
        description: `Execution time (${executionTime}ms) is significantly higher than average (${avgExecutionTime.toFixed(0)}ms)`,
        timestamp: new Date(),
        executionId: execution.id,
        metrics: { executionTime, avgExecutionTime, stdDev },
      });
    }
    
    // Detect task pattern anomalies
    const taskPatternAnomaly = await this.anomalyDetector.detectTaskPatternAnomaly(
      execution,
      history
    );
    if (taskPatternAnomaly) {
      anomalies.push(taskPatternAnomaly);
    }
    
    // Detect resource usage anomalies
    if (execution.metrics.resourceUsage) {
      const resourceAnomaly = await this.anomalyDetector.detectResourceAnomaly(
        execution.metrics.resourceUsage,
        history.map(h => h.resourceUsage).filter(Boolean) as ResourceUsage[]
      );
      if (resourceAnomaly) {
        anomalies.push(resourceAnomaly);
      }
    }
    
    return anomalies;
  }

  /**
   * Generate insights for execution
   */
  private async generateInsights(execution: WorkflowExecution): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Analyze task performance
    const taskInsights = await this.insightEngine.analyzeTaskPerformance(execution);
    insights.push(...taskInsights);
    
    // Identify bottlenecks
    const bottleneckInsights = await this.identifyBottlenecks(execution);
    insights.push(...bottleneckInsights);
    
    // Find optimization opportunities
    const optimizationInsights = await this.findOptimizationOpportunities(execution);
    insights.push(...optimizationInsights);
    
    // Analyze error patterns
    if (execution.metrics.failedTasks > 0) {
      const errorInsights = await this.insightEngine.analyzeErrorPatterns(execution);
      insights.push(...errorInsights);
    }
    
    return insights;
  }

  /**
   * Create performance profile
   */
  private async createPerformanceProfile(
    execution: WorkflowExecution
  ): Promise<PerformanceProfile> {
    const taskProfiles = new Map<string, TaskProfile>();
    const bottlenecks: Bottleneck[] = [];
    const optimizationOpportunities: OptimizationOpportunity[] = [];
    
    // Profile each task
    for (const task of execution.tasks) {
      const profile = await this.profileTask(task);
      taskProfiles.set(task.taskId, profile);
    }
    
    // Identify bottlenecks
    const identifiedBottlenecks = this.analyzeBottlenecks(taskProfiles, execution);
    bottlenecks.push(...identifiedBottlenecks);
    
    // Find optimization opportunities
    const opportunities = this.analyzeOptimizationOpportunities(
      taskProfiles,
      execution
    );
    optimizationOpportunities.push(...opportunities);
    
    return {
      executionId: execution.id,
      taskProfiles,
      bottlenecks,
      optimizationOpportunities,
    };
  }

  /**
   * Profile individual task
   */
  private async profileTask(task: TaskExecution): Promise<TaskProfile> {
    const executionTime = task.endTime && task.startTime ?
      task.endTime.getTime() - task.startTime.getTime() : 0;
    
    // Get resource usage from monitor
    const resourceUsage = await this.resourceMonitor.getTaskResourceUsage(
      task.executionId,
      task.taskId
    );
    
    return {
      taskId: task.taskId,
      executionTime,
      resourceUsage: resourceUsage || {
        cpuUsage: 0,
        memoryUsage: 0,
      },
      inputSize: 0, // Would need to track this
      outputSize: 0, // Would need to track this
      errorRate: task.status === 'failed' ? 100 : 0,
    };
  }

  /**
   * Identify bottlenecks in execution
   */
  private identifyBottlenecks(execution: WorkflowExecution): Insight[] {
    const insights: Insight[] = [];
    
    // Find slowest tasks
    const slowTasks = execution.tasks
      .filter(t => t.endTime && t.startTime)
      .sort((a, b) => {
        const aDuration = a.endTime!.getTime() - a.startTime.getTime();
        const bDuration = b.endTime!.getTime() - b.startTime.getTime();
        return bDuration - aDuration;
      })
      .slice(0, 3);
    
    if (slowTasks.length > 0) {
      const totalTime = execution.endTime && execution.startTime ?
        execution.endTime.getTime() - execution.startTime.getTime() : 0;
      
      slowTasks.forEach(task => {
        const taskDuration = task.endTime!.getTime() - task.startTime.getTime();
        const percentage = totalTime > 0 ? (taskDuration / totalTime) * 100 : 0;
        
        if (percentage > 20) {
          insights.push({
            type: 'bottleneck',
            severity: percentage > 40 ? 'high' : 'medium',
            title: `Task ${task.taskId} is a performance bottleneck`,
            description: `This task takes ${percentage.toFixed(1)}% of total execution time`,
            recommendation: 'Consider optimizing this task or running it in parallel with others',
            affectedTasks: [task.taskId],
          });
        }
      });
    }
    
    return insights;
  }

  /**
   * Find optimization opportunities
   */
  private findOptimizationOpportunities(
    execution: WorkflowExecution
  ): Insight[] {
    const insights: Insight[] = [];
    
    // Check for sequential tasks that could be parallelized
    const sequentialTasks = this.findSequentialTasks(execution);
    if (sequentialTasks.length > 1) {
      insights.push({
        type: 'optimization',
        severity: 'medium',
        title: 'Parallelization Opportunity',
        description: `${sequentialTasks.length} tasks are running sequentially but could potentially run in parallel`,
        recommendation: 'Review task dependencies and consider parallelizing independent tasks',
        affectedTasks: sequentialTasks.map(t => t.taskId),
      });
    }
    
    // Check for repeated similar tasks that could be batched
    const batchingOpportunities = this.findBatchingOpportunities(execution);
    if (batchingOpportunities.length > 0) {
      insights.push({
        type: 'optimization',
        severity: 'low',
        title: 'Batching Opportunity',
        description: 'Multiple similar tasks could be batched for better performance',
        recommendation: 'Consider batching similar operations to reduce overhead',
        affectedTasks: batchingOpportunities,
      });
    }
    
    return insights;
  }

  /**
   * Find sequential tasks that could be parallelized
   */
  private findSequentialTasks(execution: WorkflowExecution): TaskExecution[] {
    // Simplified implementation - would need dependency analysis
    return execution.tasks.filter(t => t.status === 'completed');
  }

  /**
   * Find batching opportunities
   */
  private findBatchingOpportunities(execution: WorkflowExecution): string[] {
    // Group tasks by agent
    const tasksByAgent = new Map<string, TaskExecution[]>();
    
    execution.tasks.forEach(task => {
      if (!tasksByAgent.has(task.agentId)) {
        tasksByAgent.set(task.agentId, []);
      }
      tasksByAgent.get(task.agentId)!.push(task);
    });
    
    // Find agents with multiple sequential tasks
    const batchCandidates: string[] = [];
    
    tasksByAgent.forEach((tasks, agentId) => {
      if (tasks.length > 3) {
        batchCandidates.push(...tasks.map(t => t.taskId));
      }
    });
    
    return batchCandidates;
  }

  /**
   * Analyze bottlenecks from task profiles
   */
  private analyzeBottlenecks(
    taskProfiles: Map<string, TaskProfile>,
    execution: WorkflowExecution
  ): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Calculate average metrics
    let avgExecutionTime = 0;
    let avgMemoryUsage = 0;
    let avgCpuUsage = 0;
    let count = 0;
    
    taskProfiles.forEach(profile => {
      avgExecutionTime += profile.executionTime;
      avgMemoryUsage += profile.resourceUsage.memoryUsage;
      avgCpuUsage += profile.resourceUsage.cpuUsage;
      count++;
    });
    
    if (count > 0) {
      avgExecutionTime /= count;
      avgMemoryUsage /= count;
      avgCpuUsage /= count;
    }
    
    // Identify bottlenecks
    taskProfiles.forEach((profile, taskId) => {
      // CPU bottleneck
      if (profile.resourceUsage.cpuUsage > avgCpuUsage * 2) {
        bottlenecks.push({
          taskId,
          type: 'cpu',
          impact: Math.min(100, (profile.resourceUsage.cpuUsage / 100) * 100),
          description: 'High CPU usage detected',
          recommendation: 'Consider optimizing algorithms or using more efficient implementations',
        });
      }
      
      // Memory bottleneck
      if (profile.resourceUsage.memoryUsage > avgMemoryUsage * 2) {
        bottlenecks.push({
          taskId,
          type: 'memory',
          impact: Math.min(100, (profile.resourceUsage.memoryUsage / avgMemoryUsage) * 50),
          description: 'High memory usage detected',
          recommendation: 'Consider streaming data processing or reducing data size',
        });
      }
      
      // Time bottleneck
      if (profile.executionTime > avgExecutionTime * 2) {
        bottlenecks.push({
          taskId,
          type: 'dependency',
          impact: Math.min(100, (profile.executionTime / avgExecutionTime) * 50),
          description: 'Task takes significantly longer than average',
          recommendation: 'Review task dependencies and consider parallelization',
        });
      }
    });
    
    return bottlenecks;
  }

  /**
   * Analyze optimization opportunities from profiles
   */
  private analyzeOptimizationOpportunities(
    taskProfiles: Map<string, TaskProfile>,
    execution: WorkflowExecution
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];
    
    // Check for caching opportunities
    const repeatTasks = this.findRepeatTasks(execution);
    if (repeatTasks.length > 0) {
      opportunities.push({
        type: 'caching',
        taskIds: repeatTasks,
        estimatedImprovement: 30,
        description: 'These tasks have similar inputs and could benefit from caching',
        implementation: 'Implement result caching for deterministic operations',
      });
    }
    
    // Check for model selection opportunities
    const overProvisionedTasks = Array.from(taskProfiles.entries())
      .filter(([_, profile]) => profile.outputSize < 100 && profile.executionTime > 1000)
      .map(([taskId]) => taskId);
    
    if (overProvisionedTasks.length > 0) {
      opportunities.push({
        type: 'model-selection',
        taskIds: overProvisionedTasks,
        estimatedImprovement: 50,
        description: 'These tasks might be using overly complex models for simple operations',
        implementation: 'Consider using lighter models for simple tasks',
      });
    }
    
    return opportunities;
  }

  /**
   * Find tasks that could benefit from caching
   */
  private findRepeatTasks(execution: WorkflowExecution): string[] {
    // Simplified implementation - would need to track task inputs
    return [];
  }

  /**
   * Update metrics history
   */
  private updateMetricsHistory(execution: WorkflowExecution): void {
    const workflowId = execution.workflowId;
    
    if (!this.metricsHistory.has(workflowId)) {
      this.metricsHistory.set(workflowId, []);
    }
    
    const history = this.metricsHistory.get(workflowId)!;
    history.push(execution.metrics);
    
    // Keep only last 100 executions
    if (history.length > 100) {
      this.metricsHistory.set(workflowId, history.slice(-100));
    }
  }

  /**
   * Get analytics for a workflow
   */
  async getWorkflowAnalytics(
    workflowId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkflowAnalytics> {
    const executions = Array.from(this.executions.values())
      .filter(e => 
        e.workflowId === workflowId &&
        e.startTime >= startDate &&
        e.startTime <= endDate
      );
    
    const executionSummaries = executions.map(e => ({
      executionId: e.id,
      startTime: e.startTime,
      duration: e.endTime ? e.endTime.getTime() - e.startTime.getTime() : 0,
      status: e.status,
      taskCount: e.tasks.length,
      successRate: e.metrics.totalTasks > 0 ?
        (e.metrics.completedTasks / e.metrics.totalTasks) * 100 : 0,
    }));
    
    // Calculate performance metrics
    const durations = executionSummaries
      .filter(s => s.duration > 0)
      .map(s => s.duration)
      .sort((a, b) => a - b);
    
    const performance: PerformanceMetrics = {
      averageDuration: durations.length > 0 ?
        durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      p50Duration: this.percentile(durations, 50),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
      throughput: executions.length / ((endDate.getTime() - startDate.getTime()) / 1000),
      errorRate: executions.filter(e => e.status === 'failed').length / executions.length * 100,
    };
    
    // Collect insights
    const allInsights: Insight[] = [];
    executions.forEach(e => {
      const executionInsights = this.alerts.get(e.id)
        ?.filter(a => a.type === 'anomaly')
        .map(a => ({
          type: 'anomaly' as const,
          severity: a.severity,
          title: a.title,
          description: a.description,
          recommendation: `Review execution ${e.id} for anomalous behavior`,
        })) || [];
      allInsights.push(...executionInsights);
    });
    
    return {
      workflowId,
      period: {
        start: startDate,
        end: endDate,
        granularity: 'day',
      },
      executions: executionSummaries,
      performance,
      insights: allInsights,
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const index = (percentile / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    return values[lower] * (1 - weight) + values[upper] * weight;
  }

  /**
   * Start monitoring services
   */
  private startMonitoring(): void {
    if (this.config.enableMetrics) {
      this.resourceMonitor.start();
    }
    
    if (this.config.enableTracing) {
      // Start tracing service
    }
    
    this.emit('monitoring:started');
  }

  /**
   * Shutdown monitor
   */
  async shutdown(): Promise<void> {
    this.resourceMonitor.stop();
    this.executions.clear();
    this.alerts.clear();
    this.performanceProfiles.clear();
    this.metricsHistory.clear();
    
    this.emit('shutdown');
  }
}

/**
 * Anomaly Detector
 */
class AnomalyDetector {
  async detectTaskPatternAnomaly(
    execution: WorkflowExecution,
    history: ExecutionMetrics[]
  ): Promise<Alert | null> {
    // Implement pattern anomaly detection
    return null;
  }
  
  async detectResourceAnomaly(
    current: ResourceUsage,
    history: ResourceUsage[]
  ): Promise<Alert | null> {
    // Implement resource anomaly detection
    return null;
  }
}

/**
 * Insight Engine
 */
class InsightEngine {
  async analyzeTaskPerformance(execution: WorkflowExecution): Promise<Insight[]> {
    // Implement task performance analysis
    return [];
  }
  
  async analyzeErrorPatterns(execution: WorkflowExecution): Promise<Insight[]> {
    // Implement error pattern analysis
    return [];
  }
}

/**
 * Resource Monitor
 */
class ResourceMonitor {
  private monitoring: Map<string, NodeJS.Timeout> = new Map();
  private metrics: Map<string, ResourceUsage> = new Map();
  
  start(): void {
    // Start resource monitoring
  }
  
  stop(): void {
    this.monitoring.forEach(timer => clearInterval(timer));
    this.monitoring.clear();
  }
  
  startMonitoring(executionId: string): void {
    const timer = setInterval(() => {
      const usage: ResourceUsage = {
        cpuUsage: process.cpuUsage().user / 1000000, // Convert to percentage
        memoryUsage: process.memoryUsage().heapUsed,
      };
      this.metrics.set(executionId, usage);
    }, 1000);
    
    this.monitoring.set(executionId, timer);
  }
  
  async getTaskResourceUsage(
    executionId: string,
    taskId: string
  ): Promise<ResourceUsage | null> {
    return this.metrics.get(executionId) || null;
  }
}
