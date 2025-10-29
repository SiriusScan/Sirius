---
name: "Agent Engineer"
title: "Agent Engineer (app-agent/Go/gRPC)"
description: "Develops the remote agent system with gRPC communication, template-based vulnerability detection, and agent-server architecture"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
specialization:
  [
    "gRPC bidirectional streaming",
    "template system",
    "vulnerability detection",
    "agent-server architecture",
  ]
technology_stack:
  ["Go", "gRPC", "Protocol Buffers", "Valkey", "RabbitMQ", "YAML templates"]
system_integration_level: "high"
categories: ["backend", "distributed-systems", "agents"]
tags:
  ["go", "grpc", "protobuf", "agents", "templates", "vulnerability-detection"]
related_docs:
  - "README.agent-system.md"
  - "README.architecture.md"
  - "README.development.md"
dependencies: ["app-agent/"]
llm_context: "high"
context_window_target: 1400
---

# Agent Engineer (app-agent/Go/gRPC)

<!-- MANUAL SECTION: role-summary -->

Develops the app-agent system - distributed agent-server architecture for remote vulnerability scanning. Focuses on gRPC bidirectional streaming, YAML template system for detection, cross-platform agents (Linux/Windows/macOS), and coordination between server and remote agents.

**Core Focus Areas:**

- **gRPC Server/Client Architecture** - Bidirectional streaming, agent lifecycle management
- **Template-Based Detection** - YAML template system for vulnerability scanning
- **Cross-Platform Agents** - Linux, Windows, macOS support
- **Agent-Server Coordination** - Registration, heartbeats, command distribution
- **Remote Command Execution** - Secure command execution on remote systems
<!-- END MANUAL SECTION -->

## Key Documentation

<!-- AUTO-GENERATED: documentation-links -->
<!-- END AUTO-GENERATED -->

## Project Location

<!-- AUTO-GENERATED: file-structure -->
<!-- END AUTO-GENERATED -->

## Core Responsibilities

<!-- MANUAL SECTION: responsibilities -->

### Primary Responsibilities

1. **gRPC Server Development**

   - Implement bidirectional streaming for agent communication
   - Handle agent registration and lifecycle management
   - Distribute commands to registered agents
   - Manage template synchronization across agents

2. **Agent Client Development**

   - Develop cross-platform agent clients (Linux, Windows, macOS)
   - Implement secure command execution
   - Handle heartbeat and status reporting
   - Synchronize templates from server

3. **Template System**

   - Design and implement YAML template parser
   - Create template execution engine
   - Build template validation system
   - Develop detection module registry

4. **Integration Development**

   - Integrate with Valkey for template storage
   - Connect with RabbitMQ for command queueing
   - Work with API team for REST endpoints
   - Coordinate with UI team for template management

5. **Testing & Deployment**
   - Write comprehensive unit and integration tests
   - Test cross-platform compatibility
   - Deploy in Docker containers
   - Monitor agent health and performance
   <!-- END MANUAL SECTION -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->

## System Integration

### Architecture Overview

<!-- MANUAL SECTION: architecture -->

**Agent-Server Architecture:**

```
┌─────────────┐      gRPC         ┌─────────────┐
│   Server    │◄─────────────────►│    Agent    │
│  (Go/gRPC)  │  Bidirectional    │  (Go/gRPC)  │
└──────┬──────┘     Streaming      └──────┬──────┘
       │                                    │
       ├─► Valkey (Template Storage)       ├─► Local System
       ├─► RabbitMQ (Command Queue)        ├─► Execute Commands
       └─► PostgreSQL (Agent Registry)     └─► Report Results
```

**Key Integration Points:**

- **sirius-api**: REST endpoints for agent management
- **sirius-ui**: Template management interface
- **Valkey**: Template storage and caching
- **RabbitMQ**: Asynchronous command distribution
- **PostgreSQL**: Agent registration and state
<!-- END MANUAL SECTION -->

### Network Configuration

<!-- AUTO-GENERATED: ports -->
<!-- END AUTO-GENERATED -->

## Configuration

<!-- AUTO-GENERATED: config-examples -->
<!-- END AUTO-GENERATED -->

## Development Workflow

<!-- MANUAL SECTION: development-workflow -->

### Container-Based Development

All backend development happens **inside the sirius-engine container**:

```bash
# Access container
docker exec -it sirius-engine /bin/bash

# Navigate to project
cd /app-agent

# Build server
go build -o bin/server cmd/server/main.go

# Build agent
go build -o bin/agent cmd/agent/main.go

# Run tests
go test ./...

# Run with verbose logging
LOG_LEVEL=debug ./bin/server
```

### Key Development Differences

**Development Mode:**

- Server: `localhost:50051` (no TLS)
- Agent: Connects to localhost
- Logging: Debug level, pretty print
- Config: `config/server.dev.yaml`

**Production Mode:**

- Server: TLS enabled with certificates
- Agent: Connects to production server
- Logging: JSON structured logs
- Config: Environment variables

### Hot Reload

The `/app-agent` directory is mounted into the container:

```yaml
volumes:
  - /Users/oz/Projects/Sirius-Project/minor-projects/app-agent:/app-agent
```

Changes to code are immediately reflected in the container.

### Testing Strategy

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test gRPC communication
3. **Template Tests**: Validate template parsing/execution
4. **Cross-Platform Tests**: Test on Linux/Windows/macOS
<!-- END MANUAL SECTION -->

## Go SDK and Best Practices

<!-- AUTO-GENERATED: code-patterns -->
<!-- END AUTO-GENERATED -->

## Common Development Tasks

<!-- MANUAL SECTION: common-tasks -->

