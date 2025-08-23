// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Workflow Engine for parsing and executing agent workflows
 */

import { z } from 'zod';
import { AgentWorkflow, AgentTask, WorkflowConfig } from './types';

export interface ParsedWorkflow {
  workflow: AgentWorkflow;
  graph: WorkflowGraph;
  validation: ValidationResult;
}

export interface WorkflowGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge[]>;
  entryPoints: string[];
  exitPoints: string[];
}

export interface GraphNode {
  id: string;
  task: AgentTask;
  inDegree: number;
  outDegree: number;
  level: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'dependency' | 'conditional' | 'parallel';
  condition?: string;
}

export interface ExecutionPlan {
  stages: AgentTask[][];
  dependencies: Map<string, string[]>;
  parallelizationOpportunities: string[][];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  taskId?: string;
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  taskId?: string;
  field: string;
  message: string;
  severity: 'warning';
}

export class WorkflowEngine {
  private config: WorkflowConfig;

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  /**
   * Parse and validate a workflow
   */
  async parseWorkflow(workflow: AgentWorkflow): Promise<ParsedWorkflow> {
    // Validate workflow structure
    const validation = await this.validateWorkflow(workflow);
    
    if (!validation.isValid && this.config.enableValidation) {
      throw new Error(`Invalid workflow: ${validation.errors[0]?.message}`);
    }
    
    // Build workflow graph
    const graph = this.buildWorkflowGraph(workflow);
    
    // Detect cycles
    if (this.hasCycles(graph)) {
      throw new Error('Workflow contains circular dependencies');
    }
    
    // Calculate node levels for execution ordering
    this.calculateNodeLevels(graph);
    
    return {
      workflow,
      graph,
      validation,
    };
  }

  /**
   * Create an execution plan from parsed workflow
   */
  async createExecutionPlan(parsedWorkflow: ParsedWorkflow): Promise<ExecutionPlan> {
    const { graph, workflow } = parsedWorkflow;
    const stages: AgentTask[][] = [];
    const dependencies = new Map<string, string[]>();
    
    // Group tasks by level for parallel execution
    const levelMap = new Map<number, AgentTask[]>();
    
    graph.nodes.forEach(node => {
      if (!levelMap.has(node.level)) {
        levelMap.set(node.level, []);
      }
      levelMap.get(node.level)!.push(node.task);
      
      // Build dependency map
      if (node.task.dependencies) {
        dependencies.set(node.id, node.task.dependencies);
      }
    });
    
    // Convert level map to stages
    const sortedLevels = Array.from(levelMap.keys()).sort((a, b) => a - b);
    sortedLevels.forEach(level => {
      stages.push(levelMap.get(level)!);
    });
    
    // Identify parallelization opportunities
    const parallelizationOpportunities = this.identifyParallelizationOpportunities(graph);
    
    return {
      stages,
      dependencies,
      parallelizationOpportunities,
    };
  }

  /**
   * Validate workflow structure and rules
   */
  private async validateWorkflow(workflow: AgentWorkflow): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check workflow metadata
    if (!workflow.id) {
      errors.push({
        field: 'id',
        message: 'Workflow ID is required',
        severity: 'error',
      });
    }
    
    if (!workflow.name) {
      errors.push({
        field: 'name',
        message: 'Workflow name is required',
        severity: 'error',
      });
    }
    
    // Check task count
    if (workflow.tasks.length === 0) {
      errors.push({
        field: 'tasks',
        message: 'Workflow must have at least one task',
        severity: 'error',
      });
    }
    
    if (workflow.tasks.length > this.config.maxTasks) {
      errors.push({
        field: 'tasks',
        message: `Workflow exceeds maximum task limit of ${this.config.maxTasks}`,
        severity: 'error',
      });
    }
    
    // Validate individual tasks
    const taskIds = new Set<string>();
    const agentIds = new Set<string>();
    
