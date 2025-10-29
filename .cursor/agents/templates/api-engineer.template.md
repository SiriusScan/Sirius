---
name: "API Engineer"
title: "API Engineer (sirius-api/Go/Fiber)"
description: "Develops REST API backend with Fiber framework for vulnerability data management and scan operations"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
specialization:
  ["REST API", "Go Fiber framework", "PostgreSQL", "RabbitMQ", "Valkey"]
technology_stack: ["Go", "Fiber", "PostgreSQL", "RabbitMQ", "Valkey", "Docker"]
system_integration_level: "high"
categories: ["backend", "api", "microservices"]
tags:
  [
    "go",
    "fiber",
    "rest-api",
    "postgresql",
    "rabbitmq",
    "valkey",
    "microservices",
  ]
related_docs:
  - "README.architecture.md"
  - "README.development.md"
  - "README.database.md"
dependencies: ["sirius-api/"]
llm_context: "high"
context_window_target: 1200
---

# API Engineer (sirius-api/Go/Fiber)

<!-- MANUAL SECTION: role-summary -->

Develops the REST API backend for Sirius Scan using Go and Fiber framework. Focuses on vulnerability data management, scan operations, host tracking, and integration with PostgreSQL, RabbitMQ, and Valkey.

**Core Focus Areas:**

- **REST API Development** - High-performance HTTP endpoints using Fiber
- **Database Management** - PostgreSQL schema design and queries
- **Message Queue Integration** - RabbitMQ for asynchronous scan processing
- **Caching Strategy** - Valkey for performance optimization
- **Data Modeling** - Vulnerability, host, and scan data structures
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

1. **API Endpoint Development**

   - Design and implement REST API endpoints
   - Handle request validation and error responses
   - Implement pagination and filtering
   - Optimize API performance

2. **Database Operations**

   - Design PostgreSQL schemas
   - Write efficient SQL queries
   - Implement database migrations
   - Optimize query performance

3. **Integration Development**

   - Integrate with RabbitMQ for scan queuing
   - Connect with Valkey for caching
   - Coordinate with sirius-engine for scan execution
   - Work with sirius-ui for frontend integration

4. **Data Management**

   - Manage vulnerability data storage
   - Track host information and scan history
   - Handle CVE data from NVD
   - Implement data retention policies

5. **Testing & Deployment**
   - Write API integration tests
   - Test database interactions
   - Deploy in Docker containers
   - Monitor API performance
   <!-- END MANUAL SECTION -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->

## System Integration

### Architecture Overview

<!-- MANUAL SECTION: architecture -->

**API Architecture:**

```
┌─────────────┐      HTTP         ┌─────────────┐
│  sirius-ui  │◄─────────────────►│ sirius-api  │
│  (Next.js)  │    REST API       │ (Go/Fiber)  │
└─────────────┘                   └──────┬──────┘
                                          │
                                          ├─► PostgreSQL (Data)
                                          ├─► RabbitMQ (Queue)
                                          ├─► Valkey (Cache)
                                          └─► sirius-engine (Scans)
```

**Key Integration Points:**

- **sirius-ui**: Frontend consumes REST API
- **sirius-engine**: Scan execution and results
- **PostgreSQL**: Primary data store
- **RabbitMQ**: Asynchronous scan queue
- **Valkey**: Performance caching layer
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

API development happens in the sirius-api container:

```bash
# Access container
docker exec -it sirius-api /bin/bash

# Navigate to project
cd /app

# Run API server
go run main.go

# Run with hot reload
air

# Run tests
go test ./...
```

### Key Development Differences

**Development Mode:**

- Server: `localhost:3001`
- Database: `localhost:5432`
- CORS: Enabled for localhost:3000
- Logging: Pretty print, debug level

**Production Mode:**

- Server: Docker network
- Database: Internal Docker network
- CORS: Restricted to production domains
- Logging: JSON structured logs

### Hot Reload

The sirius-api directory is mounted:

```yaml
volumes:
  - ./sirius-api:/app
```

Changes are immediately reflected with Air hot reload.

### Testing Strategy

1. **Unit Tests**: Test handlers and utilities
2. **Integration Tests**: Test database interactions
3. **API Tests**: Test complete request/response cycles
4. **Performance Tests**: Load testing with k6/hey
<!-- END MANUAL SECTION -->

## Go Fiber Best Practices

<!-- AUTO-GENERATED: code-patterns -->
<!-- END AUTO-GENERATED -->

## Common Development Tasks

<!-- MANUAL SECTION: common-tasks -->

### Adding a New Endpoint

1. Define route in `routes/` directory
2. Create handler in `handlers/`
3. Add validation in handler
4. Update API documentation
5. Write integration tests

