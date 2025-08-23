# 🤖 Multi-Agent Orchestrator

A powerful orchestration engine for managing complex multi-agent workflows in CodexOS.

## ✨ Features

### 🎯 **Multi-Agent Orchestration**
- **Complex Workflow Management**: Define and execute sophisticated agent workflows
- **Dynamic Agent Allocation**: Intelligent agent pool management with auto-scaling
- **Dependency Resolution**: Automatic handling of task dependencies
- **Parallel Execution**: Optimize performance with parallel task execution

### 🧠 **Advanced AI Model Integration**
- **Multi-Provider Support**: OpenAI, Anthropic, Google, and more
- **Intelligent Model Selection**: Automatically choose the best model for each task
- **Cost Optimization**: Balance performance and cost across different models
- **Rate Limiting**: Built-in rate limiting and retry mechanisms

### 👥 **Real-time Collaboration**
- **Multi-user Development**: Multiple users can work on agent workflows simultaneously
- **Conflict Resolution**: Advanced conflict resolution with OT/CRDT support
- **Live Cursors**: See where other users are working in real-time
- **Shared Context**: Synchronized state across all participants

### 📊 **Advanced Analytics**
- **Performance Monitoring**: Real-time execution monitoring and profiling
- **Anomaly Detection**: Automatic detection of performance anomalies
- **Bottleneck Identification**: Find and fix performance bottlenecks
- **Optimization Insights**: AI-powered recommendations for improvements

## 🚀 Quick Start

```typescript
import { MultiAgentOrchestrator } from '@codexos/multi-agent-orchestrator';

// Initialize orchestrator
const orchestrator = new MultiAgentOrchestrator({
  redis: {
    host: 'localhost',
    port: 6379,
  },
  workflow: {
    maxDepth: 10,
    maxTasks: 100,
    defaultTimeout: 30000,
    enableValidation: true,
  },
  agents: {
    minAgents: 2,
    maxAgents: 10,
    scaleUpThreshold: 80,
    scaleDownThreshold: 20,
    healthCheckInterval: 5000,
  },
  monitoring: {
    enableMetrics: true,
    enableTracing: true,
    enableProfiling: true,
    alertThresholds: {
      taskFailureRate: 10,
      executionDuration: 60000,
      memoryUsage: 1024 * 1024 * 512, // 512MB
      cpuUsage: 80,
    },
  },
  collaboration: {
    enableRealtime: true,
    maxParticipants: 10,
    sessionTimeout: 3600000, // 1 hour
    conflictResolution: 'operational-transform',
  },
});

// Define a workflow
const workflow = {
  id: 'data-processing-workflow',
  name: 'Data Processing Pipeline',
  version: '1.0.0',
  tasks: [
    {
      id: 'fetch-data',
      name: 'Fetch Data',
      agentId: 'data-fetcher',
      type: 'sequential',
      input: {
        prompt: 'Fetch user data from database',
        schema: z.object({
          userId: z.string(),
        }),
      },
    },
    {
      id: 'process-data',
      name: 'Process Data',
      agentId: 'data-processor',
      type: 'parallel',
      dependencies: ['fetch-data'],
      input: {
        prompt: 'Process and enrich user data',
      },
    },
    {
      id: 'generate-report',
      name: 'Generate Report',
      agentId: 'report-generator',
      type: 'sequential',
      dependencies: ['process-data'],
      input: {
        prompt: 'Generate comprehensive user report',
      },
    },
  ],
};

// Execute workflow
const execution = await orchestrator.executeWorkflow(workflow, {
  userId: 'user-123',
});

// Monitor execution
orchestrator.on('task:completed', (task) => {
  console.log(`Task ${task.taskId} completed`);
});

orchestrator.on('workflow:completed', (execution) => {
  console.log('Workflow completed:', execution.results);
});
```

## 🏗️ Architecture

### Core Components

1. **Orchestrator**: Main coordination engine
2. **Workflow Engine**: Parses and validates workflows
3. **Agent Pool**: Manages agent lifecycle and allocation
4. **Model Integration**: Handles LLM provider integration
5. **Collaboration Manager**: Manages real-time collaboration
6. **Execution Monitor**: Tracks performance and generates insights

### Workflow Definition

