---
title: "Docker Architecture"
description: "Comprehensive guide to Sirius Docker setup, including all Docker Compose files, Dockerfiles, service architecture, and operational considerations"
template: "TEMPLATE.architecture"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["docker", "architecture", "containers", "orchestration", "deployment"]
categories: ["architecture", "infrastructure", "deployment"]
difficulty: "intermediate"
prerequisites: ["docker", "docker-compose", "containerization"]
related_docs:
  - "README.container-testing.md"
  - "README.development.md"
dependencies:
  - "docker-compose.yaml"
  - "docker-compose.dev.yaml"
  - "docker-compose.prod.yaml"
llm_context: "high"
search_keywords: ["docker", "compose", "containers", "services", "architecture", "deployment", "production", "development"]
---

# Docker Architecture

## Purpose

This document provides a comprehensive guide to the Sirius Docker architecture, including all Docker Compose configurations, service definitions, build processes, and operational considerations. It serves as the definitive reference for understanding, deploying, and maintaining the containerized Sirius application.

## When to Use

- **Before deploying Sirius** - Understand the complete container architecture
- **When troubleshooting Docker issues** - Reference service configurations and dependencies
- **During development setup** - Choose appropriate Docker Compose configuration
- **For production deployment** - Understand production-specific optimizations
- **When adding new services** - Follow established patterns and conventions
- **For capacity planning** - Understand resource requirements and scaling considerations

## How to Use

1. **Start with the overview** - Understand the overall architecture and service relationships
2. **Review Docker Compose files** - Understand the different environment configurations
3. **Examine Dockerfiles** - Understand build processes and multi-stage builds
4. **Check service dependencies** - Understand startup order and health checks
5. **Review operational considerations** - Understand monitoring, logging, and maintenance
6. **Reference troubleshooting** - Use the troubleshooting section for common issues

## What This Architecture Is

### Core Philosophy

The Sirius Docker architecture follows a **microservices-oriented containerization strategy** where each major component runs in its own container, with clear separation of concerns and well-defined interfaces. The architecture prioritizes:

- **Service isolation** - Each component runs independently with defined boundaries
- **Environment consistency** - Same container images work across development, staging, and production
- **Scalability** - Services can be scaled independently based on demand
- **Maintainability** - Clear separation makes debugging and updates easier
- **Resource efficiency** - Multi-stage builds and optimized base images minimize resource usage

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Sirius Docker Stack                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   sirius-ui     │    │   sirius-api    │                    │
│  │   (Next.js)     │◄──►│   (Go REST)     │                    │
│  │   Port: 3000    │    │   Port: 9001    │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                       │                            │
│           │                       │                            │
│  Processing Layer                 │                            │
│  ┌─────────────────┐              │                            │
│  │ sirius-engine   │◄─────────────┘                            │
│  │ (Multi-service) │                                            │
│  │ Ports: 5174,    │                                            │
│  │        50051    │                                            │
│  └─────────────────┘                                            │
│           │                                                     │
│  Data Layer                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ sirius-postgres │  │ sirius-valkey   │  │sirius-rabbitmq  │ │
│  │ (PostgreSQL)    │  │ (Redis Cache)   │  │ (Message Queue) │ │
│  │ Port: 5432      │  │ Port: 6379      │  │ Ports: 5672,    │ │
│  └─────────────────┘  └─────────────────┘  │         15672   │ │
│                                           └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Service Architecture

### Frontend Services

#### sirius-ui (Next.js Frontend)
- **Purpose**: User interface and web application
- **Technology**: Next.js 14 with React, TypeScript, Tailwind CSS
- **Ports**: 3000 (HTTP), 3001 (Development)
- **Dependencies**: sirius-postgres (production), SQLite (development)
- **Health Check**: `http://localhost:3000/api/health`
- **Resource Limits**: 1GB RAM, 0.5 CPU
- **Build Stages**: development, production

**Key Features**:
- Multi-stage Dockerfile with optimized production build
- Hot reloading in development mode
- Volume mounts for source code in development
- Environment-specific database configuration (SQLite dev, PostgreSQL prod)