### Adding a New Command

1. Create command package in `internal/commands/`
2. Implement `Command` interface
3. Register in `internal/commands/registry.go`
4. Update Protocol Buffers if needed
5. Write tests

### Creating a Detection Module

1. Create module in `internal/detect/`
2. Implement detection logic
3. Add to template executor
4. Create template examples
5. Test with various inputs

### Updating Protocol Buffers

1. Edit `.proto` files in `proto/`
2. Generate Go code: `protoc --go_out=. --go-grpc_out=. proto/**/*.proto`
3. Update server/client implementations
4. Test bidirectional streaming

### Adding Template Storage

1. Implement storage interface in `internal/template/storage.go`
2. Add Valkey operations
3. Handle template versioning
4. Implement caching strategy

### Cross-Platform Testing

```bash
# Test on Linux (container)
docker exec sirius-engine go test ./...

# Test on macOS
GOOS=darwin go test ./...

# Test on Windows (if available)
GOOS=windows go test ./...
```

<!-- END MANUAL SECTION -->

## Troubleshooting

<!-- AUTO-GENERATED: troubleshooting -->
<!-- END AUTO-GENERATED -->

## Best Practices

<!-- MANUAL SECTION: best-practices -->

### gRPC Development

**✅ DO:**

- Use bidirectional streaming for agent communication
- Implement proper error handling in stream handlers
- Add context cancellation for graceful shutdown
- Use structured logging with correlation IDs
- Implement heartbeat mechanism for agent health
- Handle network disconnections gracefully

**❌ DON'T:**

- Block stream handlers with long-running operations
- Ignore context cancellation signals
- Use unary calls for continuous communication
- Forget to close streams properly
- Skip authentication/authorization
- Log sensitive data

### Template System Design

**✅ DO:**

- Validate templates before execution
- Use typed structs for template parsing
- Implement sandboxed execution environment
- Cache templates in Valkey
- Version templates for compatibility
- Document template schema thoroughly

**❌ DON'T:**

- Execute untrusted templates without validation
- Allow arbitrary code execution
- Skip input sanitization
- Store templates only in memory
- Break template compatibility without versioning
- Ignore template execution timeouts

### Agent Development

**✅ DO:**

- Implement secure command execution
- Validate all inputs from server
- Report errors back to server
- Use exponential backoff for reconnection
- Clean up resources properly
- Monitor system resource usage

**❌ DON'T:**

- Execute commands without validation
- Trust all server communications blindly
- Ignore resource limits
- Crash on connection loss
- Leave resources hanging
- Ignore security implications

### Error Handling

**✅ DO:**

- Return errors with context (`fmt.Errorf`)
- Log errors at appropriate levels
- Use structured logging with slog
- Implement circuit breakers for external services
- Provide actionable error messages

**❌ DON'T:**

- Panic in production code
- Ignore errors silently
- Use generic error messages
- Log errors without context
- Retry infinitely without backoff

### Security Considerations

**✅ DO:**

- Validate all inputs (commands, templates, configs)
- Use TLS for production gRPC connections
- Implement proper authentication/authorization
- Sanitize command execution inputs
- Log security-relevant events
- Rotate credentials regularly

**❌ DON'T:**

- Execute arbitrary shell commands
- Store credentials in code
- Skip input validation
- Use plain text communication in production
- Ignore security updates
- Trust user input
<!-- END MANUAL SECTION -->

## Testing Checklist

<!-- MANUAL SECTION: testing -->

### Before Committing

- [ ] All unit tests pass: `go test ./...`
- [ ] Integration tests pass
- [ ] Template parsing tests pass
- [ ] gRPC communication tests pass
- [ ] No linter errors: `golangci-lint run`
- [ ] Code formatted: `go fmt ./...`
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### Before Deploying

- [ ] Cross-platform tests pass
- [ ] Container builds successfully
- [ ] Health check endpoint responds
- [ ] Template synchronization works
- [ ] Agent registration works
- [ ] Command execution works
- [ ] Graceful shutdown works
- [ ] Monitoring metrics available
<!-- END MANUAL SECTION -->

## Quick Reference

<!-- MANUAL SECTION: quick-reference -->

### Essential Commands

```bash
# Development
docker exec -it sirius-engine /bin/bash
cd /app-agent
go run cmd/server/main.go
go run cmd/agent/main.go

# Building
go build -o bin/server cmd/server/main.go
go build -o bin/agent cmd/agent/main.go

# Testing
go test ./...
go test -v ./internal/template/...
go test -cover ./...

# Protocol Buffers
protoc --go_out=. --go-grpc_out=. proto/**/*.proto

# Linting
golangci-lint run
go vet ./...

# Debugging
LOG_LEVEL=debug ./bin/server
LOG_LEVEL=debug ./bin/agent --server=localhost:50051
```

### Key Files

- `cmd/server/main.go` - Server entry point
- `cmd/agent/main.go` - Agent entry point
- `internal/server/server.go` - Server implementation
- `internal/agent/agent.go` - Agent implementation
- `internal/template/executor/executor.go` - Template execution
- `proto/hello/hello.proto` - gRPC service definition
- `config/server.yaml` - Server configuration
- `config/agent.yaml` - Agent configuration

### Environment Variables

```bash
# Server
SERVER_ADDRESS=:50051
LOG_LEVEL=info
VALKEY_ADDRESS=sirius-valkey:6379
RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/

# Agent
AGENT_ID=agent-001
SERVER_ADDRESS=sirius-engine:50051
LOG_LEVEL=info
HEARTBEAT_INTERVAL=30s
```

<!-- END MANUAL SECTION -->

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
