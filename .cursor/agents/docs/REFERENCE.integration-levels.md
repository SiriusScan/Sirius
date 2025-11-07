---
title: "Integration Levels Reference"
description: "Complete reference for system integration levels in agent identities"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["reference", "integration", "system-architecture"]
categories: ["ai-tooling", "architecture"]
difficulty: "intermediate"
prerequisites: ["ABOUT.agent-identities.md", "SPECIFICATION.agent-identity.md"]
related_docs:
  - "ABOUT.agent-identities.md"
  - "SPECIFICATION.agent-identity.md"
  - "GUIDE.creating-agent-identities.md"
  - "README.architecture.md"
dependencies: []
llm_context: "medium"
search_keywords:
  ["integration levels", "system integration", "architecture depth"]
---

# Integration Levels Reference

Complete guide to determining and implementing appropriate system integration levels for agent identities.

## Integration Level Overview

| Level      | Focus                 | System Knowledge   | Architecture Detail   | Protocol Knowledge         | Use Cases                           |
| ---------- | --------------------- | ------------------ | --------------------- | -------------------------- | ----------------------------------- |
| **none**   | Isolated work         | None required      | None                  | None                       | UI design, documentation, product   |
| **low**    | Interface consumption | API contracts      | High-level overview   | HTTP/REST basics           | Frontend, simple services           |
| **medium** | Service integration   | Service boundaries | Component diagrams    | REST, basic message queues | Backend APIs, middleware            |
| **high**   | System architecture   | End-to-end flows   | Detailed architecture | All protocols, data flows  | Infrastructure, distributed systems |

## None - Isolated Work

### Characteristics

Agents with no system integration work independently without needing to understand how services connect or communicate.

### When to Use

- **Pure UI/UX Design**: Design systems, component libraries, visual design
- **Documentation**: Technical writing, API docs without implementation
- **Product Management**: Feature planning, stakeholder communication
- **Content Creation**: Marketing content, user guides

### What to Include

**Required Sections:**

- Role summary
- Key documentation (design/product focused)
- Core responsibilities
- Tools and workflows (design tools, document systems)
- Common tasks (design/writing tasks)
- Troubleshooting (tool-specific issues)

**Omit:**

- System Integration section
- Protocol details
- Architecture diagrams
- Technical data flows

### Example Agents

#### UX Designer

```yaml
system_integration_level: "none"
specialization: ["user research", "wireframing", "prototyping"]
technology_stack: ["Figma", "Miro", "UserTesting"]
```

**Focus:**

- Design tools and workflows
- User research methods
- Prototyping and testing
- Collaboration with engineering

**No need to understand:**

- API implementation
- Database structure
- Service communication
- Infrastructure

#### Technical Writer

```yaml
system_integration_level: "none"
specialization: ["API documentation", "user guides", "tutorials"]
technology_stack: ["Markdown", "documentation systems", "diagrams"]
```

**Focus:**

- Documentation standards
- Writing workflows
- Publishing systems
- Content organization

**No need to understand:**

- How services communicate
- Implementation details
- Protocol specifics
- Infrastructure setup

## Low - Interface Consumption

### Characteristics

Agents that consume interfaces (usually APIs) but don't need deep understanding of implementation or inter-service communication.

### When to Use

- **Frontend Engineers**: Consuming REST/GraphQL APIs
- **Simple Services**: Single-purpose microservices
- **QA Engineers**: Testing interfaces without implementation knowledge
- **Integration Scripts**: Simple automation consuming APIs

### What to Include

**System Integration Section (Brief):**

```markdown
## System Integration

### Integration Overview

Consumes Sirius REST APIs for data retrieval and user actions.

### Communication

- **REST APIs**: Standard HTTP requests to backend services
- **Authentication**: JWT tokens in Authorization header
- **Data Format**: JSON request/response

### Key Integration Points

- `/api/scans` - Scan management
- `/api/vulnerabilities` - Vulnerability data
- `/api/agents` - Agent information
```

**Keep It High-Level:**

- API endpoints used
- Authentication method
- Data format
- No protocol implementation details
- No inter-service communication

### Example Agents

#### Frontend Engineer

```yaml
system_integration_level: "low"
specialization: ["React", "Next.js", "UI components"]
technology_stack: ["TypeScript", "React", "Next.js", "Tailwind"]
```