#### sirius-api (Go REST API)
- **Purpose**: RESTful API server and business logic
- **Technology**: Go 1.23 with Gin framework
- **Ports**: 9001 (HTTP)
- **Dependencies**: sirius-postgres, sirius-valkey, sirius-rabbitmq
- **Health Check**: `http://localhost:9001/api/v1/health`
- **Resource Limits**: 512MB RAM, 0.5 CPU
- **Build Stages**: development, runner

**Key Features**:
- Multi-stage build with optimized runner stage
- Volume mounts for development with live reloading
- Database connection pooling and health checks
- Message queue integration for async processing

### Processing Services

#### sirius-engine (Multi-Service Container)
- **Purpose**: Core processing engine with multiple integrated services
- **Technology**: Go 1.23 with integrated submodules
- **Ports**: 5174 (HTTP), 50051 (gRPC)
- **Dependencies**: sirius-rabbitmq, sirius-postgres, sirius-valkey
- **Health Check**: `http://localhost:5174/health`
- **Resource Limits**: 1GB RAM, 1.0 CPU
- **Build Stages**: development, runtime

**Integrated Services**:
- **Agent System**: Manages scanning agents and their lifecycle
- **Scanner Integration**: Integrates with nmap, rustscan, and custom scanners
- **Terminal Management**: Provides secure terminal access for agents
- **gRPC Server**: Handles agent communication on port 50051

**Key Features**:
- Multi-stage build with comprehensive dependency management
- Submodule integration for related projects
- Volume mounts for development with live code updates
- Resource-intensive processing capabilities

### Data Services

#### sirius-postgres (PostgreSQL Database)
- **Purpose**: Primary data storage and persistence
- **Technology**: PostgreSQL 15 Alpine
- **Ports**: 5432 (PostgreSQL)
- **Dependencies**: None (foundation service)
- **Health Check**: `pg_isready -U postgres`
- **Resource Limits**: 1GB RAM, 0.5 CPU
- **Data Persistence**: `postgres_data` volume

**Key Features**:
- Production-optimized configuration in prod mode
- Connection pooling and performance tuning
- Automated health checks and restart policies
- Persistent data storage with volume mounts

#### sirius-valkey (Redis Cache)
- **Purpose**: Caching and session storage
- **Technology**: Valkey (Redis-compatible)
- **Ports**: 6379 (Redis)
- **Dependencies**: None (foundation service)
- **Health Check**: `redis-cli ping`
- **Resource Limits**: 256MB RAM, 0.25 CPU
- **Data Persistence**: `valkey_data` volume

**Key Features**:
- Lightweight and fast caching layer
- Session storage for authentication
- Temporary data storage for processing
- Memory-optimized configuration

#### sirius-rabbitmq (Message Queue)
- **Purpose**: Asynchronous message processing and service communication
- **Technology**: RabbitMQ 3.7.3 with Management UI
- **Ports**: 5672 (AMQP), 15672 (Management UI)
- **Dependencies**: None (foundation service)
- **Health Check**: `rabbitmqctl status`
- **Resource Limits**: 512MB RAM, 0.5 CPU
- **Data Persistence**: `rabbitmq_data` volume

**Key Features**:
- Reliable message queuing for async processing
- Management UI for monitoring and debugging
- Dead letter queues and message routing
- Production authentication in prod mode

## Docker Compose Configurations

### Base Configuration (`docker-compose.yaml`)

The base configuration provides the core service definitions and is used as the foundation for all environments.

**Key Characteristics**:
- **Service Definitions**: All 6 services with production-ready defaults
- **Resource Limits**: Defined memory and CPU limits for each service
- **Health Checks**: Comprehensive health monitoring for all services
- **Dependencies**: Proper service startup order with health check conditions
- **Networking**: Custom bridge network named `sirius`
- **Volumes**: Persistent data storage for databases and message queue

**Usage**:
```bash
# Start all services with base configuration
docker compose up -d

# Stop all services
docker compose down

# View service status
docker compose ps
```

