# MoltForge SDK Guide

## Overview

The MoltForge SDK provides a simple, powerful interface for building and deploying AI agents. This guide covers everything you need to get started.

## Installation

```bash
npm install @moltforge/sdk
```

## Quick Start

```typescript
import { AIRuntime, Agent } from '@moltforge/sdk';

// Initialize the runtime
const runtime = new AIRuntime({
  apiKey: process.env.MOLTFORGE_API_KEY,
  baseUrl: 'https://api.moltforge.dev', // or your self-hosted URL
});

// Create a simple agent
const agent = new Agent({
  name: 'my-first-agent',
  type: 'automation',
  description: 'A simple automation agent',
});

// Deploy the agent
await runtime.deploy(agent);
```

## Agent Types

### Trading Agent

```typescript
import { TradingAgent, Strategy } from '@moltforge/sdk';

const tradingAgent = new TradingAgent({
  name: 'btc-momentum-bot',
  exchange: 'binance',
  symbol: 'BTC/USDT',
  strategy: Strategy.MOMENTUM,
  config: {
    timeframe: '1h',
    lookbackPeriod: 14,
    rsiThreshold: { buy: 30, sell: 70 },
    positionSize: 0.1, // 10% of portfolio
    stopLoss: 0.02,    // 2%
    takeProfit: 0.05,  // 5%
  },
});

// Event handlers
tradingAgent.on('signal', (signal) => {
  console.log(`Signal: ${signal.action} at ${signal.price}`);
});

tradingAgent.on('trade', (trade) => {
  console.log(`Trade executed: ${trade.side} ${trade.amount} @ ${trade.price}`);
});

tradingAgent.on('error', (error) => {
  console.error('Agent error:', error);
});

await runtime.deploy(tradingAgent);
```

### Conversational Agent

```typescript
import { ConversationalAgent, LLMProvider } from '@moltforge/sdk';

const chatAgent = new ConversationalAgent({
  name: 'support-assistant',
  llm: {
    provider: LLMProvider.ANTHROPIC,
    model: 'claude-3-opus',
    temperature: 0.7,
  },
  systemPrompt: `You are a helpful customer support assistant for MoltForge.
    You help users with questions about deploying and managing AI agents.`,
  memory: {
    type: 'sliding-window',
    maxMessages: 20,
  },
  tools: [
    {
      name: 'search_docs',
      description: 'Search the documentation',
      parameters: {
        query: { type: 'string', description: 'Search query' },
      },
      handler: async ({ query }) => {
        // Implement documentation search
        return searchDocs(query);
      },
    },
    {
      name: 'create_ticket',
      description: 'Create a support ticket',
      parameters: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      handler: async ({ title, description, priority }) => {
        return createSupportTicket({ title, description, priority });
      },
    },
  ],
});

// Handle incoming messages
chatAgent.on('message', async (message, context) => {
  const response = await chatAgent.respond(message, context);
  console.log('Response:', response);
});

await runtime.deploy(chatAgent);
```

### Automation Agent

```typescript
import { AutomationAgent, Schedule, Trigger } from '@moltforge/sdk';

const automationAgent = new AutomationAgent({
  name: 'data-pipeline',
  description: 'Daily data synchronization pipeline',
  schedule: Schedule.DAILY('09:00', 'UTC'),
  // Or use triggers:
  // trigger: Trigger.WEBHOOK('/api/trigger/data-sync'),
  // trigger: Trigger.EVENT('order.created'),

  steps: [
    {
      name: 'fetch-data',
      action: async (context) => {
        const data = await fetchExternalData();
        return { data };
      },
    },
    {
      name: 'transform-data',
      action: async (context) => {
        const transformed = transformData(context.data);
        return { transformed };
      },
    },
    {
      name: 'load-data',
      action: async (context) => {
        await loadToDatabase(context.transformed);
        return { success: true };
      },
    },
  ],

  onError: async (error, step, context) => {
    await sendAlert(`Pipeline failed at ${step}: ${error.message}`);
    // Optionally retry
    return { retry: true, delay: 5000 };
  },

  onComplete: async (result) => {
    await sendNotification('Pipeline completed successfully');
  },
});

await runtime.deploy(automationAgent);
```

