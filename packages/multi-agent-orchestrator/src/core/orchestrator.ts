// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Multi-Agent Orchestrator for complex agent workflows and chaining
 */

import { EventEmitter } from 'eventemitter3';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Observable, from, merge } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import PQueue from 'p-queue';
import { AgentWorkflow, AgentTask, WorkflowExecution, OrchestratorConfig } from './types';
import { WorkflowEngine } from './workflow-engine';
import { AgentPool } from './agent-pool';
import { ExecutionMonitor } from './execution-monitor';
import { CollaborationManager } from './collaboration-manager';

export class MultiAgentOrchestrator extends EventEmitter {
  private config: OrchestratorConfig;
  private workflowEngine: WorkflowEngine;
  private agentPool: AgentPool;
  private executionMonitor: ExecutionMonitor;
  private collaborationManager: CollaborationManager;
  private taskQueue: Queue;
  private executionQueue: PQueue;
  private activeExecutions: Map<string, WorkflowExecution>;
  private executionSubject: Subject<WorkflowExecution>;
  private shutdownSubject: Subject<void>;

  constructor(config: OrchestratorConfig) {
    super();
    this.config = config;
    this.activeExecutions = new Map();
    this.executionSubject = new Subject();
    this.shutdownSubject = new Subject();
    
    // Initialize components
    this.workflowEngine = new WorkflowEngine(config.workflow);
    this.agentPool = new AgentPool(config.agents);
    this.executionMonitor = new ExecutionMonitor(config.monitoring);
    this.collaborationManager = new CollaborationManager(config.collaboration);
    
    // Initialize task queue
    this.taskQueue = new Queue('agent-tasks', {
      connection: config.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
    
    // Initialize execution queue with concurrency control
    this.executionQueue = new PQueue({
      concurrency: config.maxConcurrentWorkflows || 10,
      interval: config.rateLimitInterval || 1000,
      intervalCap: config.rateLimitCap || 5,
    });
    
    this.setupEventHandlers();
    this.setupExecutionPipeline();
  }

  /**
   * Execute a multi-agent workflow
   */
  async executeWorkflow(workflow: AgentWorkflow, context: any = {}): Promise<WorkflowExecution> {
    const executionId = uuidv4();
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'pending',
      startTime: new Date(),
      context,
      tasks: [],
      results: {},
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageTaskDuration: 0,
      },
    };
    
    this.activeExecutions.set(executionId, execution);
    this.emit('workflow:started', execution);
    
    try {
      // Add to execution queue
      const result = await this.executionQueue.add(async () => {
        return this.runWorkflow(execution, workflow);
      });
      
      return result;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();
      this.emit('workflow:failed', execution);
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Run a workflow with all its tasks
   */
  private async runWorkflow(
    execution: WorkflowExecution,
    workflow: AgentWorkflow
  ): Promise<WorkflowExecution> {
    execution.status = 'running';
    this.executionSubject.next(execution);
    
    try {
      // Parse and validate workflow
      const parsedWorkflow = await this.workflowEngine.parseWorkflow(workflow);
      
      // Get execution plan
      const executionPlan = await this.workflowEngine.createExecutionPlan(parsedWorkflow);
      
      // Execute tasks according to plan
      for (const stage of executionPlan.stages) {
        await this.executeStage(execution, stage);
      }
      
      execution.status = 'completed';
      execution.endTime = new Date();
      this.emit('workflow:completed', execution);
      
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();
      throw error;
    }
    
    return execution;
  }

  /**
   * Execute a stage of tasks (can be parallel)
   */
  private async executeStage(
    execution: WorkflowExecution,
    stage: AgentTask[]
  ): Promise<void> {
    const stagePromises = stage.map(task => this.executeTask(execution, task));
    
    // Wait for all tasks in stage to complete
    const results = await Promise.allSettled(stagePromises);
    
    // Process results
    results.forEach((result, index) => {
      const task = stage[index];
      if (result.status === 'fulfilled') {
        execution.results[task.id] = result.value;
        execution.metrics.completedTasks++;
      } else {
        execution.results[task.id] = { error: result.reason };
        execution.metrics.failedTasks++;
      }
    });
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    execution: WorkflowExecution,
    task: AgentTask
  ): Promise<any> {
    const taskExecution = {
      taskId: task.id,
      executionId: execution.id,
      agentId: task.agentId,
      status: 'pending' as const,
      startTime: new Date(),
    };
    
    execution.tasks.push(taskExecution);
    this.emit('task:started', taskExecution);
    
    try {
      // Get agent from pool
      const agent = await this.agentPool.getAgent(task.agentId);
      
      // Check if task depends on other tasks
      const dependencies = await this.resolveDependencies(execution, task);
      
      // Execute task with agent
      const result = await agent.execute({
        ...task,
        context: {
          ...execution.context,
          dependencies,
        },
      });
      
      taskExecution.status = 'completed';
      taskExecution.endTime = new Date();
      taskExecution.result = result;
      
      this.emit('task:completed', taskExecution);
      
      // Update metrics
      this.updateMetrics(execution, taskExecution);
      
      return result;
      
    } catch (error) {
      taskExecution.status = 'failed';
      taskExecution.endTime = new Date();
      taskExecution.error = error instanceof Error ? error.message : String(error);
      
      this.emit('task:failed', taskExecution);
      throw error;
    }
  }

  /**
   * Resolve task dependencies
   */
  private async resolveDependencies(
    execution: WorkflowExecution,
    task: AgentTask
  ): Promise<any> {
    if (!task.dependencies || task.dependencies.length === 0) {
      return {};
    }
    
    const dependencies: any = {};
    
    for (const depId of task.dependencies) {
      if (execution.results[depId]) {
        dependencies[depId] = execution.results[depId];
      } else {
        // Wait for dependency to complete
        await this.waitForTask(execution, depId);
        dependencies[depId] = execution.results[depId];
      }
    }
    
    return dependencies;
  }

  /**
   * Wait for a specific task to complete
   */
  private async waitForTask(
    execution: WorkflowExecution,
    taskId: string,
    timeout: number = 30000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out`));
      }, timeout);
      
      const checkTask = () => {
        if (execution.results[taskId]) {
          clearTimeout(timer);
          resolve();
        } else {
          setTimeout(checkTask, 100);
        }
      };
      
      checkTask();
    });
  }

  /**
   * Update execution metrics
   */
  private updateMetrics(
    execution: WorkflowExecution,
    taskExecution: any
  ): void {
    execution.metrics.totalTasks++;
    
    if (taskExecution.endTime && taskExecution.startTime) {
      const duration = taskExecution.endTime.getTime() - taskExecution.startTime.getTime();
      const currentAvg = execution.metrics.averageTaskDuration;
      const totalTasks = execution.metrics.completedTasks + execution.metrics.failedTasks;
      
      execution.metrics.averageTaskDuration = 
        (currentAvg * (totalTasks - 1) + duration) / totalTasks;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Monitor task queue events
    this.taskQueue.on('completed', (job) => {
      this.emit('queue:task:completed', job.data);
    });
    
    this.taskQueue.on('failed', (job, error) => {
      this.emit('queue:task:failed', { job: job?.data, error });
    });
    
    // Monitor execution events
    this.executionMonitor.on('alert', (alert) => {
      this.emit('monitor:alert', alert);
    });
    
    // Monitor collaboration events
    this.collaborationManager.on('agent:joined', (data) => {
      this.emit('collaboration:agent:joined', data);
    });
    
    this.collaborationManager.on('agent:left', (data) => {
      this.emit('collaboration:agent:left', data);
    });
  }

  /**
   * Setup execution pipeline with RxJS
   */
  private setupExecutionPipeline(): void {
    // Create execution pipeline
    this.executionSubject
      .pipe(
        takeUntil(this.shutdownSubject),
        filter(execution => execution.status === 'running'),
        mergeMap(execution => 
          from(this.executionMonitor.monitorExecution(execution))
        ),
        map(monitoringData => ({
          executionId: monitoringData.executionId,
          metrics: monitoringData.metrics,
          alerts: monitoringData.alerts,
        }))
      )
      .subscribe({
        next: (data) => {
          this.emit('monitoring:update', data);
        },
        error: (error) => {
          this.emit('monitoring:error', error);
        },
      });
  }

  /**
   * Get active workflow executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Cancel a workflow execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    
    execution.status = 'cancelled';
    execution.endTime = new Date();
    
    // Cancel all pending tasks
    for (const task of execution.tasks) {
      if (task.status === 'pending' || task.status === 'running') {
        task.status = 'cancelled';
        task.endTime = new Date();
      }
    }
    
    this.emit('workflow:cancelled', execution);
    this.activeExecutions.delete(executionId);
  }

  /**
   * Get orchestrator statistics
   */
  async getStatistics(): Promise<any> {
    const stats = {
      activeWorkflows: this.activeExecutions.size,
      queuedTasks: await this.taskQueue.getWaitingCount(),
      agentPoolSize: await this.agentPool.getPoolSize(),
      executionQueueSize: this.executionQueue.size,
      executionQueuePending: this.executionQueue.pending,
    };
    
    return stats;
  }

  /**
   * Shutdown orchestrator
   */
  async shutdown(): Promise<void> {
    this.shutdownSubject.next();
    this.shutdownSubject.complete();
    
    // Clear execution queue
    this.executionQueue.clear();
    
    // Close task queue
    await this.taskQueue.close();
    
    // Shutdown components
    await this.agentPool.shutdown();
    await this.executionMonitor.shutdown();
    await this.collaborationManager.shutdown();
    
    // Cancel all active executions
    for (const [executionId] of this.activeExecutions) {
      await this.cancelExecution(executionId);
    }
    
    this.emit('shutdown');
  }
}