### Development Configuration (`docker-compose.dev.yaml`)

The development configuration overrides the base configuration to enable development features.

**Key Overrides**:
- **Volume Mounts**: Source code mounted for live reloading
- **Build Targets**: Uses development stages for all services
- **Environment Variables**: Development-specific settings
- **Database Configuration**: SQLite for UI, PostgreSQL for API
- **Logging**: Debug-level logging enabled
- **Ports**: Additional development ports exposed

**Key Features**:
- **Hot Reloading**: Source code changes reflected immediately
- **Debug Mode**: Enhanced logging and error reporting
- **Development Dependencies**: All dev dependencies included
- **Volume Persistence**: Node modules preserved to avoid architecture conflicts

**Usage**:
```bash
# Start development environment
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d

# Stop development environment
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down
```

### Production Configuration (`docker-compose.prod.yaml`)

The production configuration optimizes the base configuration for production deployment.

**Key Overrides**:
- **Build Targets**: Uses production/runner stages for all services
- **Environment Variables**: Production-specific settings
- **Resource Optimization**: Enhanced PostgreSQL and RabbitMQ configuration
- **Security**: Production authentication and secrets
- **Performance**: Optimized database and cache settings

**Key Features**:
- **Optimized Builds**: Multi-stage builds with minimal production images
- **Security Hardening**: Production authentication and secret management
- **Performance Tuning**: Database and cache optimization
- **Monitoring**: Enhanced health checks and resource monitoring

**Usage**:
```bash
# Start production environment
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d

# Stop production environment
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml down
```

## Dockerfile Architecture

### Multi-Stage Build Strategy

All services use multi-stage Dockerfiles to optimize image size and build efficiency.

#### sirius-ui Dockerfile

**Stages**:
1. **base**: Common dependencies and package installation
2. **development**: Full development environment with hot reloading
3. **production**: Optimized production build

**Key Features**:
- **Bun to npm conversion**: Automatic conversion for compatibility
- **Architecture support**: Multi-architecture builds
- **Optimized layers**: Cached dependency installation
- **Security**: Non-root user execution

#### sirius-api Dockerfile

**Stages**:
1. **development**: Development environment with volume mounts
2. **runner**: Production-optimized runtime

**Key Features**:
- **Go modules**: Efficient dependency management
- **Security**: Non-root user execution
- **Optimization**: Minimal production image
- **Health checks**: Built-in health monitoring

#### sirius-engine Dockerfile

**Stages**:
1. **builder**: Comprehensive build environment with all dependencies
2. **development**: Development environment with volume mounts
3. **runtime**: Production-optimized runtime

**Key Features**:
- **Submodule integration**: Automated cloning and building of related projects
- **Dependency management**: Comprehensive system and Go dependencies
- **Multi-service support**: Integrated agent, scanner, and terminal services
- **Resource optimization**: Efficient runtime with minimal dependencies

## Service Dependencies and Startup

### Dependency Chain

```
sirius-postgres (foundation)
    ├── sirius-api (depends on postgres health)
    └── sirius-ui (depends on postgres health in production)

sirius-rabbitmq (foundation)
    ├── sirius-api (depends on rabbitmq health)
    └── sirius-engine (depends on rabbitmq health)

sirius-valkey (foundation)
    └── sirius-api (depends on valkey)

sirius-api (middleware)
    └── sirius-ui (depends on api for data)
```

### Startup Sequence

1. **Foundation Services** (start first):
   - sirius-postgres
   - sirius-valkey
   - sirius-rabbitmq

2. **Application Services** (start after foundation health checks):
   - sirius-api
   - sirius-engine

3. **Frontend Services** (start after application services):
   - sirius-ui

### Health Check Strategy

- **Database Services**: Use native health check commands
- **Application Services**: HTTP health endpoints
- **Dependency Management**: Services wait for dependencies to be healthy
- **Retry Logic**: Configurable retry intervals and timeouts

## Resource Management

### Memory Allocation