**Integration Section:**

```markdown
## System Integration

### Integration Overview

Frontend consumes Sirius API via tRPC for type-safe communication.

### Communication

- **tRPC**: Type-safe API calls
- **Authentication**: Session-based with JWT
- **Real-time**: WebSocket for scan updates

### Key Endpoints

- `scan.start` - Initiate vulnerability scans
- `scan.getResults` - Retrieve scan results
- `agent.list` - Get connected agents
```

**What They Need:**

- API contracts and types
- Authentication flow
- Error handling patterns
- Real-time update mechanisms

**What They Don't Need:**

- How backend processes requests
- Database schema
- Message queue implementation
- Service-to-service communication

## Medium - Service Integration

### Characteristics

Agents that implement services requiring understanding of adjacent services, protocols, and integration patterns.

### When to Use

- **Backend API Engineers**: Building REST/GraphQL APIs
- **Service Engineers**: Implementing microservices
- **DevOps Engineers**: Service deployment and orchestration
- **Integration Engineers**: Connecting multiple services

### What to Include

**System Integration Section (Detailed):**

```markdown
## System Integration

### Integration Architecture

[Component diagram showing service + adjacent services]

### Communication Protocols

- **REST**: Detailed endpoint specifications
- **Message Queue**: Queue names, message formats
- **Database**: Connection patterns, transaction handling

### Data Flows

Key data flows with processing steps

### Key Integration Points

Detailed integration with specific services
```

**Level of Detail:**

- Component-level architecture
- Protocol specifications
- Message formats
- Data flow diagrams
- Error handling patterns
- Integration testing approaches

### Example Agents

#### Backend API Engineer

```yaml
system_integration_level: "medium"
specialization: ["REST APIs", "database integration", "message queues"]
technology_stack: ["Go", "Fiber", "PostgreSQL", "RabbitMQ"]
```

**Integration Section:**

````markdown
## System Integration

### Integration Architecture

\```
┌──────────────┐
│ sirius-ui │
└──────┬───────┘
│ REST/tRPC
▼
┌──────────────────┐
│ sirius-api │◄────── RabbitMQ ────────► sirius-engine
│ (This Service) │
└──────┬───────────┘
│ SQL
▼
┌──────────────┐
│ PostgreSQL │
└──────────────┘
\```

### Communication Protocols

**REST API:**

- Exposes HTTP endpoints for UI
- Authentication via JWT middleware
- JSON request/response format
- Standard HTTP status codes

**RabbitMQ Integration:**

- Queue: `scan_requests` - Receives scan jobs
- Queue: `scan_results` - Publishes results
- Message format: JSON with schema validation

**Database:**

- PostgreSQL connection pool
- Transaction management for consistency
- Prepared statements for security

### Data Flows

**Scan Request Flow:**

1. UI → POST /api/scans → sirius-api
2. sirius-api validates and stores in PostgreSQL
3. sirius-api publishes to RabbitMQ `scan_requests`
4. sirius-engine consumes and processes
5. Results published to `scan_results`
6. sirius-api receives and updates PostgreSQL
7. UI receives update via WebSocket

### Key Integration Points

- **Frontend Integration**: tRPC router, type-safe contracts
- **Engine Integration**: RabbitMQ message queue
- **Database Integration**: PostgreSQL with Prisma
- **Cache Integration**: Valkey for session and rate limiting
````

**What They Need:**

- Service boundaries
- Protocol details
- Message formats
- Data flow understanding
- Integration patterns
- Error handling across services

**What They Don't Need:**

- Complete system architecture
- All service implementations
- Infrastructure details
- Deployment mechanisms

## High - System Architecture

### Characteristics

Agents requiring deep understanding of entire system, all protocols, complete data flows, and infrastructure.

### When to Use

- **System Architects**: Overall system design
- **Infrastructure Engineers**: Platform management
- **SRE Engineers**: Monitoring all services
- **Agent Engineers**: Complex distributed agent systems
- **Platform Engineers**: Cross-cutting infrastructure

### What to Include

**System Integration Section (Comprehensive):**

```markdown
## System Integration

### Complete System Architecture

[Full system diagram with all services]

### Detailed Communication Protocols

Complete specifications for all protocols used:

- gRPC with protobuf definitions
- REST with complete API specs
- Message queues with all queue/exchange details
- WebSocket patterns
- Database access patterns

### Complete Data Flows

End-to-end flows for all major operations with:

- Every service touched
- Every protocol used
- Every transformation step
- Error handling at each stage
- Performance considerations

### All Integration Points

Comprehensive documentation of every service integration
```

**Level of Detail:**

- Complete system architecture
- All protocols with specifications
- Message formats with schemas
- Complete data flow diagrams
- Infrastructure details
- Deployment architecture
- Monitoring and observability
- Security boundaries
- Performance characteristics

### Example Agents

#### System Architect

```yaml
system_integration_level: "high"
specialization: ["microservices", "data flows", "cross-cutting design"]
technology_stack: ["architecture patterns", "Docker", "system design"]
```

**Integration Section:**

````markdown
## System Integration

### Complete System Architecture

\```
┌─────────────────────────────────────────────────┐
│ External │
│ ┌────────────┐ │
│ │ Users │ │
│ └─────┬──────┘ │
└────────────────────┼────────────────────────────┘
│ HTTPS
▼
┌──────────────┐
│ sirius-ui │
│ (Next.js) │
└──────┬───────┘
│
┌────────────┼────────────┐
│ tRPC/HTTP │ │ WebSocket
▼ ▼ ▼
┌──────────────┐ ┌─────────────────────────┐
│ sirius-api │ │ Event System │
│ (Go/Fiber) │ │ │
└──────┬───────┘ └─────────────────────────┘
│
├─────► PostgreSQL (SQL)
├─────► Valkey (Redis Protocol)
└─────► RabbitMQ (AMQP)
│
│ Message Queue
▼
┌──────────────┐
│sirius-engine │
│ (Go) │
└──────┬───────┘
│
┌────────────┼────────────┬─────────────┐
│ │ │ │
▼ ▼ ▼ ▼
┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│ nmap │ │ rustscan│ │ naabu │ │ agents │
└────────┘ └─────────┘ └────────┘ └────┬─────┘
│ gRPC
▼
┌─────────────┐
│agent-server │
│ (Go) │
└─────────────┘
\```

### Detailed Communication Protocols

**HTTP/tRPC (UI ↔ API):**

- Transport: HTTPS with TLS 1.2+
- Protocol: tRPC over HTTP POST
- Authentication: JWT in Authorization header
- Payload: JSON with Zod schema validation
- Error Handling: Typed tRPC errors
- Rate Limiting: 100 req/min per IP

**AMQP (API ↔ Engine via RabbitMQ):**

- Protocol: AMQP 0.9.1
- Exchanges:
  - `scans.direct` (direct): Scan requests
  - `results.fanout` (fanout): Scan results broadcast
- Queues:
  - `scan.requests`: Durable, persistent messages
  - `scan.results.api`: API-specific results
  - `scan.results.events`: Event system feed
- Message Format: JSON with schema
  \```json
  {
  "scan_id": "uuid",
  "type": "nmap|rustscan|agent",
  "target": "ip/hostname",
  "config": {...}
  }
  \```
- Retry Policy: Exponential backoff, 3 attempts
- Dead Letter Queue: `scan.failed`

**gRPC (Engine ↔ Agent Server):**

- Protocol: gRPC with Protocol Buffers v3
- Service Definition:
  \```protobuf
  service HelloService {
  rpc ConnectStream(stream AgentMessage)
  returns (stream ServerMessage);
  rpc Ping(PingRequest) returns (PingResponse);
  }
  \```
- Transport: HTTP/2 over TLS
- Authentication: Metadata-based agent ID
- Streaming: Bidirectional for heartbeat + commands
- Keepalive: 30s interval, 10s timeout

**SQL (API ↔ PostgreSQL):**

- Driver: pgx (PostgreSQL native)
- Connection Pool: 10-20 connections
- Transaction Isolation: Read Committed
- Migrations: Managed via Prisma
- Query Pattern: Prepared statements
- Performance: Indexed queries, EXPLAIN analysis

**Redis Protocol (API/Engine ↔ Valkey):**

- Protocol: RESP3 (Redis Serialization Protocol)
- Connection: Connection pooling
- Use Cases:
  - Session storage: 24h TTL
  - Rate limiting: Sliding window
  - Template caching: 1h TTL
  - Result caching: 5min TTL
- Data Structures: Strings, Hashes, Sets, Sorted Sets

### Complete Data Flows

**End-to-End Scan Flow:**

1. **Initiation (UI → API)**

   - User submits scan via UI
   - tRPC call: `scan.start({ target, type, config })`
   - JWT authentication validates user
   - Rate limiter checks (100/min limit)

2. **Validation & Storage (API → PostgreSQL)**

   - API validates scan parameters
   - Creates scan record: `INSERT INTO scans ...`
   - Generates unique scan_id
   - Sets status: 'pending'
   - Transaction committed

3. **Job Queuing (API → RabbitMQ)**

   - Constructs scan message
   - Publishes to `scans.direct` exchange
   - Routing key: scan type
   - Message persisted to disk
   - Acknowledgment received

4. **Job Processing (Engine processes)**

   - Consumes from `scan.requests` queue
   - Spawns appropriate scanner (nmap/rustscan)
   - Executes scan against target
   - Parses results into structured format
   - Performs vulnerability matching

5. **Results Publishing (Engine → RabbitMQ)**

   - Publishes to `results.fanout` exchange
   - All subscribers receive results
   - Message includes: scan_id, findings, metadata
   - Acknowledgment after publish

6. **Results Processing (API receives)**

   - Consumes from `scan.results.api` queue
   - Updates PostgreSQL: `UPDATE scans SET status = 'complete'`
   - Stores vulnerabilities: `INSERT INTO vulnerabilities ...`
   - Caches results in Valkey (5min)
   - Acknowledges message

7. **Real-time Notification (API → UI)**
   - Event system publishes scan completion
   - WebSocket message to connected clients
   - UI updates scan list and detail view
   - User notified of completion

**Agent Command Flow:**

[Similar detailed flow for agent commands]

### All Integration Points

**Frontend Integration:**

- tRPC router with type-safe contracts
- WebSocket for real-time updates
- Session management via Valkey
- Error boundaries and retry logic

**Backend Integration:**

- RabbitMQ for async job processing
- PostgreSQL for persistent storage
- Valkey for caching and sessions
- Event system for real-time updates

**Engine Integration:**

- Message queue consumer (RabbitMQ)
- Multiple scanner integrations
- Result publisher (RabbitMQ)
- gRPC client to agent server

**Agent System Integration:**

- gRPC server for agent connections
- Template sync via Valkey
- Command distribution via streams
- Result aggregation and storage

**Infrastructure Integration:**

- Docker Compose orchestration
- Volume mounts for development
- Network isolation between services
- Health checks for all services
````

**What They Need:**

- Complete system understanding
- All protocols and specifications
- Every integration point
- Complete data flows
- Infrastructure knowledge
- Performance characteristics
- Security boundaries
- Monitoring approaches
- Deployment architecture

## Integration Level Decision Matrix

### By Role Type

| Role Type             | Typical Integration Level | Reasoning                                             |
| --------------------- | ------------------------- | ----------------------------------------------------- |
| **Engineering**       |                           |                                                       |
| - Frontend            | low                       | Consumes APIs, no backend knowledge needed            |
| - Backend API         | medium                    | Integrates services, needs protocol knowledge         |
| - Infrastructure      | high                      | Manages entire platform                               |
| - Specialized Service | medium                    | Focused integration with specific services            |
| **Design**            | none                      | No technical integration                              |
| **Product**           | none                      | Business/process focused                              |
| **Operations**        |                           |                                                       |
| - DevOps              | medium-high               | Service deployment, may need full system view         |
| - SRE                 | high                      | Monitors all services, needs complete picture         |
| - Release Manager     | low-medium                | Deployment process, some integration knowledge        |
| **QA**                | low-medium                | Tests interfaces, may need some integration knowledge |
| **Documentation**     | none-low                  | Usually none, sometimes low for API docs              |

### By Technology Stack

| Technology                       | Typical Level | Reasoning                       |
| -------------------------------- | ------------- | ------------------------------- |
| Frontend frameworks (React, Vue) | low           | API consumption                 |
| REST API frameworks              | medium        | Service integration             |
| gRPC/microservices               | high          | Distributed system knowledge    |
| Database specialists             | medium        | Data layer integration          |
| Message queue specialists        | medium-high   | Async communication patterns    |
| Container orchestration          | high          | Infrastructure and all services |
| Monitoring/observability         | high          | Must understand all services    |

### By Specialization

| Specialization     | Typical Level | Reasoning                           |
| ------------------ | ------------- | ----------------------------------- |
| UI components      | none-low      | Isolated or simple API consumption  |
| API security       | medium        | Must understand all API integration |
| Distributed agents | high          | Complex inter-service communication |
| Template systems   | medium        | File sync and validation            |
| Scan orchestration | medium-high   | Multiple service coordination       |
| System design      | high          | Complete architecture knowledge     |

## Guidelines for Writing Integration Sections

### None Level - Omit Section

Simply don't include the "System Integration" section. Agent works in isolation.

### Low Level Template

```markdown
## System Integration

