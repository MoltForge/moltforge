# MoltForge Architecture

## System Overview

MoltForge is designed as a modular, event-driven platform for deploying and managing autonomous AI agents.

## Architecture Diagram

```
                                   ┌──────────────────────────────────────────────────────────────┐
                                   │                        CLIENTS                                │
                                   │   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
                                   │   │Web App │  │  CLI   │  │  SDK   │  │Webhooks│            │
                                   │   └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘            │
                                   └───────┼──────────┼──────────┼──────────┼────────────────────┘
                                           │          │          │          │
                                           └──────────┴──────────┴──────────┘
                                                          │
                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           API GATEWAY                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │    Auth     │  │Rate Limiter │  │   Router    │  │  Validator  │  │   Logger    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
                    ▼                                     ▼                                     ▼
┌─────────────────────────────┐       ┌─────────────────────────────┐       ┌─────────────────────────────┐
│      AGENT SERVICE          │       │     EXECUTION SERVICE       │       │    MONITORING SERVICE       │
│  ┌───────────────────────┐  │       │  ┌───────────────────────┐  │       │  ┌───────────────────────┐  │
│  │  Agent CRUD           │  │       │  │  Runtime Engine       │  │       │  │  Metrics Collector    │  │
│  │  Configuration        │  │       │  │  Sandbox Manager      │  │       │  │  Log Aggregator       │  │
│  │  Version Control      │  │       │  │  Resource Allocator   │  │       │  │  Alert Manager        │  │
│  └───────────────────────┘  │       │  └───────────────────────┘  │       │  └───────────────────────┘  │
└─────────────────────────────┘       └─────────────────────────────┘       └─────────────────────────────┘
                    │                                     │                                     │
                    └─────────────────────────────────────┼─────────────────────────────────────┘
                                                          │
                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          EVENT BUS (Kafka/Redis)                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │agent.events │  │ log.events  │  │metric.events│  │ tool.events │  │system.events│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
                    ▼                                     ▼                                     ▼
┌─────────────────────────────┐       ┌─────────────────────────────┐       ┌─────────────────────────────┐
│       PostgreSQL            │       │          Redis              │       │       TimescaleDB           │
│  ┌───────────────────────┐  │       │  ┌───────────────────────┐  │       │  ┌───────────────────────┐  │
│  │  Agents               │  │       │  │  Session Cache        │  │       │  │  Time-series Metrics  │  │
│  │  Configurations       │  │       │  │  Pub/Sub              │  │       │  │  Agent Telemetry      │  │
│  │  User Data            │  │       │  │  Rate Limiting        │  │       │  │  Performance Data     │  │
│  └───────────────────────┘  │       │  └───────────────────────┘  │       │  └───────────────────────┘  │
└─────────────────────────────┘       └─────────────────────────────┘       └─────────────────────────────┘
```

## Component Details

### 1. API Gateway

The API Gateway serves as the single entry point for all client requests.

**Responsibilities:**
- Request authentication and authorization
- Rate limiting and throttling
- Request/response validation
- Load balancing
- API versioning

**Technologies:**
- Next.js API Routes (current)
- Kong/Nginx (planned for scale)

### 2. Agent Service

Manages the lifecycle and configuration of agents.

**Key Operations:**
```typescript
interface AgentService {
  create(config: AgentConfig): Promise<Agent>;
  get(id: string): Promise<Agent>;
  update(id: string, config: Partial<AgentConfig>): Promise<Agent>;
  delete(id: string): Promise<void>;
  list(filters: AgentFilters): Promise<Agent[]>;
  deploy(id: string): Promise<Deployment>;
  undeploy(id: string): Promise<void>;
}
```

### 3. Execution Service

Handles the actual execution of agents in sandboxed environments.

**Components:**
- **Runtime Engine**: Executes agent code
- **Sandbox Manager**: Creates and manages isolated environments
- **Resource Allocator**: Assigns CPU, memory, and network resources

**Execution Flow:**
```
1. Receive execution request
2. Allocate resources
3. Create sandbox
4. Load agent code
5. Initialize agent state
6. Execute agent loop
7. Handle events and tool calls
8. Persist state changes
9. Emit telemetry
10. Cleanup on termination
```

### 4. Monitoring Service

Provides observability into the system and agents.

**Features:**
- Real-time metrics collection
- Log aggregation and search
- Alerting and notifications
- Performance dashboards

**Metrics Collected:**
```yaml
agent_metrics:
  - agent_execution_time_seconds
  - agent_memory_usage_bytes
  - agent_cpu_usage_percent
  - agent_tool_calls_total
  - agent_errors_total
  - agent_state_size_bytes

system_metrics:
  - active_agents_count
  - pending_executions_count
  - event_bus_lag
  - api_request_duration_seconds
```

### 5. Event Bus

Enables asynchronous communication between services.

**Event Categories:**

| Category | Events |
|----------|--------|
| Agent | `created`, `started`, `stopped`, `error`, `completed` |
| Execution | `scheduled`, `running`, `paused`, `resumed` |
| Tool | `invoked`, `succeeded`, `failed` |
| System | `health`, `scale`, `deploy` |