| Service | Development | Production | Notes |
|---------|-------------|------------|-------|
| sirius-ui | 512MB | 1GB | Frontend with build tools |
| sirius-api | 256MB | 512MB | REST API with caching |
| sirius-engine | 512MB | 1GB | Multi-service processing |
| sirius-postgres | 512MB | 1GB | Database with optimization |
| sirius-valkey | 128MB | 256MB | Lightweight cache |
| sirius-rabbitmq | 256MB | 512MB | Message queue with UI |

### CPU Allocation

| Service | Development | Production | Notes |
|---------|-------------|------------|-------|
| sirius-ui | 0.25 | 0.5 | Frontend processing |
| sirius-api | 0.25 | 0.5 | API request handling |
| sirius-engine | 0.5 | 1.0 | Intensive processing |
| sirius-postgres | 0.25 | 0.5 | Database operations |
| sirius-valkey | 0.1 | 0.25 | Cache operations |
| sirius-rabbitmq | 0.25 | 0.5 | Message processing |

## Networking Architecture

### Network Configuration

- **Network Name**: `sirius`
- **Driver**: Bridge
- **Scope**: Local
- **IPAM**: Default Docker IPAM

### Port Mapping

| Service | Internal Port | External Port | Protocol | Purpose |
|---------|---------------|---------------|----------|---------|
| sirius-ui | 3000 | 3000 | HTTP | Web interface |
| sirius-ui | 3001 | 3001 | HTTP | Development server |
| sirius-api | 9001 | 9001 | HTTP | REST API |
| sirius-engine | 5174 | 5174 | HTTP | Engine interface |
| sirius-engine | 50051 | 50051 | gRPC | Agent communication |
| sirius-postgres | 5432 | 5432 | TCP | Database |
| sirius-valkey | 6379 | 6379 | TCP | Cache |
| sirius-rabbitmq | 5672 | 5672 | AMQP | Message queue |
| sirius-rabbitmq | 15672 | 15672 | HTTP | Management UI |

### Service Communication

- **Internal Communication**: Services communicate using container names
- **External Access**: Ports exposed for external access
- **Health Checks**: Internal health check endpoints
- **Load Balancing**: Ready for external load balancer integration

## Data Persistence

### Volume Strategy

- **Database Data**: Persistent volumes for PostgreSQL
- **Cache Data**: Persistent volumes for Valkey
- **Message Queue Data**: Persistent volumes for RabbitMQ
- **Application Data**: Volume mounts for development

### Volume Configuration

```yaml
volumes:
  postgres_data:
    driver: local
  valkey_data:
    driver: local
  rabbitmq_data:
    driver: local
  node_modules:  # Development only
    driver: local
```

### Backup Strategy

- **Database Backups**: Regular PostgreSQL dumps
- **Volume Backups**: Docker volume backup utilities
- **Configuration Backups**: Docker Compose file versioning
- **Disaster Recovery**: Multi-environment deployment strategy

## Environment Management

### Environment Variables

#### Required Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| POSTGRES_USER | Database user | postgres | No |
| POSTGRES_PASSWORD | Database password | postgres | No |
| POSTGRES_DB | Database name | sirius | No |
| NEXTAUTH_SECRET | Authentication secret | change-this-secret | Yes (prod) |
| NEXTAUTH_URL | Authentication URL | http://localhost:3000 | Yes (prod) |

#### Optional Variables

| Variable | Purpose | Default | Environment |
|----------|---------|---------|-------------|
| NODE_ENV | Node environment | production | All |
| GO_ENV | Go environment | production | All |
| LOG_LEVEL | Logging level | info | All |
| API_PORT | API port | 9001 | All |
| ENGINE_MAIN_PORT | Engine port | 5174 | All |

### Configuration Files

- **Docker Compose**: Environment-specific overrides
- **Environment Files**: `.env` files for variable management
- **Dockerfile Args**: Build-time configuration
- **Service Configs**: Application-specific configuration

## Monitoring and Observability

### Health Checks

- **HTTP Endpoints**: Application health endpoints
- **Database Checks**: Native database health commands
- **Service Dependencies**: Automatic dependency health monitoring
- **Resource Monitoring**: Memory and CPU usage tracking

