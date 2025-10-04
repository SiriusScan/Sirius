# Docker Implementation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Docker Files Structure](#docker-files-structure)
4. [Docker Compose Files](#docker-compose-files)
5. [Development vs Production Modes](#development-vs-production-modes)
6. [Essential Docker Commands](#essential-docker-commands)
7. [Environment Variables](#environment-variables)
8. [Volume Mounts and Data Persistence](#volume-mounts-and-data-persistence)
9. [Networking](#networking)
10. [Development Workflow](#development-workflow)
11. [Troubleshooting](#troubleshooting)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Monitoring and Logging](#monitoring-and-logging)
15. [Deployment Scenarios](#deployment-scenarios)
16. [Best Practices](#best-practices)
17. [Common Development Issues and Solutions](#common-development-issues-and-solutions)
18. [Development Tips and Tricks](#development-tips-and-tricks)
19. [Performance Monitoring](#performance-monitoring)
20. [Additional Resources](#additional-resources)

## Overview

Sirius uses a comprehensive Docker-based development and deployment environment with multiple services orchestrated through Docker Compose. This documentation provides a complete guide to understanding and working with the Docker ecosystem.

## Architecture Overview

The Sirius platform consists of multiple containerized services:

- **sirius-ui**: Next.js frontend application
- **sirius-api**: Go-based REST API server
- **sirius-engine**: Multi-service container (scanner, terminal, agent)
- **sirius-postgres**: PostgreSQL database for vulnerability data
- **sirius-valkey**: Redis-compatible cache
- **sirius-rabbitmq**: Message queue for inter-service communication

## Docker Files Structure

### Core Dockerfile Locations

#### 1. `sirius-ui/Dockerfile`

**Purpose**: Builds the Next.js frontend application with development and production stages.

**Key Features**:

- Multi-stage build (development/production)
- Node.js 20 Alpine base
- Hot reload support in development
- SQLite database for authentication
- Volume mounts for live code reloading

```dockerfile
# Development stage with hot reload
FROM node:20-alpine AS development
# Production stage with optimized build
FROM node:20-alpine AS production
```

#### 2. `sirius-api/Dockerfile`

**Purpose**: Builds the Go REST API server.

**Key Features**:

- Go 1.24 base image
- Single-stage build for simplicity
- Exposes port 9001
- Connects to PostgreSQL and RabbitMQ

#### 3. `sirius-engine/Dockerfile`

**Purpose**: Multi-stage, multi-service container for scanner, terminal, and agent services.

**Key Features**:

- **Builder stage**: Clones and builds all Go services from GitHub
- **Development stage**: Full Go toolchain with live reloading via `air`
- **Production stage**: Optimized runtime with built binaries

**Services Built**:

- Scanner service (app-scanner)
- Terminal service (app-terminal)
- Agent service (app-agent)
- Go API (go-api)
- NSE scripts (sirius-nse)

**Build Arguments**:

```dockerfile
ARG GO_API_COMMIT_SHA=main
ARG APP_SCANNER_COMMIT_SHA=main
ARG APP_TERMINAL_COMMIT_SHA=main
ARG SIRIUS_NSE_COMMIT_SHA=main
ARG APP_AGENT_COMMIT_SHA=main
```

## Docker Compose Files

### 1. `docker-compose.yaml` (Base Configuration)

**Purpose**: Main Docker Compose configuration defining all services.

**Services Defined**:

- `sirius-ui`: Frontend (port 3000)
- `sirius-api`: Backend API (port 9001)
- `sirius-engine`: Multi-service engine (ports 5174, 50051)
- `sirius-postgres`: Database (port 5432)
- `sirius-valkey`: Cache (port 6379)
- `sirius-rabbitmq`: Message queue (ports 5672, 15672)

### 2. `docker-compose.override.yaml` (Development Override)

**Purpose**: Automatic development overrides loaded by Docker Compose.

**Key Modifications**:

- Targets development stages in Dockerfiles
- Volume mounts for live code reloading
- Development environment variables
- SQLite database for UI authentication

**Important Volume Mounts** (Commented by default):

```yaml
# Development volume mounts (require ../minor-projects/ structure):
# - ../minor-projects/app-agent:/app-agent
# - ../minor-projects/app-scanner:/app-scanner
# - ../minor-projects/app-terminal:/app-terminal
```

### 3. `docker-compose.production.yaml` (Production Configuration)

**Purpose**: Production deployment with optimized settings.

**Key Features**:

- Production Docker image stages
- No volume mounts (immutable containers)
- Production environment variables
- Resource limits and health checks

### 4. `docker-compose.staging.yaml` (Staging Configuration)

**Purpose**: Staging environment for testing production-like deployments.

### 5. `docker-compose.user.yaml` (User Customization)

**Purpose**: User-specific overrides and customizations.

### 6. `docker-compose.prod.yml` (Legacy Production)

**Purpose**: Alternative production configuration (legacy).

### 7. `docker-compose.local.example.yaml` (Example Configuration)

**Purpose**: Example configuration template for local development.

## Development vs Production Modes

### Development Mode

**Container Stages**: `development`
**Code Source**:

- Volume mounts from local directories (when enabled)
- GitHub cloned code (fallback)

**Features**:

- Live code reloading with `air`
- Full Go toolchain available
- Development environment variables
- Debug logging enabled

**Volume Mount Structure**:

```
Local Directory → Container Path → Purpose
./sirius-ui/src → /app/src → Live UI code
./sirius-engine → /engine → Engine scripts
../minor-projects/app-scanner → /app-scanner → Scanner code (optional)
```

### Production Mode

**Container Stages**: `runtime`/`production`
**Code Source**: Pre-built binaries from GitHub

**Features**:

- Optimized container images
- Pre-compiled binaries
- Production environment variables
- Minimal attack surface

## Essential Docker Commands

### Container Management

```bash
# Start all services
docker compose up -d

# Start with fresh build
docker compose up -d --build

# Stop all services
docker compose down

# Restart specific service
docker restart sirius-engine

# View all running containers
docker ps

# View container logs
docker logs sirius-engine --tail 50 -f

# Follow logs in real-time
docker logs -f sirius-engine
```

### Container Statistics and Monitoring

```bash
# Real-time container resource usage
docker stats

# Specific container stats
docker stats sirius-engine

# Container resource usage with formatting
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Disk usage by Docker
docker system df

# Clean up unused containers, networks, images
docker system prune
```

### Container Access and Debugging

```bash
# Execute shell in running container
docker exec -it sirius-engine /bin/bash

# Execute specific command
docker exec sirius-engine ps aux

# Copy files to/from container
docker cp file.txt sirius-engine:/tmp/
docker cp sirius-engine:/tmp/file.txt ./

# Inspect container configuration
docker inspect sirius-engine

# View container filesystem changes
docker diff sirius-engine
```

### Service-Specific Commands

```bash
# Check scanner service logs
docker exec sirius-engine grep -A 10 "Scanner" /engine/logs/scanner.log

# Test Nmap in scanner container
docker exec sirius-engine nmap --version

# Check agent server status
docker exec sirius-engine ps aux | grep agent

# Access RabbitMQ management
open http://localhost:15672  # guest/guest

# Check PostgreSQL connection
docker exec sirius-postgres psql -U postgres -d sirius -c "\l"
```

### Build and Image Management

```bash
# Build specific service
docker compose build sirius-engine

# Build with no cache
docker compose build --no-cache sirius-ui

# Pull latest images
docker compose pull

# Remove unused images
docker image prune

# View image layers
docker history sirius-engine:latest
```

## Environment Variables

### Global Environment Variables

```bash
# Set development mode
export GO_ENV=development
export NODE_ENV=development

# Database configuration
export POSTGRES_HOST=sirius-postgres
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=sirius

# Queue configuration
export RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/

# Cache configuration
export VALKEY_HOST=sirius-valkey
export VALKEY_PORT=6379
```

### Service-Specific Environment Variables

#### sirius-ui

```bash
DATABASE_URL=file:./dev.db  # SQLite for development
NEXTAUTH_SECRET=development-secret-key
NEXTAUTH_URL=http://localhost:3000
```

#### sirius-engine

```bash
ENGINE_MAIN_PORT=5174
GRPC_AGENT_PORT=50051
GO_ENV=development
```

## Volume Mounts and Data Persistence

### Development Volume Mounts

When `docker-compose.override.yaml` volume mounts are enabled:

```yaml
volumes:
  # UI live reloading
  - ./sirius-ui/src:/app/src
  - ./sirius-ui/public:/app/public

  # Engine source code (requires ../minor-projects/ structure)
  - ../minor-projects/app-scanner:/app-scanner
  - ../minor-projects/app-terminal:/app-terminal
  - ../minor-projects/app-agent:/app-agent

  # Preserve node_modules from container
  - node_modules:/app/node_modules
```

### Data Persistence

```yaml
volumes:
  # Database data
  postgres_data:/var/lib/postgresql/data

  # RabbitMQ data
  rabbitmq_data:/var/lib/rabbitmq

  # Cache data
  valkey_data:/data
```

## Networking

### Internal Network Communication

Services communicate through Docker's internal network:

```
sirius-ui → sirius-api (http://sirius-api:9001)
sirius-api → sirius-postgres (sirius-postgres:5432)
sirius-api → sirius-rabbitmq (sirius-rabbitmq:5672)
sirius-engine → sirius-rabbitmq (sirius-rabbitmq:5672)
```

### External Port Mapping

```
Host Port → Container Port → Service
3000 → 3000 → sirius-ui (Next.js)
9001 → 9001 → sirius-api (Go API)
5174 → 5174 → sirius-engine (Engine)
50051 → 50051 → sirius-engine (gRPC Agent)
5432 → 5432 → sirius-postgres
6379 → 6379 → sirius-valkey
5672 → 5672 → sirius-rabbitmq (AMQP)
15672 → 15672 → sirius-rabbitmq (Management UI)
```

## Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone <repository>
cd Sirius

# Start development environment
docker compose up -d --build

# Verify all services are running
docker ps
```

### 2. Development with Live Reload

For UI development (works out of the box):

```bash
# Edit files in sirius-ui/src/
# Changes automatically reload in browser
```

For engine development (requires setup):

```bash
# Ensure you have ../minor-projects/ structure
# Uncomment volume mounts in docker-compose.override.yaml
# Restart containers
docker compose down && docker compose up -d
```

### 3. Testing Changes

```bash
# Check service logs
docker logs sirius-engine -f

# Test specific functionality
docker exec sirius-engine nmap --version

# Access services
open http://localhost:3000  # UI
open http://localhost:15672 # RabbitMQ Management
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Container Won't Start

```bash
# Check container logs
docker logs sirius-engine --tail 100

# Check if ports are available
netstat -tuln | grep 3000

# Restart with fresh build
docker compose down && docker compose up -d --build
```

#### 2. Volume Mount Issues

```bash
# Verify volume mount paths exist
ls -la ../minor-projects/app-scanner

# Check container filesystem
docker exec sirius-engine ls -la /app-scanner-src

# Temporarily copy files to container
docker cp local-file.go sirius-engine:/app-scanner-src/file.go
```

#### 3. Network Connectivity Issues

```bash
# Test internal network connectivity
docker exec sirius-ui ping sirius-api

# Check exposed ports
docker port sirius-engine

# Verify service discovery
docker exec sirius-api nslookup sirius-postgres
```

#### 4. Database Connection Issues

```bash
# Check PostgreSQL status
docker exec sirius-postgres pg_isready

# Test database connection
docker exec sirius-postgres psql -U postgres -d sirius -c "SELECT version();"

# Check database logs
docker logs sirius-postgres --tail 50
```

#### 5. RabbitMQ Queue Issues

```bash
# Check RabbitMQ status
docker exec sirius-rabbitmq rabbitmqctl status

# List queues
docker exec sirius-rabbitmq rabbitmqctl list_queues

# Access management interface
open http://localhost:15672  # guest/guest
```

### Development Mode Specific Issues

#### Air Live Reload Not Working

```bash
# Check if air is installed
docker exec sirius-engine which air

# Restart with development stage
docker compose build --target development sirius-engine
docker restart sirius-engine
```

#### Source Code Not Updating

```bash
# Verify volume mounts are enabled
docker inspect sirius-engine | grep Mounts -A 20

# Copy files manually for testing
docker cp app-scanner/file.go sirius-engine:/app-scanner-src/
```

## Performance Optimization

### Resource Limits

```yaml
services:
  sirius-engine:
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
        reservations:
          memory: 1G
```

### Build Optimization

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with cache mount
docker compose build --progress=plain

# Multi-platform builds
docker buildx build --platform linux/amd64,linux/arm64 .
```

## Security Considerations

### Container Security

```bash
# Run containers as non-root user (production)
USER sirius

# Scan images for vulnerabilities
docker scout cves sirius-engine:latest

# Limit container capabilities
security_opt:
  - no-new-privileges:true
```

### Network Security

```bash
# Use internal networks
networks:
  internal:
    driver: bridge
    internal: true
```

### Secrets Management

```bash
# Use Docker secrets for sensitive data
echo "sensitive_password" | docker secret create db_password -

# Mount secrets in compose
secrets:
  - db_password
```

## Monitoring and Logging

### Container Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Centralized Logging

```bash
# View aggregated logs
docker compose logs -f

# Filter logs by service
docker compose logs -f sirius-engine

# Export logs to file
docker compose logs > sirius-logs.txt
```

### Metrics Collection

```bash
# Prometheus metrics endpoint
curl http://localhost:9001/metrics

# Container metrics
docker stats --format "json" > container-metrics.json
```

## Deployment Scenarios

### Local Development

- Use `docker-compose.override.yaml`
- Volume mounts enabled
- Development image stages

### Testing/CI

- Use `docker-compose.yaml` only
- Fresh builds each time
- Production image stages

### Staging

- Use `docker-compose.staging.yaml`
- Production-like configuration
- External databases

### Production

- Use `docker-compose.production.yaml`
- Optimized images
- External services
- Resource limits
- Health checks

## Best Practices

### Development

1. Use `.dockerignore` to exclude unnecessary files
2. Enable volume mounts only when needed
3. Use development image stages for debugging
4. Keep containers stateless
5. Use named volumes for data persistence

### Production

1. Use multi-stage builds for smaller images
2. Run containers as non-root users
3. Implement proper health checks
4. Use resource limits
5. Enable logging and monitoring

### Maintenance

1. Regularly update base images
2. Clean up unused containers and images
3. Monitor resource usage
4. Backup persistent volumes
5. Test disaster recovery procedures

## Common Development Issues and Solutions

### Issue 1: Development Volume Mounts Not Working

**Problem**: Local code changes not reflected in containers during development.

**Root Cause**: Volume mounts in `docker-compose.override.yaml` are commented out by default.

**Solution**:

1. Ensure `../minor-projects/` directory structure exists with individual repositories
2. Uncomment volume mounts in `docker-compose.override.yaml`:

```yaml
# Uncomment these lines for local development:
- ../minor-projects/app-agent:/app-agent
- ../minor-projects/app-scanner:/app-scanner
- ../minor-projects/app-terminal:/app-terminal
```

3. Restart containers: `docker compose down && docker compose up -d`

**Alternative**: Copy files directly to container for testing:

```bash
docker cp local-file.go sirius-engine:/app-scanner-src/file.go
```

### Issue 2: Container Using Wrong Build Stage

**Problem**: Development containers running production binaries.

**Root Cause**: Docker not building development stage correctly.

**Solution**:

```bash
# Force rebuild with development stage
docker compose down
docker compose up -d --build

# Verify correct stage is running
docker exec sirius-engine which air  # Should return /root/go/bin/air
```

### Issue 3: Nmap Configuration Errors

**Problem**:

- "Duplicate port number(s) specified" warning
- "NSE: failed to initialize the script engine: no path to file/directory: scripts/args.txt"

**Root Cause**:

- Port specification contained overlapping ranges: `"21-25,80,135,139,443,445,3389,1-1000"`
- Development args file path missing from search locations

**Solution Applied**:

1. Fixed port specification to `"1-1000,3389"`
2. Added development args file path: `"/app-scanner-src/scripts/args.txt"`
3. Updated container code and restarted services

**Verification**:

```bash
# Test Nmap with corrected configuration
docker exec sirius-engine nmap -p 1-1000,3389 --script vulners 127.0.0.1 -T4 -sV -Pn --script-args-file /app-scanner-src/scripts/args.txt
```

### Issue 4: TRPC Timeout Errors in Development

**Problem**: Frontend unable to connect to backend API with timeout errors.

**Root Cause**: sirius-engine container in restart loop, port 50051 not properly exposed.

**Solution**:

1. Verify all containers are running: `docker ps`
2. Check container logs: `docker logs sirius-engine`
3. Ensure development stage builds correctly: `docker compose up -d --build`
4. Verify port exposure: `docker port sirius-engine`

### Issue 5: "air: command not found" in Development

**Problem**: Live reload not working, air binary missing.

**Root Cause**: Container using production stage instead of development stage.

**Solution**:

```bash
# Force development stage build
docker compose build --target development sirius-engine
docker restart sirius-engine

# Verify air is available
docker exec sirius-engine which air
```

### Issue 6: Go Binary Compatibility Issues

**Problem**: `go: command not found` errors in production container.

**Root Cause**: Alpine musl vs Debian glibc binary compatibility.

**Solution**: Use Debian-based images for Go builds to ensure binary compatibility.

## Development Tips and Tricks

### Quick Container Access

```bash
# Jump into any container quickly
alias dexec='docker exec -it'
dexec sirius-engine bash

# Quick log viewing
alias dlogs='docker logs -f'
dlogs sirius-engine
```

### Development Workflow Shortcuts

```bash
# Complete restart and rebuild
alias drestart='docker compose down && docker compose up -d --build'

# Quick service restart
alias dre='docker restart'
dre sirius-engine

# View all container status
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

### File Synchronization

```bash
# Sync local changes to container (when volume mounts fail)
sync_to_container() {
    local service=$1
    local local_path=$2
    local container_path=$3
    docker cp "$local_path" "$service:$container_path"
}

# Example usage
sync_to_container sirius-engine ../minor-projects/app-scanner/modules/nmap/nmap.go /app-scanner-src/modules/nmap/nmap.go
```

### Debug Container Issues

```bash
# Complete container inspection
debug_container() {
    local container=$1
    echo "=== Container Status ==="
    docker ps | grep $container
    echo "=== Container Logs (last 20 lines) ==="
    docker logs $container --tail 20
    echo "=== Container Processes ==="
    docker exec $container ps aux
    echo "=== Container Mounts ==="
    docker inspect $container | grep -A 10 "Mounts"
}

# Usage
debug_container sirius-engine
```

## Performance Monitoring

### Container Resource Usage

```bash
# Real-time monitoring with custom format
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Log resource usage to file
docker stats --no-stream --format "{{.Container}},{{.CPUPerc}},{{.MemUsage}}" > container-stats.csv
```

### Service Health Monitoring

```bash
# Check all service endpoints
check_services() {
    echo "UI: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"
    echo "API: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:9001/health)"
    echo "RabbitMQ Management: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:15672)"
}
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Container Monitoring](https://docs.docker.com/config/containers/runmetrics/)
- [Multi-stage Build Guide](https://docs.docker.com/develop/dev-best-practices/#use-multi-stage-builds)
- [Docker Compose Override Files](https://docs.docker.com/compose/extends/)

---

_This documentation reflects the current Docker implementation as of June 2025 and includes solutions to issues encountered during development. For the most up-to-date information, refer to the actual Docker files in the repository._
