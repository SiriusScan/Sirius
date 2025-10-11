---
title: "System Monitoring - Project Plan"
description: "High-level project overview and implementation strategy for system monitoring dashboard and logging infrastructure"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["project-plan", "sprint", "system-monitoring", "dashboard", "logging"]
categories: ["development", "planning"]
difficulty: "intermediate"
prerequisites: ["docker", "next.js", "go", "redis"]
related_docs:
  - "README.tasks.md"
  - "README.container-testing.md"
  - "README.architecture-quick-reference.md"
dependencies: []
llm_context: "medium"
search_keywords: ["system-monitoring", "project-plan", "development", "dashboard", "logging"]
---

# System Monitoring - Project Plan

## Project Overview

**Goal**: Implement a comprehensive system monitoring dashboard that provides real-time visibility into microservice health, system logs, and performance metrics for the SiriusScan vulnerability scanner.

**Timeline**: 2-3 weeks
**Scope**: Frontend dashboard, backend health check APIs, centralized logging system, and log storage/retrieval infrastructure

## Key Deliverables

1. **System Monitor Dashboard Page** - New Next.js page accessible via Settings navigation
2. **Service Health Monitoring** - Real-time status checks for all microservices (UI, API, Engine, PostgreSQL, Valkey, RabbitMQ)
3. **Centralized Logging System** - Structured logging infrastructure with Valkey storage
4. **Log Viewer Interface** - Searchable, filterable log display using TanStack Table
5. **API Endpoints** - Health check and logging APIs for system monitoring

## Technical Approach

### Phase 1: Service Health Monitoring
- Create system monitor page with service status cards
- Implement health check APIs for all services
- Use existing health check patterns from container testing
- Real-time status updates with polling mechanism

### Phase 2: Centralized Logging Infrastructure
- Design log format and metadata structure
- Implement logging API endpoints
- Create Valkey-based log storage with retention policies
- Build log viewer with search and filtering capabilities

### Phase 3: Integration and Polish
- Connect frontend to backend APIs
- Implement error handling and retry logic
- Add performance optimizations
- Complete documentation and testing

## Success Criteria

- [ ] System monitor page accessible via Settings navigation
- [ ] All 6 microservices show real-time health status
- [ ] Centralized logging system captures logs from all services
- [ ] Log viewer supports search, filtering, and pagination
- [ ] Health checks use same patterns as container testing
- [ ] Log retention policy prevents storage bloat
- [ ] Real-time updates work reliably with error handling
- [ ] UI follows existing design patterns and component library

## Risk Assessment

**High Risk Items:**

- **Log Volume Management**: Vulnerability scanner may generate high log volume - Mitigation: Implement log retention policies and size limits
- **Real-time Performance**: Polling-based updates may impact performance - Mitigation: Use efficient polling intervals and optimize queries

**Dependencies:**

- Existing health check infrastructure in container testing
- Valkey/Redis availability for log storage
- Current UI component library and design patterns

## Technical Decisions

### Log Storage Strategy
- **Storage**: Valkey (Redis-compatible) for log storage
- **Retention**: Configurable log cache size with automatic cleanup
- **Format**: Structured JSON logs with metadata (service, timestamp, level, message)
- **API**: RESTful endpoints for log submission and retrieval

### Health Check Implementation
- **Pattern**: Follow existing container testing health check patterns
- **Services**: UI (port 3000), API (port 9001/health), Engine (port 5174), PostgreSQL, Valkey, RabbitMQ
- **Method**: HTTP health checks where available, process checks for others
- **Updates**: 5-second polling interval with error handling

### UI Architecture
- **Framework**: Next.js page with existing Layout component
- **Components**: TanStack Table for logs, custom status cards for services
- **Styling**: Shadcn/ui components with existing design system
- **Navigation**: Add to Settings dropdown menu

## Notes

This project will establish the foundation for comprehensive system observability in SiriusScan. The monitoring dashboard will be essential for troubleshooting issues and understanding system performance as the application matures.

The logging system will use a simple but effective approach with Valkey storage, allowing for future enhancements like log aggregation, alerting, and more sophisticated retention policies.

Key focus areas:
- Leverage existing health check patterns for consistency
- Build scalable logging infrastructure
- Create intuitive monitoring interface
- Ensure performance and reliability