```typescript
interface AgentWorkflow {
  id: string;
  name: string;
  version: string;
  tasks: AgentTask[];
  metadata?: {
    author?: string;
    created?: Date;
    tags?: string[];
  };
}

interface AgentTask {
  id: string;
  name: string;
  agentId: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'loop';
  input: {
    prompt?: string;
    data?: any;
    schema?: ZodSchema;
  };
  dependencies?: string[];
  conditions?: TaskCondition[];
  retryPolicy?: {
    maxAttempts: number;
    backoffType: 'fixed' | 'exponential';
    initialDelay: number;
  };
  timeout?: number;
}
```

## 🤝 Real-time Collaboration

### Creating a Collaboration Session

```typescript
// Create collaboration session
const session = await orchestrator.collaborationManager.createSession(
  workflow.id,
  'user-123'
);

// Join session
await orchestrator.collaborationManager.joinSession(
  session.id,
  'user-456'
);

// Send updates
await orchestrator.collaborationManager.sendUpdate({
  sessionId: session.id,
  participantId: 'user-123',
  type: 'data',
  path: ['tasks', '0', 'input', 'prompt'],
  operation: {
    type: 'replace',
    content: 'Updated prompt text',
  },
  timestamp: new Date(),
});

// Track cursors
orchestrator.collaborationManager.updateCursorPosition(
  session.id,
  'user-123',
  ['tasks', '0'],
  15
);
```

## 📊 Analytics & Monitoring

### Performance Monitoring

```typescript
// Get workflow analytics
const analytics = await orchestrator.executionMonitor.getWorkflowAnalytics(
  workflow.id,
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

console.log('Performance Metrics:', analytics.performance);
console.log('Insights:', analytics.insights);

// Monitor alerts
orchestrator.executionMonitor.on('alert', (alert) => {
  if (alert.severity === 'critical') {
    // Handle critical alerts
    console.error('Critical alert:', alert);
  }
});
```

### Custom Metrics

```typescript
// Get execution statistics
const stats = await orchestrator.getStatistics();
console.log('Active Workflows:', stats.activeWorkflows);
console.log('Agent Pool Size:', stats.agentPoolSize);

// Get model performance comparison
const modelComparison = orchestrator.modelIntegration.getModelComparison();
console.log('Model Performance:', modelComparison);
```

## 🔧 Advanced Configuration

### Model Selection Strategy

```typescript
// Configure model selection
const modelSelection = await orchestrator.modelIntegration.selectModel({
  capabilities: [
    { type: 'text-generation', quality: 'excellent' },
    { type: 'reasoning', quality: 'excellent' },
  ],
  contextLength: 32000,
  maxCost: 0.10, // $0.10 per request
  maxLatency: 5000, // 5 seconds
  preferredProvider: 'openai',
});
```

### Custom Agent Types

```typescript
// Register custom agent type
orchestrator.agentPool.registerAgentType('custom-agent', {
  create: async (config) => ({
    execute: async (task) => {
      // Custom execution logic
      return { result: 'custom result' };
    },
  }),
});
```

## 🎯 Best Practices

1. **Workflow Design**
   - Keep workflows modular and reusable
   - Use meaningful task IDs and names
   - Define clear dependencies
   - Set appropriate timeouts

2. **Performance Optimization**
   - Use parallel execution where possible
   - Implement caching for deterministic tasks
   - Choose appropriate models for each task
   - Monitor and act on performance insights

3. **Collaboration**
   - Use appropriate conflict resolution strategies
   - Implement proper access controls
   - Monitor active sessions
   - Handle disconnections gracefully

4. **Error Handling**
   - Define retry policies for critical tasks
   - Implement fallback strategies
   - Monitor failure rates
   - Log errors comprehensively

## 📚 API Reference

### Orchestrator Methods

- `executeWorkflow(workflow, context)`: Execute a workflow
- `cancelExecution(executionId)`: Cancel running execution
- `getExecution(executionId)`: Get execution details
- `getStatistics()`: Get orchestrator statistics

### Events

- `workflow:started`: Workflow execution started
- `workflow:completed`: Workflow execution completed
- `workflow:failed`: Workflow execution failed
- `task:started`: Task execution started
- `task:completed`: Task execution completed
- `task:failed`: Task execution failed
- `alert`: Performance or error alert

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## 📄 License

LicenseRef-NIA-Proprietary - see LICENSE file for details.