### Integration Overview

[1 paragraph: What APIs/interfaces are consumed]

### Communication

- **[Protocol]**: [Brief description]
- **Authentication**: [How to authenticate]
- **Data Format**: [Request/response format]

### Key Integration Points

- `[endpoint/interface]` - [Purpose]
- `[endpoint/interface]` - [Purpose]
```

**Length:** 15-25 lines

### Medium Level Template

```markdown
## System Integration

### Integration Architecture

[Simple component diagram showing this service + adjacent services]

### Communication Protocols

**[Protocol 1]:**

- [Key details about usage]
- [Message formats or specifications]

**[Protocol 2]:**

- [Key details]

### Data Flows

**[Key Flow]:**

1. [Step] → [Step] → [Step]
2. [Alternative or error path]

### Key Integration Points

- **[Service/Component]** - [How it integrates, protocol, purpose]
- **[Service/Component]** - [How it integrates]
```

**Length:** 30-60 lines

### High Level Template

```markdown
## System Integration

### Complete System Architecture

[Comprehensive diagram showing all services, protocols, data flows]

### Detailed Communication Protocols

**[Protocol 1]:**

- Transport: [Details]
- Format: [Specifications]
- Authentication: [Methods]
- Error Handling: [Patterns]
- Performance: [Characteristics]

