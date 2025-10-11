---
title: "SiriusScan Architecture Quick Reference"
description: "Concise architectural overview of SiriusScan - a microservices-based vulnerability scanner with Docker orchestration, providing essential context for LLM interactions."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "AI Assistant"
tags:
  [
    "architecture",
    "quick-reference",
    "microservices",
    "docker",
    "vulnerability-scanner",
  ]
categories: ["architecture", "reference"]
difficulty: "beginner"
prerequisites: ["docker", "microservices"]
related_docs:
  - "README.architecture.md"
  - "README.development.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "sirius architecture",
    "vulnerability scanner",
    "microservices",
    "docker compose",
    "quick reference",
  ]
---

# SiriusScan Architecture Quick Reference

> **📚 Full Architecture**: For comprehensive details, see [README.architecture.md](README.architecture.md)

## Purpose

This document provides a condensed architectural overview of SiriusScan for LLM context, focusing on core components, communication patterns, and essential setup information.

## What is SiriusScan

**SiriusScan** is an open-source, general-purpose vulnerability scanner built with a microservices architecture. It provides comprehensive vulnerability scanning capabilities through a web interface, with modular components for scanning, terminal access, and agent management.

## Core Architecture

### System Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  sirius-ui  │    │ sirius-api  │    │sirius-engine│
│  (Next.js)  │    │   (Go)      │    │    (Go)     │
│   Port 3000 │    │  Port 9001  │    │  Port 5174  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───▼────┐  ┌─────────────▼──┐  ┌─────────────▼──┐
│RabbitMQ│  │   PostgreSQL   │  │    Valkey      │
│ :5672  │  │     :5432     │  │     :6379      │
└────────┘  └────────────────┘  └────────────────┘
```

### Key Services

| Service             | Technology           | Port | Purpose                |
| ------------------- | -------------------- | ---- | ---------------------- |
| **sirius-ui**       | Next.js + TypeScript | 3000 | Web interface & BFF    |
| **sirius-api**      | Go + Fiber           | 9001 | RESTful API backend    |
| **sirius-engine**   | Go                   | 5174 | Core processing engine |
| **sirius-rabbitmq** | RabbitMQ             | 5672 | Message broker         |
| **sirius-postgres** | PostgreSQL           | 5432 | Relational database    |
| **sirius-valkey**   | Valkey (Redis)       | 6379 | Key-value store        |

## Component Details

### Frontend (sirius-ui)

- **Tech Stack**: Next.js, TypeScript, tRPC, Tailwind CSS, Shadcn/ui
- **Purpose**: User interface and Backend-for-Frontend (BFF)
- **Key Features**:
  - Web-based vulnerability scanner interface
  - Terminal component for command execution
  - Agent management dashboard
  - Real-time scan results display

### Backend API (sirius-api)

- **Tech Stack**: Go, Fiber web framework
- **Purpose**: RESTful API for data operations
- **Key Features**:
  - Host management endpoints
  - Vulnerability data handling
  - Health check endpoints
  - Database integration

### Processing Engine (sirius-engine)

- **Tech Stack**: Go with modular sub-applications
- **Purpose**: Core scanning and processing logic
- **Key Features**:
  - Orchestrates vulnerability scans
  - Manages deployed agents via gRPC
  - Runs specialized sub-modules:
    - `app-scanner`: Nmap-based vulnerability scanning
    - `app-terminal`: PowerShell/command execution
    - `app-agent`: Agent communication and management

### Data Layer

- **PostgreSQL**: Stores host information, vulnerabilities, scan results
- **Valkey**: Caching, session management, temporary data
- **RabbitMQ**: Asynchronous messaging between services

## Communication Patterns

### Frontend to Backend

- **tRPC**: Type-safe communication between Next.js frontend and BFF
- **REST**: Direct API calls to sirius-api for data operations

### Backend Services

- **RabbitMQ**: Asynchronous task queuing (UI → Engine)
- **gRPC**: Engine to agent communication
- **Database**: Direct connections to PostgreSQL and Valkey

## Docker Setup

### Quick Start

```bash
# Clone and start the system
git clone <repository>
cd Sirius
docker compose up -d

# Access services
# UI: http://localhost:3000
# API: http://localhost:9001
# Engine: http://localhost:5174
```

### Key Docker Files

- `docker-compose.yaml`: Main orchestration
- `sirius-ui/Dockerfile`: Next.js frontend
- `sirius-api/Dockerfile`: Go API service
- `sirius-engine/Dockerfile`: Core engine with sub-modules

## Project Structure

```
Sirius/
├── sirius-ui/          # Next.js frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Next.js pages & API routes
│   │   └── server/     # tRPC backend logic
│   └── prisma/         # Database schema
├── sirius-api/         # Go REST API
│   ├── handlers/       # HTTP handlers
│   └── routes/         # API routes
├── sirius-engine/      # Core processing engine
│   └── apps/           # Sub-modules
│       ├── app-scanner/
│       ├── app-terminal/
│       └── app-agent/
├── documentation/      # Project documentation
├── testing/           # Test suites
└── docker-compose.yaml
```

## Key Workflows

### Vulnerability Scanning

1. User initiates scan via UI
2. UI sends task to RabbitMQ
3. Engine processes scan using app-scanner
4. Results stored in PostgreSQL
5. UI displays results via real-time updates

### Agent Management

1. Agents connect to Engine via gRPC
2. Engine manages agent lifecycle
3. Commands executed on remote agents
4. Results streamed back to UI

### Terminal Access

1. User types commands in UI terminal
2. Commands routed through Engine
3. Executed via app-terminal (PowerShell)
4. Output streamed back to UI

## Development Context

### Backend Development

- **Location**: Inside `sirius-engine` container
- **Mount**: Local code mounted at `/app-agent` for dev mode
- **Commands**: Run via `docker exec sirius-engine <command>`

### Frontend Development

- **Hot Reload**: Enabled via volume mounts
- **Port**: 3000 (production)
- **Debugging**: Browser dev tools + React DevTools

### Testing

- **Location**: `testing/` directory
- **Commands**: `make test-all` for complete suite
- **Coverage**: Container health, integration, documentation

## Environment Variables

### Key Configuration

```bash
# Database
POSTGRES_HOST=sirius-postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sirius

# Messaging
RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/

# Services
SIRIUS_API_URL=http://sirius-api:9001
NEXTAUTH_URL=http://localhost:3000
```

## Troubleshooting

### Common Issues

- **Container startup**: Check health checks and dependencies
- **Database connection**: Verify PostgreSQL is healthy
- **Messaging**: Ensure RabbitMQ is running
- **Port conflicts**: Check if ports 3000, 9001, 5174 are available

### Debug Commands

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f sirius-ui
docker compose logs -f sirius-engine

# Health checks
curl http://localhost:3000/api/health
curl http://localhost:9001/api/v1/health
```

## LLM Context

This quick reference provides essential context for AI systems working with SiriusScan:

- **Architecture**: Microservices with Docker orchestration
- **Tech Stack**: Next.js frontend, Go backend, PostgreSQL/Valkey data layer
- **Communication**: tRPC, REST, RabbitMQ, gRPC
- **Purpose**: Vulnerability scanning with agent management
- **Development**: Container-based with hot reloading
- **Key Files**: docker-compose.yaml, service Dockerfiles, src/ directories

For detailed implementation, see the full [README.architecture.md](README.architecture.md) document.

---

_This quick reference provides essential architectural context for LLM interactions with the SiriusScan project._