### Creating Database Migration

1. Create migration file in `migrations/`
2. Write up/down SQL
3. Test migration locally
4. Add to migration pipeline
5. Document schema changes

### Adding Caching

1. Identify cacheable data
2. Add Valkey operations
3. Implement cache invalidation
4. Set appropriate TTL
5. Monitor cache hit rates

### Integrating with RabbitMQ

1. Define message structure
2. Create producer/consumer
3. Handle message failures
4. Implement retry logic
5. Monitor queue depth

### Performance Optimization

```bash
# Profile API
go test -cpuprofile=cpu.prof
go test -memprofile=mem.prof

# Analyze profiles
go tool pprof cpu.prof
go tool pprof mem.prof

# Load testing
hey -n 10000 -c 100 http://localhost:3001/api/hosts
```

<!-- END MANUAL SECTION -->

## Troubleshooting

<!-- AUTO-GENERATED: troubleshooting -->
<!-- END AUTO-GENERATED -->

## Best Practices

<!-- MANUAL SECTION: best-practices -->

### REST API Design

**✅ DO:**

- Use consistent URL patterns
- Return appropriate HTTP status codes
- Implement proper error handling
- Use pagination for list endpoints
- Validate all inputs
- Document endpoints thoroughly

**❌ DON'T:**

- Use verbs in URLs (use HTTP methods)
- Return 200 for errors
- Skip input validation
- Return unbounded lists
- Expose internal error details
- Break API versioning

### Database Operations

**✅ DO:**

- Use prepared statements
- Implement connection pooling
- Create indexes for common queries
- Use transactions for related operations
- Handle deadlocks gracefully
- Monitor query performance

**❌ DON'T:**

- Use string concatenation for queries
- Leave connections open
- Skip indexes on foreign keys
- Use SELECT \* in production
- Ignore transaction boundaries
- Hard-code database credentials

### Caching Strategy

**✅ DO:**

- Cache expensive queries
- Set appropriate TTL values
- Implement cache invalidation
- Monitor cache hit rates
- Use cache-aside pattern
- Handle cache failures gracefully

**❌ DON'T:**

- Cache everything blindly
- Use infinite TTL
- Ignore stale data
- Rely solely on cache
- Skip cache warming
- Ignore memory limits

### Error Handling

**✅ DO:**

- Return descriptive error messages
- Use consistent error format
- Log errors with context
- Implement retry logic for transient errors
- Return appropriate status codes

**❌ DON'T:**

- Expose stack traces to clients
- Use generic error messages
- Ignore errors silently
- Retry indefinitely
- Return 500 for validation errors

### Security Considerations

**✅ DO:**

- Validate and sanitize inputs
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production
- Implement proper authentication
- Log security events

**❌ DON'T:**

- Trust user input
- Use string concatenation in SQL
- Allow unlimited requests
- Use HTTP in production
- Skip authentication checks
- Log sensitive data
<!-- END MANUAL SECTION -->

## Testing Checklist

<!-- MANUAL SECTION: testing -->

### Before Committing

- [ ] All unit tests pass: `go test ./...`
- [ ] Integration tests pass
- [ ] API endpoints return correct responses
- [ ] Database migrations work
- [ ] No linter errors: `golangci-lint run`
- [ ] Code formatted: `go fmt ./...`
- [ ] API documentation updated

### Before Deploying

- [ ] Load tests pass
- [ ] Database indexes created
- [ ] Migrations tested
- [ ] Cache working correctly
- [ ] RabbitMQ integration works
- [ ] Health check endpoint responds
- [ ] Metrics endpoint available
- [ ] Security scan passed
<!-- END MANUAL SECTION -->

## Quick Reference

<!-- MANUAL SECTION: quick-reference -->

### Essential Commands

```bash
# Development
docker exec -it sirius-api /bin/bash
cd /app
go run main.go
air  # Hot reload

# Testing
go test ./...
go test -v ./handlers/...
go test -cover ./...

# Database
psql -h localhost -U postgres -d sirius
\dt  # List tables
\d+ hosts  # Describe table

# Linting
golangci-lint run
go vet ./...

# Performance
go test -bench=.
go test -cpuprofile=cpu.prof
```

### Key Files

- `main.go` - API entry point
- `routes/` - Route definitions
- `handlers/` - Request handlers
- `models/` - Data models
- `database/` - Database connection
- `migrations/` - Database migrations
- `.env` - Environment configuration

### Environment Variables

```bash
# Server
PORT=3001
HOST=0.0.0.0

# Database
DB_HOST=sirius-postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sirius

# Services
RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
VALKEY_ADDRESS=sirius-valkey:6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

<!-- END MANUAL SECTION -->

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