## Custom Agents

Create fully custom agents by extending the base `Agent` class:

```typescript
import { Agent, Tool, State, Event } from '@moltforge/sdk';

class CustomResearchAgent extends Agent {
  @State()
  researchTopics: string[] = [];

  @State()
  findings: Map<string, string[]> = new Map();

  constructor() {
    super({
      name: 'research-agent',
      type: 'custom',
      version: '1.0.0',
    });
  }

  @Tool({
    name: 'web_search',
    description: 'Search the web for information',
  })
  async webSearch(query: string): Promise<SearchResult[]> {
    // Implement web search
    return await performWebSearch(query);
  }

  @Tool({
    name: 'summarize',
    description: 'Summarize a piece of text',
  })
  async summarize(text: string): Promise<string> {
    return await this.llm.complete({
      prompt: `Summarize the following text:\n\n${text}`,
      maxTokens: 200,
    });
  }

  @Event('topic.added')
  async onTopicAdded(topic: string): Promise<void> {
    this.researchTopics.push(topic);

    // Perform research
    const results = await this.webSearch(topic);
    const summaries = await Promise.all(
      results.map(r => this.summarize(r.content))
    );

    this.findings.set(topic, summaries);

    // Emit event
    this.emit('research.completed', { topic, findings: summaries });
  }

  async run(): Promise<void> {
    // Main agent loop
    while (true) {
      const task = await this.waitForTask();

      if (task.type === 'research') {
        await this.onTopicAdded(task.topic);
      }

      await this.checkpoint(); // Save state
    }
  }
}
```

## State Management

### Persistent State

```typescript
import { Agent, State, StateStore } from '@moltforge/sdk';

class StatefulAgent extends Agent {
  // Automatically persisted between runs
  @State({ persist: true })
  conversationHistory: Message[] = [];

  @State({ persist: true })
  userPreferences: Record<string, any> = {};

  // Ephemeral state (not persisted)
  @State({ persist: false })
  currentSession: Session | null = null;
}
```

### Manual State Operations

```typescript
// Save state checkpoint
await agent.checkpoint();

// Restore from checkpoint
await agent.restore(checkpointId);

// Clear state
await agent.clearState();
```

## Event Handling

```typescript
// Subscribe to events
agent.on('started', () => console.log('Agent started'));
agent.on('stopped', () => console.log('Agent stopped'));
agent.on('error', (err) => console.error('Error:', err));
agent.on('tool.called', (tool, args) => console.log(`Tool: ${tool}`, args));

// Emit custom events
agent.emit('custom.event', { data: 'value' });

// Cross-agent communication
runtime.broadcast('global.event', { message: 'Hello all agents' });
```

## Monitoring & Observability

```typescript
// Get agent metrics
const metrics = await runtime.getMetrics(agent.id);
console.log(metrics);
// {
//   executionTime: 1234,
//   memoryUsage: 52428800,
//   toolCalls: 15,
//   errors: 0,
//   uptime: 3600000
// }

// Get agent logs
const logs = await runtime.getLogs(agent.id, {
  level: 'info',
  since: Date.now() - 3600000, // Last hour
  limit: 100,
});

// Stream real-time logs
const logStream = runtime.streamLogs(agent.id);
logStream.on('log', (log) => console.log(log));
```

## Deployment Options

### Deploy to Cloud

```typescript
await runtime.deploy(agent, {
  environment: 'production',
  replicas: 3,
  resources: {
    memory: '512Mi',
    cpu: '0.5',
  },
  autoscaling: {
    minReplicas: 1,
    maxReplicas: 10,
    targetCPU: 70,
  },
});
```

### Deploy Locally

```typescript
await runtime.deployLocal(agent, {
  port: 3001,
  debug: true,
});
```

## API Reference

See the full [API Reference](./API.md) for complete documentation.

## Examples

Check out the [examples directory](../examples/) for more complete examples:

- `examples/trading-bot/` - Complete trading bot implementation
- `examples/chat-assistant/` - Conversational AI assistant
- `examples/data-pipeline/` - Automated data processing
- `examples/multi-agent/` - Multi-agent collaboration
