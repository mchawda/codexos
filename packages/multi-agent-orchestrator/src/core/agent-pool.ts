// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Agent Pool Manager for dynamic agent allocation and management
 */

import { EventEmitter } from 'eventemitter3';
import { Agent, AgentPoolConfig, AgentMetrics } from './types';
import { ModelIntegration } from './model-integration';

export interface AgentInstance {
  agent: Agent;
  instance: any; // Actual agent implementation
  lastUsed: Date;
  activeRequests: number;
}

export interface PoolStatistics {
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  offlineAgents: number;
  averageUtilization: number;
  queuedRequests: number;
}

export class AgentPool extends EventEmitter {
  private config: AgentPoolConfig;
  private agents: Map<string, AgentInstance>;
  private agentQueue: string[];
  private requestQueue: Array<{
    agentId: string;
    resolve: (agent: any) => void;
    reject: (error: Error) => void;
    timestamp: Date;
  }>;
  private modelIntegration: ModelIntegration;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private scaleCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: AgentPoolConfig) {
    super();
    this.config = config;
    this.agents = new Map();
    this.agentQueue = [];
    this.requestQueue = [];
    this.modelIntegration = new ModelIntegration();
    
    this.initialize();
  }

  /**
   * Initialize the agent pool
   */
  private async initialize(): Promise<void> {
    // Create initial agents
    for (let i = 0; i < this.config.minAgents; i++) {
      await this.createAgent(`agent-${i}`, this.getDefaultAgentConfig());
    }
    
    // Start health checks
    this.startHealthChecks();
    
    // Start auto-scaling
    this.startAutoScaling();
    
    this.emit('pool:initialized', { size: this.agents.size });
  }

  /**
   * Get an agent from the pool
   */
  async getAgent(agentId?: string): Promise<any> {
    // If specific agent requested
    if (agentId) {
      const agentInstance = this.agents.get(agentId);
      if (!agentInstance) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      if (agentInstance.agent.status !== 'available') {
        // Queue the request
        return this.queueRequest(agentId);
      }
      
      return this.allocateAgent(agentInstance);
    }
    
    // Get any available agent
    const availableAgent = this.findAvailableAgent();
    if (availableAgent) {
      return this.allocateAgent(availableAgent);
    }
    
    // No available agents, check if we can scale up
    if (this.agents.size < this.config.maxAgents) {
      const newAgent = await this.scaleUp();
      if (newAgent) {
        return this.allocateAgent(newAgent);
      }
    }
    
    // Queue the request
    return this.queueRequest();
  }

  /**
   * Release an agent back to the pool
   */
  async releaseAgent(agentId: string): Promise<void> {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    agentInstance.activeRequests--;
    if (agentInstance.activeRequests === 0) {
      agentInstance.agent.status = 'available';
      this.agentQueue.push(agentId);
      
      // Process queued requests
      this.processRequestQueue();
      
      // Update metrics
      this.updateAgentMetrics(agentId);
      
      this.emit('agent:released', { agentId });
    }
  }

  /**
   * Create a new agent
   */
  private async createAgent(
    agentId: string,
    config: any
  ): Promise<AgentInstance> {
    const agent: Agent = {
      id: agentId,
      name: `Agent ${agentId}`,
      type: config.type || 'llm',
      capabilities: config.capabilities || ['text-generation'],
      configuration: config.configuration || {},
      status: 'available',
      metrics: {
        totalExecutions: 0,
        successRate: 100,
        averageExecutionTime: 0,
      },
    };
    
    // Create agent instance based on type
    let instance;
    switch (agent.type) {
      case 'llm':
        instance = await this.modelIntegration.createLLMAgent(agent.configuration);
        break;
      case 'tool':
        instance = await this.createToolAgent(agent.configuration);
        break;
      case 'hybrid':
        instance = await this.createHybridAgent(agent.configuration);
        break;
      default:
        instance = await this.createCustomAgent(agent.configuration);
    }
    
    const agentInstance: AgentInstance = {
      agent,
      instance,
      lastUsed: new Date(),
      activeRequests: 0,
    };
    
    this.agents.set(agentId, agentInstance);
    this.agentQueue.push(agentId);
    
    this.emit('agent:created', { agentId, type: agent.type });
    
    return agentInstance;
  }

  /**
   * Create a tool-based agent
   */
  private async createToolAgent(config: any): Promise<any> {
    // Implementation for tool agent
    return {
      execute: async (task: any) => {
        // Tool execution logic
        return { result: 'tool result' };
      },
    };
  }

  /**
   * Create a hybrid agent (LLM + tools)
   */
  private async createHybridAgent(config: any): Promise<any> {
    const llmAgent = await this.modelIntegration.createLLMAgent(config);
    const tools = config.tools || [];
    
    return {
      execute: async (task: any) => {
        // Hybrid execution logic
        if (task.requiresTool) {
          // Use tool
          return { result: 'tool result' };
        } else {
          // Use LLM
          return llmAgent.execute(task);
        }
      },
    };
  }

  /**
   * Create a custom agent
   */
  private async createCustomAgent(config: any): Promise<any> {
    // Implementation for custom agent
    return {
      execute: async (task: any) => {
        // Custom execution logic
        return { result: 'custom result' };
      },
    };
  }

  /**
   * Find an available agent
   */
  private findAvailableAgent(): AgentInstance | null {
    // Get the least recently used available agent
    const availableAgentId = this.agentQueue.shift();
    if (!availableAgentId) return null;
    
    const agentInstance = this.agents.get(availableAgentId);
    if (!agentInstance || agentInstance.agent.status !== 'available') {
      // Try next agent
      return this.findAvailableAgent();
    }
    
    return agentInstance;
  }

  /**
   * Allocate an agent for use
   */
  private allocateAgent(agentInstance: AgentInstance): any {
    agentInstance.agent.status = 'busy';
    agentInstance.activeRequests++;
    agentInstance.lastUsed = new Date();
    
    // Remove from available queue
    const queueIndex = this.agentQueue.indexOf(agentInstance.agent.id);
    if (queueIndex > -1) {
      this.agentQueue.splice(queueIndex, 1);
    }
    
    this.emit('agent:allocated', { agentId: agentInstance.agent.id });
    
    return agentInstance.instance;
  }

  /**
   * Queue a request for an agent
   */
  private queueRequest(agentId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        agentId: agentId || '',
        resolve,
        reject,
        timestamp: new Date(),
      });
      
      this.emit('request:queued', { queueSize: this.requestQueue.length });
    });
  }

  /**
   * Process queued requests
   */
  private processRequestQueue(): void {
    while (this.requestQueue.length > 0 && this.agentQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      // Check if request is for specific agent
      if (request.agentId) {
        const agentInstance = this.agents.get(request.agentId);
        if (agentInstance && agentInstance.agent.status === 'available') {
          const agent = this.allocateAgent(agentInstance);
          request.resolve(agent);
        } else {
          // Re-queue the request
          this.requestQueue.unshift(request);
          break;
        }
      } else {
        // Any available agent
        const availableAgent = this.findAvailableAgent();
        if (availableAgent) {
          const agent = this.allocateAgent(availableAgent);
          request.resolve(agent);
        } else {
          // Re-queue the request
          this.requestQueue.unshift(request);
          break;
        }
      }
    }
  }

  /**
   * Start health checks for agents
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [agentId, agentInstance] of this.agents) {
        try {
          // Perform health check
          const isHealthy = await this.checkAgentHealth(agentInstance);
          
          if (!isHealthy && agentInstance.agent.status !== 'offline') {
            agentInstance.agent.status = 'offline';
            this.emit('agent:unhealthy', { agentId });
            
            // Remove from available queue
            const queueIndex = this.agentQueue.indexOf(agentId);
            if (queueIndex > -1) {
              this.agentQueue.splice(queueIndex, 1);
            }
          } else if (isHealthy && agentInstance.agent.status === 'offline') {
            agentInstance.agent.status = 'available';
            this.agentQueue.push(agentId);
            this.emit('agent:recovered', { agentId });
          }
        } catch (error) {
          this.emit('health-check:error', { agentId, error });
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Check agent health
   */
  private async checkAgentHealth(agentInstance: AgentInstance): Promise<boolean> {
    try {
      // Simple health check - can be extended
      if (agentInstance.instance.healthCheck) {
        return await agentInstance.instance.healthCheck();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Start auto-scaling
   */
  private startAutoScaling(): void {
    this.scaleCheckInterval = setInterval(async () => {
      const stats = this.getStatistics();
      
      // Scale up if needed
      if (stats.averageUtilization > this.config.scaleUpThreshold && 
          this.agents.size < this.config.maxAgents) {
        await this.scaleUp();
      }
      
      // Scale down if needed
      if (stats.averageUtilization < this.config.scaleDownThreshold && 
          this.agents.size > this.config.minAgents) {
        await this.scaleDown();
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Scale up by adding new agents
   */
  private async scaleUp(): Promise<AgentInstance | null> {
    if (this.agents.size >= this.config.maxAgents) {
      return null;
    }
    
    const newAgentId = `agent-${this.agents.size}`;
    const newAgent = await this.createAgent(newAgentId, this.getDefaultAgentConfig());
    
    this.emit('pool:scaled-up', { 
      newSize: this.agents.size,
      agentId: newAgentId 
    });
    
    return newAgent;
  }

  /**
   * Scale down by removing idle agents
   */
  private async scaleDown(): Promise<void> {
    if (this.agents.size <= this.config.minAgents) {
      return;
    }
    
    // Find the least recently used idle agent
    let oldestIdleAgent: AgentInstance | null = null;
    let oldestIdleAgentId: string | null = null;
    
    for (const [agentId, agentInstance] of this.agents) {
      if (agentInstance.agent.status === 'available' && 
          agentInstance.activeRequests === 0) {
        if (!oldestIdleAgent || 
            agentInstance.lastUsed < oldestIdleAgent.lastUsed) {
          oldestIdleAgent = agentInstance;
          oldestIdleAgentId = agentId;
        }
      }
    }
    
    if (oldestIdleAgentId) {
      // Remove agent
      this.agents.delete(oldestIdleAgentId);
      
      // Remove from queue
      const queueIndex = this.agentQueue.indexOf(oldestIdleAgentId);
      if (queueIndex > -1) {
        this.agentQueue.splice(queueIndex, 1);
      }
      
      this.emit('pool:scaled-down', { 
        newSize: this.agents.size,
        removedAgentId: oldestIdleAgentId 
      });
    }
  }

  /**
   * Get default agent configuration
   */
  private getDefaultAgentConfig(): any {
    return {
      type: 'llm',
      capabilities: ['text-generation', 'reasoning'],
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
      },
    };
  }

  /**
   * Update agent metrics
   */
  private updateAgentMetrics(agentId: string): void {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance) return;
    
    const metrics = agentInstance.agent.metrics!;
    metrics.totalExecutions++;
    metrics.lastExecutionTime = new Date();
    
    // Update average execution time (simplified)
    // In real implementation, track actual execution times
  }

  /**
   * Get pool statistics
   */
  getStatistics(): PoolStatistics {
    let availableCount = 0;
    let busyCount = 0;
    let offlineCount = 0;
    let totalUtilization = 0;
    
    this.agents.forEach(agentInstance => {
      switch (agentInstance.agent.status) {
        case 'available':
          availableCount++;
          break;
        case 'busy':
          busyCount++;
          totalUtilization += 1;
          break;
        case 'offline':
          offlineCount++;
          break;
      }
    });
    
    const totalAgents = this.agents.size;
    const averageUtilization = totalAgents > 0 ? 
      (totalUtilization / totalAgents) * 100 : 0;
    
    return {
      totalAgents,
      availableAgents: availableCount,
      busyAgents: busyCount,
      offlineAgents: offlineCount,
      averageUtilization,
      queuedRequests: this.requestQueue.length,
    };
  }

  /**
   * Get pool size
   */
  async getPoolSize(): Promise<number> {
    return this.agents.size;
  }

  /**
   * Shutdown the agent pool
   */
  async shutdown(): Promise<void> {
    // Clear intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.scaleCheckInterval) {
      clearInterval(this.scaleCheckInterval);
    }
    
    // Reject queued requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('Agent pool shutting down'));
    });
    this.requestQueue = [];
    
    // Clear agents
    this.agents.clear();
    this.agentQueue = [];
    
    this.emit('pool:shutdown');
  }
}