### 6. Data Stores

**PostgreSQL** - Primary data store
- Agent configurations
- User accounts
- Deployment history
- Audit logs

**Redis** - Cache and messaging
- Session data
- Rate limit counters
- Pub/Sub for real-time updates
- Distributed locks

**TimescaleDB** - Time-series data
- Agent metrics
- Performance telemetry
- Cost tracking

## Data Flow

### Agent Creation Flow

```
┌────────┐     ┌─────────┐     ┌─────────────┐     ┌────────────┐
│ Client │────▶│   API   │────▶│   Agent     │────▶│ PostgreSQL │
│        │     │ Gateway │     │   Service   │     │            │
└────────┘     └─────────┘     └──────┬──────┘     └────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │  Event Bus  │
                               └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             ┌───────────┐     ┌───────────┐     ┌───────────┐
             │ Execution │     │ Monitoring│     │   Audit   │
             │  Service  │     │  Service  │     │  Service  │
             └───────────┘     └───────────┘     └───────────┘
```

### Agent Execution Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        EXECUTION SERVICE                            │
│                                                                    │
│  ┌──────────┐                                                      │
│  │ Trigger  │ (schedule, event, API)                               │
│  └────┬─────┘                                                      │
│       │                                                            │
│       ▼                                                            │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│  │  Queue   │────▶│ Executor │────▶│ Sandbox  │                   │
│  │ Manager  │     │          │     │          │                   │
│  └──────────┘     └────┬─────┘     └────┬─────┘                   │
│                        │                │                          │
│                        ▼                ▼                          │
│                   ┌──────────┐     ┌──────────┐                   │
│                   │  State   │◀───▶│  Agent   │                   │
│                   │  Store   │     │   Code   │                   │
│                   └──────────┘     └────┬─────┘                   │
│                                         │                          │
│                        ┌────────────────┼────────────────┐        │
│                        ▼                ▼                ▼        │
│                   ┌──────────┐     ┌──────────┐     ┌──────────┐ │
│                   │   LLM    │     │  Tools   │     │  Events  │ │
│                   │ Provider │     │ Registry │     │   Bus    │ │
│                   └──────────┘     └──────────┘     └──────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Scaling Strategy

### Horizontal Scaling

```
                         Load Balancer
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
      ┌─────────┐        ┌─────────┐        ┌─────────┐
      │ Node 1  │        │ Node 2  │        │ Node 3  │
      │         │        │         │        │         │
      │ ┌─────┐ │        │ ┌─────┐ │        │ ┌─────┐ │
      │ │ API │ │        │ │ API │ │        │ │ API │ │
      │ └─────┘ │        │ └─────┘ │        │ └─────┘ │
      │ ┌─────┐ │        │ ┌─────┐ │        │ ┌─────┐ │
      │ │Exec │ │        │ │Exec │ │        │ │Exec │ │
      │ └─────┘ │        │ └─────┘ │        │ └─────┘ │
      └─────────┘        └─────────┘        └─────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                         Shared State
                     (Redis + PostgreSQL)
```

### Auto-Scaling Policies

```yaml
scaling:
  api_gateway:
    min_replicas: 2
    max_replicas: 10
    target_cpu: 70%
    target_memory: 80%

  execution_service:
    min_replicas: 3
    max_replicas: 50
    target_agents_per_node: 100
    scale_up_threshold: 80%
    scale_down_threshold: 20%
```

## Security Architecture

### Network Security

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY ZONES                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    PUBLIC ZONE                        │ │
│  │  ┌────────────┐                                      │ │
│  │  │    CDN     │  (Static assets, rate limiting)      │ │
│  │  └────────────┘                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                     DMZ ZONE                          │ │
│  │  ┌────────────┐  ┌────────────┐                      │ │
│  │  │API Gateway │  │    WAF     │                      │ │
│  │  └────────────┘  └────────────┘                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                   PRIVATE ZONE                        │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │ │
│  │  │Services│  │  Data  │  │ Secrets│  │Execution│     │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Kubernetes Deployment

```yaml
# Simplified K8s architecture
namespace: moltforge

deployments:
  - api-gateway (3 replicas)
  - agent-service (3 replicas)
  - execution-service (5 replicas, autoscaled)
  - monitoring-service (2 replicas)

statefulsets:
  - postgresql (3 replicas, HA)
  - redis (3 replicas, cluster)
  - kafka (3 replicas)

services:
  - api-gateway (LoadBalancer)
  - internal services (ClusterIP)

configmaps:
  - runtime-config
  - agent-templates

secrets:
  - database-credentials
  - api-keys
  - tls-certificates
```

## Future Architecture

### Multi-Region Deployment

```
                    ┌─────────────────┐
                    │  Global Load    │
                    │    Balancer     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ US-East │         │ EU-West │         │ AP-East │
    │ Region  │         │ Region  │         │ Region  │
    └────┬────┘         └────┬────┘         └────┬────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Global State   │
                    │  Replication    │
                    └─────────────────┘
```

---

*This document is updated as the architecture evolves.*