    for (const task of workflow.tasks) {
      // Check for duplicate task IDs
      if (taskIds.has(task.id)) {
        errors.push({
          taskId: task.id,
          field: 'id',
          message: `Duplicate task ID: ${task.id}`,
          severity: 'error',
        });
      }
      taskIds.add(task.id);
      
      // Validate task structure
      if (!task.agentId) {
        errors.push({
          taskId: task.id,
          field: 'agentId',
          message: 'Task must specify an agent ID',
          severity: 'error',
        });
      }
      agentIds.add(task.agentId);
      
      // Check dependencies exist
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (!taskIds.has(depId)) {
            errors.push({
              taskId: task.id,
              field: 'dependencies',
              message: `Unknown dependency: ${depId}`,
              severity: 'error',
            });
          }
        }
      }
      
      // Warn about missing timeout
      if (!task.timeout) {
        warnings.push({
          taskId: task.id,
          field: 'timeout',
          message: 'Consider setting a timeout for this task',
          severity: 'warning',
        });
      }
    }
    
    // Warn if too many different agents
    if (agentIds.size > 10) {
      warnings.push({
        field: 'agents',
        message: 'Workflow uses many different agents, consider consolidation',
        severity: 'warning',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Build a directed graph from workflow tasks
   */
  private buildWorkflowGraph(workflow: AgentWorkflow): WorkflowGraph {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge[]>();
    
    // Create nodes
    workflow.tasks.forEach(task => {
      nodes.set(task.id, {
        id: task.id,
        task,
        inDegree: 0,
        outDegree: 0,
        level: 0,
      });
      edges.set(task.id, []);
    });
    
    // Create edges based on dependencies
    workflow.tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          const edge: GraphEdge = {
            from: depId,
            to: task.id,
            type: 'dependency',
          };
          
          edges.get(depId)!.push(edge);
          nodes.get(depId)!.outDegree++;
          nodes.get(task.id)!.inDegree++;
        });
      }
    });
    
    // Identify entry and exit points
    const entryPoints = Array.from(nodes.values())
      .filter(node => node.inDegree === 0)
      .map(node => node.id);
    
    const exitPoints = Array.from(nodes.values())
      .filter(node => node.outDegree === 0)
      .map(node => node.id);
    
    return {
      nodes,
      edges,
      entryPoints,
      exitPoints,
    };
  }

  /**
   * Detect cycles in the workflow graph using DFS
   */
  private hasCycles(graph: WorkflowGraph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const edges = graph.edges.get(nodeId) || [];
      for (const edge of edges) {
        if (!visited.has(edge.to)) {
          if (hasCycleDFS(edge.to)) {
            return true;
          }
        } else if (recursionStack.has(edge.to)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // Check from all unvisited nodes
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycleDFS(nodeId)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Calculate execution levels using topological sort
   */
  private calculateNodeLevels(graph: WorkflowGraph): void {
    const inDegrees = new Map<string, number>();
    const queue: string[] = [];
    
    // Initialize in-degrees
    graph.nodes.forEach((node, id) => {
      inDegrees.set(id, node.inDegree);
      if (node.inDegree === 0) {
        queue.push(id);
        node.level = 0;
      }
    });
    
    // Process nodes level by level
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = graph.nodes.get(nodeId)!;
      const edges = graph.edges.get(nodeId) || [];
      
      edges.forEach(edge => {
        const targetNode = graph.nodes.get(edge.to)!;
        targetNode.level = Math.max(targetNode.level, node.level + 1);
        
        const newInDegree = inDegrees.get(edge.to)! - 1;
        inDegrees.set(edge.to, newInDegree);
        
        if (newInDegree === 0) {
          queue.push(edge.to);
        }
      });
    }
    
    // Check if all nodes were processed
    const unprocessed = Array.from(inDegrees.entries())
      .filter(([_, degree]) => degree > 0);
    
    if (unprocessed.length > 0) {
      throw new Error('Failed to calculate levels - possible cycle detected');
    }
  }

  /**
   * Identify opportunities for parallel execution
   */
  private identifyParallelizationOpportunities(
    graph: WorkflowGraph
  ): string[][] {
    const opportunities: string[][] = [];
    const levelGroups = new Map<number, string[]>();
    
    // Group nodes by level
    graph.nodes.forEach(node => {
      if (!levelGroups.has(node.level)) {
        levelGroups.set(node.level, []);
      }
      levelGroups.get(node.level)!.push(node.id);
    });
    
    // Find independent tasks at each level
    levelGroups.forEach((nodeIds, level) => {
      if (nodeIds.length > 1) {
        // Check if tasks are truly independent
        const independent = nodeIds.filter(id1 => {
          return !nodeIds.some(id2 => {
            if (id1 === id2) return false;
            // Check if there's a path between them
            return this.hasPath(graph, id1, id2) || this.hasPath(graph, id2, id1);
          });
        });
        
        if (independent.length > 1) {
          opportunities.push(independent);
        }
      }
    });
    
    return opportunities;
  }

  /**
   * Check if there's a path from source to target
   */
  private hasPath(graph: WorkflowGraph, source: string, target: string): boolean {
    const visited = new Set<string>();
    const queue = [source];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === target) return true;
      
      if (!visited.has(current)) {
        visited.add(current);
        const edges = graph.edges.get(current) || [];
        edges.forEach(edge => queue.push(edge.to));
      }
    }
    
    return false;
  }

  /**
   * Optimize workflow for better performance
   */
  async optimizeWorkflow(workflow: AgentWorkflow): Promise<AgentWorkflow> {
    const parsedWorkflow = await this.parseWorkflow(workflow);
    const { graph } = parsedWorkflow;
    
    // Clone workflow for optimization
    const optimizedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Apply optimization strategies
    
    // 1. Merge sequential tasks with same agent
    this.mergeSequentialTasks(optimizedWorkflow, graph);
    
    // 2. Reorder independent tasks for better resource utilization
    this.reorderIndependentTasks(optimizedWorkflow, graph);
    
    // 3. Add parallelization hints
    this.addParallelizationHints(optimizedWorkflow, graph);
    
    return optimizedWorkflow;
  }

  /**
   * Merge sequential tasks that use the same agent
   */
  private mergeSequentialTasks(
    workflow: AgentWorkflow,
    graph: WorkflowGraph
  ): void {
    // Implementation for merging sequential tasks
    // This is a placeholder for the actual optimization logic
  }

  /**
   * Reorder independent tasks for better resource utilization
   */
  private reorderIndependentTasks(
    workflow: AgentWorkflow,
    graph: WorkflowGraph
  ): void {
    // Implementation for reordering tasks
    // This is a placeholder for the actual optimization logic
  }

  /**
   * Add hints for parallel execution
   */
  private addParallelizationHints(
    workflow: AgentWorkflow,
    graph: WorkflowGraph
  ): void {
    // Implementation for adding parallelization hints
    // This is a placeholder for the actual optimization logic
  }
}