[Continue for all protocols]

### Complete Data Flows

**[Flow 1] End-to-End:**

1. **[Stage]** - [Detailed description]
   - Service: [Which service]
   - Protocol: [How communication happens]
   - Data: [What data is passed]
   - Error Handling: [What happens on error]

[Continue for all stages of all major flows]

### All Integration Points

[Comprehensive documentation of every service integration with protocol, format, and error handling]
```

**Length:** 60-120 lines

## Common Mistakes

### Over-Engineering Low Level

**❌ Bad:** Including detailed protocol specifications for a simple API consumer

```markdown
## System Integration (Frontend Engineer - LOW level)

### gRPC Protocol Details

Uses gRPC with Protocol Buffers v3, bidirectional streaming...
[50 lines of gRPC implementation details]
```

**✅ Good:**

```markdown
## System Integration (Frontend Engineer - LOW level)

### Integration Overview

Consumes Sirius REST API via tRPC for type-safe calls.

### Communication

- **tRPC**: Type-safe RPC over HTTP
- **Authentication**: JWT tokens
- **Format**: JSON with Zod validation
```

### Under-Engineering High Level

**❌ Bad:** Vague overview for a system architect

```markdown
## System Integration (System Architect - HIGH level)

Services communicate via REST and message queues.
Frontend talks to backend, backend talks to database.
```

**✅ Good:** [See High Level Template above with complete specifications]

### Wrong Level Assignment

**Problem:** Frontend engineer marked as "high" because they work on "the entire UI"

**Fix:** "High" refers to system integration depth, not scope of work within a domain. Frontend consuming APIs = "low"

## Summary

Choose integration level based on:

1. **Role's actual integration needs** - Not seniority or importance
2. **Technical depth required** - How much protocol/system knowledge needed
3. **Context window efficiency** - Balance detail with space constraints
4. **Agent effectiveness** - What enables best AI interactions

When in doubt, start lower and increase only if the agent proves ineffective without more system context.

---

_Use this reference when creating or updating agent identities to ensure appropriate integration level and content depth._