### Logging Strategy

- **Container Logs**: Docker native logging
- **Application Logs**: Service-specific logging
- **Log Levels**: Configurable per service
- **Log Aggregation**: Ready for external log aggregation

### Metrics Collection

- **Service Metrics**: Built-in health check endpoints
- **Resource Metrics**: Docker stats and resource usage
- **Application Metrics**: Service-specific metrics
- **External Monitoring**: Ready for Prometheus/Grafana integration

## Security Considerations

### Container Security

- **Non-root Users**: All services run as non-root users
- **Resource Limits**: Memory and CPU limits prevent resource exhaustion
- **Network Isolation**: Custom network with controlled access
- **Image Security**: Regular base image updates

### Data Security

- **Encryption**: Database and cache encryption at rest
- **Authentication**: Production authentication mechanisms
- **Secrets Management**: Environment variable-based secrets
- **Network Security**: Controlled port exposure

### Production Security

- **Secret Rotation**: Regular secret updates
- **Access Control**: Limited external port exposure
- **Audit Logging**: Comprehensive logging for security events
- **Vulnerability Scanning**: Regular container vulnerability scans

## Troubleshooting

### Common Issues

#### Service Startup Failures

**Symptoms**: Services fail to start or restart repeatedly
**Causes**: 
- Resource constraints
- Dependency health check failures
- Configuration errors
- Port conflicts

**Solutions**:
```bash
# Check service status
docker compose ps

# View service logs
docker compose logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker compose restart [service-name]
```

#### Database Connection Issues

**Symptoms**: API or UI cannot connect to database
**Causes**:
- Database not ready
- Wrong connection parameters
- Network connectivity issues

**Solutions**:
```bash
# Check database health
docker compose exec sirius-postgres pg_isready -U postgres

# Check database logs
docker compose logs sirius-postgres

# Test connection
docker compose exec sirius-api curl -f http://localhost:9001/health
```

#### Build Failures

**Symptoms**: Docker build fails or takes too long
**Causes**:
- Insufficient resources
- Network connectivity issues
- Dockerfile errors
- Dependency resolution problems

**Solutions**:
```bash
# Clean build cache
docker builder prune

# Build with verbose output
docker compose build --no-cache --progress=plain

# Check build context
docker compose config
```

#### Volume Issues

**Symptoms**: Data not persisting or permission errors
**Causes**:
- Volume mount issues
- Permission problems
- Disk space issues

**Solutions**:
```bash
# Check volume status
docker volume ls

# Inspect volume
docker volume inspect sirius_postgres_data

# Clean up unused volumes
docker volume prune
```

#### Docker Layer Caching Issues

**Symptoms**: 
- Production services running development code (e.g., `next dev` instead of `next start`)
- Wrong build targets being used despite correct Docker Compose configuration
- Services behaving differently than expected based on environment configuration
- React hook errors or development-specific errors in production mode

**Causes**:
- Docker layer caching preventing proper build stage selection
- Cached development images being used instead of production builds
- Multi-stage Dockerfile not building correct target stage
- Docker Compose not forcing rebuild of cached images

**Root Cause Analysis**:
This issue occurs when Docker's layer caching system retains development-stage images and reuses them even when production configurations are specified. The problem manifests when:
1. Development images are built first and cached
2. Production builds reference the same base layers
3. Docker reuses cached development layers instead of building production stages
4. The final image contains development code despite being tagged as production

**Solutions**:

**Immediate Fix**:
```bash
# Stop all services
docker compose down

# Clean Docker system cache
docker system prune -f

# Rebuild with no cache
docker compose build --no-cache

# Start services
docker compose up -d
```

**Prevention Strategies**:
```bash
# Always use --no-cache for production builds
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml build --no-cache

# Clean build cache before switching environments
docker builder prune

# Verify correct build target is being used
docker compose config | grep -A 5 "target:"
```

**Verification Steps**:
```bash
# Check what command is actually running in container
docker compose exec sirius-ui ps aux

# Verify build stage in container
docker compose exec sirius-ui cat /app/start-prod.sh

# Check container logs for correct startup script
docker compose logs sirius-ui | grep -E "(next dev|next start|npm run)"

# Verify environment variables
docker compose exec sirius-ui env | grep NODE_ENV
```

**Long-term Prevention**:
1. **Use distinct image tags** for different environments
2. **Implement build stage validation** in CI/CD pipelines
3. **Regular cache cleanup** in automated builds
4. **Monitor container startup logs** for correct command execution
5. **Use multi-stage builds with explicit stage selection**

**Example Multi-Stage Build Validation**:
```dockerfile
# Ensure production stage is explicitly selected
FROM node:18-alpine AS production
# ... production-specific setup

# Development stage should be clearly separated
FROM node:18-alpine AS development  
# ... development-specific setup
```

**Docker Compose Target Verification**:
```yaml
# Ensure correct target is specified
services:
  sirius-ui:
    build:
      context: ./sirius-ui
      target: production  # Explicitly specify production stage
```

### Debugging Commands

```bash
# View all service status
docker compose ps

# View service logs
docker compose logs -f [service-name]

# Execute commands in container
docker compose exec [service-name] [command]

# View resource usage
docker stats

# Check network connectivity
docker compose exec [service-name] ping [target-service]

# View Docker Compose configuration
docker compose config

# Restart all services
docker compose restart

# Stop and remove all containers
docker compose down -v
```

### Performance Optimization

#### Resource Tuning

- **Memory Limits**: Adjust based on actual usage
- **CPU Limits**: Scale based on processing needs
- **Volume Performance**: Use local volumes for better performance
- **Network Optimization**: Optimize service communication

#### Build Optimization

- **Multi-stage Builds**: Use appropriate build stages
- **Layer Caching**: Optimize Dockerfile layer ordering
- **Dependency Management**: Minimize dependency changes
- **Image Size**: Use minimal base images

## Best Practices

### Development Workflow

1. **Use Development Configuration**: Always use dev overrides for development
2. **Volume Mounts**: Use volume mounts for live code updates
3. **Health Checks**: Wait for services to be healthy before testing
4. **Resource Monitoring**: Monitor resource usage during development
5. **Log Analysis**: Use logs for debugging and optimization
6. **Cache Management**: Clean Docker cache when switching between environments
7. **Build Verification**: Always verify correct build targets are being used

### Production Deployment

1. **Environment Variables**: Use proper secret management
2. **Resource Planning**: Plan resources based on expected load
3. **Monitoring Setup**: Implement comprehensive monitoring
4. **Backup Strategy**: Implement regular backup procedures
5. **Security Hardening**: Apply production security measures
6. **Build Validation**: Always use `--no-cache` for production builds
7. **Environment Isolation**: Ensure clean separation between dev and prod builds

### Environment Switching

1. **Clean Transitions**: Always clean Docker cache when switching environments
2. **Build Verification**: Verify correct build targets before starting services
3. **Log Monitoring**: Check startup logs to ensure correct commands are running
4. **Cache Management**: Use `docker system prune` between environment switches
5. **Target Validation**: Explicitly specify build targets in Docker Compose files

### Maintenance

1. **Regular Updates**: Keep base images and dependencies updated
2. **Log Rotation**: Implement log rotation and cleanup
3. **Volume Management**: Monitor and clean up unused volumes
4. **Security Scanning**: Regular vulnerability scanning
5. **Performance Monitoring**: Continuous performance monitoring

## Future Considerations

### Scaling Strategy

- **Horizontal Scaling**: Ready for service replication
- **Load Balancing**: External load balancer integration
- **Database Scaling**: Read replicas and connection pooling
- **Cache Scaling**: Redis cluster configuration

### Advanced Features

- **Service Mesh**: Istio or similar service mesh integration
- **Container Orchestration**: Kubernetes deployment readiness
- **CI/CD Integration**: Automated build and deployment pipelines
- **Monitoring Integration**: Prometheus and Grafana integration

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
