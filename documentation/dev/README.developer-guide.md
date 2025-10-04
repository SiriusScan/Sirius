---
title: "Sirius Developer Guide"
description: "Complete guide for developers working on Sirius, including environment setup, development workflows, and best practices."
template: "TEMPLATE.guide"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["development", "guide", "workflow", "docker", "environment"]
categories: ["development", "guide"]
difficulty: "beginner"
prerequisites: ["docker", "git", "nodejs", "go"]
related_docs:
  - "README.development.md"
  - "README.docker-architecture.md"
  - "README.container-testing.md"
dependencies:
  - "scripts/switch-env.sh"
  - "docker-compose.yaml"
  - "docker-compose.dev.yaml"
  - "docker-compose.prod.yaml"
llm_context: "high"
search_keywords:
  [
    "developer guide",
    "development workflow",
    "environment switching",
    "docker development",
    "hot reloading",
    "development setup",
  ]
---

# Sirius Developer Guide

## Overview

This guide provides everything you need to know to develop effectively on the Sirius project. Whether you're working on the UI, API, engine, or any other component, this guide will help you get up and running quickly.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Start development environment
./scripts/switch-env.sh dev

# Access the application
open http://localhost:3000
```

## Development Environments

Sirius supports three distinct development environments, each optimized for different use cases:

### 🚀 Development Mode (Recommended)

**Best for: UI/API development, testing, most development tasks**

```bash
./scripts/switch-env.sh dev
```

**Features:**

- Hot reloading for instant code changes
- Volume mounts for live code updates
- Development-optimized builds
- SQLite database for faster development
- Debug logging enabled

**What's Running:**

- UI: `npm run dev` (Next.js development server)
- API: Go development mode with live reloading
- Engine: Development mode with volume mounts

### 🏭 Production Mode

**Best for: Testing production builds, performance testing, pre-deployment validation**

```bash
./scripts/switch-env.sh prod
```

**Features:**

- Optimized production builds
- PostgreSQL database
- Production authentication
- Performance optimizations
- Security hardening

**What's Running:**

- UI: `npm start` (Next.js production server)
- API: Pre-built Go binary
- Engine: Production-optimized runtime

### ⚙️ Base Mode

**Best for: Standard operations, CI/CD, basic testing**

```bash
./scripts/switch-env.sh base
```

**Features:**

- Default configuration
- Balanced performance
- Standard resource allocation
- Core functionality only

## Environment Switching

The `scripts/switch-env.sh` script handles seamless switching between environments:

```bash
# Switch to development
./scripts/switch-env.sh dev

# Switch to production
./scripts/switch-env.sh prod

# Switch to base
./scripts/switch-env.sh base
```

**What the script does:**

1. Stops all running containers
2. Removes old images to prevent cache conflicts
3. Builds the appropriate environment with correct build targets
4. Starts all services
5. Shows container status and access URLs

## Development Workflow

### Daily Development

1. **Start your day:**

   ```bash
   ./scripts/switch-env.sh dev
   ```

2. **Make your changes:**

   - Edit UI code in `sirius-ui/src/`
   - Edit API code in `sirius-api/`
   - Edit engine code in `sirius-engine/`

3. **See changes instantly:**

   - UI changes appear immediately (hot reloading)
   - API changes require container restart
   - Engine changes require container restart

4. **Test your changes:**

   ```bash
   # Check container status
   docker compose ps

   # View logs
   docker compose logs sirius-ui
   docker compose logs sirius-api
   ```

### Testing Production Builds

1. **Switch to production mode:**

   ```bash
   ./scripts/switch-env.sh prod
   ```

2. **Test your changes:**

   - Verify UI renders correctly
   - Test API endpoints
   - Check performance characteristics

3. **Switch back to development:**
   ```bash
   ./scripts/switch-env.sh dev
   ```

### Working with Different Components

#### Frontend Development (UI)

```bash
# Start development mode
./scripts/switch-env.sh dev

# Make changes to React components
# Changes appear instantly in browser

# Test production build
./scripts/switch-env.sh prod
```

#### Backend Development (API)

```bash
# Start development mode
./scripts/switch-env.sh dev

# Make changes to Go code
# Restart API container to see changes
docker compose restart sirius-api

# Check API logs
docker compose logs sirius-api -f
```

#### Engine Development

```bash
# Start development mode
./scripts/switch-env.sh dev

# Make changes to engine code
# Restart engine container to see changes
docker compose restart sirius-engine

# Check engine logs
docker compose logs sirius-engine -f
```

## Project Structure

```
Sirius/
├── sirius-ui/                    # Next.js frontend
│   ├── src/                     # React components and pages
│   ├── Dockerfile               # Multi-stage build (dev/prod)
│   ├── start-dev.sh            # Development startup script
│   └── start-prod.sh           # Production startup script
├── sirius-api/                  # Go REST API
│   ├── cmd/                    # API entry point
│   ├── internal/               # Internal API code
│   └── Dockerfile              # Multi-stage build (dev/runner)
├── sirius-engine/              # Multi-service engine
│   ├── cmd/                    # Engine entry point
│   ├── internal/               # Internal engine code
│   └── Dockerfile              # Multi-stage build (dev/runtime)
├── docker-compose.yaml         # Base configuration
├── docker-compose.dev.yaml     # Development overrides
├── docker-compose.prod.yaml    # Production overrides
└── scripts/
    └── switch-env.sh           # Environment switching script
```

## Docker Architecture

### Multi-Stage Builds

Each service uses multi-stage Dockerfiles to optimize for different environments:

**sirius-ui:**

- `development`: Full dev environment with hot reloading
- `production`: Optimized production build

**sirius-api:**

- `development`: Go development with live reloading
- `runner`: Pre-built Go binary for production

**sirius-engine:**

- `development`: Full development environment
- `runtime`: Production-optimized runtime

### Image Tagging Strategy

- **Development**: `sirius-sirius-ui:dev`
- **Production**: `sirius-sirius-ui:prod`
- **Base**: `sirius-sirius-ui:latest`

This prevents Docker cache conflicts when switching environments.

## CI/CD Integration

### Pre-commit Validation

**Purpose**: Fast validation to catch obvious issues before commit

**Duration**: ~30 seconds

**What's Tested**:

- Docker Compose configuration validation
- Documentation linting
- Basic syntax checks
- Code formatting

**Commands**:

```bash
# Pre-commit validation (automatic)
git commit  # Runs quick validation automatically

# Manual validation
cd testing/container-testing
make build-all          # Validate all Docker Compose configs
make lint-docs-quick    # Quick documentation checks
```

### CI/CD Pipeline

**Purpose**: Comprehensive testing of all changes

**Duration**: ~5-10 minutes

**What's Tested**:

- Docker container builds (all services)
- Service health checks
- Integration testing
- Cross-service communication
- Production build validation

**Triggers**:

- Pull requests to main branch
- Pushes to main branch
- Hotfix pushes

### Local Testing

**Purpose**: Manual testing during development

**Available Commands**:

```bash
# Full test suite
cd testing/container-testing
make test-all

# Individual tests
make test-build          # Test Docker builds
make test-health         # Test service health
make test-integration    # Test integration

# Quick validation
make build-all           # Validate configs
make lint-docs-quick     # Quick docs check
```

### Testing Strategy

| Scenario                | Pre-commit          | CI/CD           | Local Testing   |
| ----------------------- | ------------------- | --------------- | --------------- |
| **Feature Development** | ✅ Quick validation | ❌ No           | ✅ Full testing |
| **Pull Request**        | ✅ Quick validation | ✅ Full testing | ✅ Full testing |
| **Main Branch**         | ✅ Quick validation | ✅ Full testing | ✅ Full testing |
| **Documentation**       | ✅ Quick validation | ❌ No           | ✅ Full testing |

## Common Tasks

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs sirius-ui -f
docker compose logs sirius-api -f
docker compose logs sirius-engine -f
```

### Accessing Containers

```bash
# Open shell in container
docker compose exec sirius-ui sh
docker compose exec sirius-api sh
docker compose exec sirius-engine sh
```

### Restarting Services

```bash
# Restart specific service
docker compose restart sirius-ui

# Restart all services
docker compose restart
```

### Checking Service Health

```bash
# View container status
docker compose ps

# Check health endpoints
curl http://localhost:3000/api/health
curl http://localhost:9001/api/v1/health
curl http://localhost:5174/health
```

### Database Access

```bash
# Development (SQLite)
docker compose exec sirius-ui ls -la /app/dev.db

# Production (PostgreSQL)
docker compose exec sirius-postgres psql -U postgres -d sirius
```

## Troubleshooting

### Environment Switching Issues

**Problem**: Wrong environment running despite switching
**Solution**: The script automatically handles this, but if issues persist:

```bash
# Force clean rebuild
docker system prune -f
./scripts/switch-env.sh dev
```

### Hot Reloading Not Working

**Problem**: UI changes not appearing instantly
**Solution**: Ensure you're in development mode:

```bash
./scripts/switch-env.sh dev
# Check it's running: docker compose exec sirius-ui ps aux
```

### Services Not Starting

**Problem**: Containers failing to start
**Solution**: Check logs and restart:

```bash
docker compose logs sirius-ui
docker compose restart sirius-ui
```

### Port Conflicts

**Problem**: Port already in use
**Solution**: Stop conflicting services:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :9001

# Stop conflicting services
sudo kill -9 <PID>
```

### Database Connection Issues

**Problem**: API can't connect to database
**Solution**: Check database health:

```bash
# Check database status
docker compose ps sirius-postgres

# Check database logs
docker compose logs sirius-postgres

# Restart database
docker compose restart sirius-postgres
```

## Best Practices

### Development Workflow

1. **Always start with development mode** for new features
2. **Test in production mode** before committing
3. **Use hot reloading** for UI development
4. **Check logs regularly** to catch issues early
5. **Switch environments** to test different scenarios

### Code Organization

1. **Keep components focused** and single-purpose
2. **Use TypeScript** for better type safety
3. **Follow naming conventions** consistently
4. **Write tests** for critical functionality
5. **Document complex logic** with comments

### Docker Usage

1. **Use the switch script** instead of manual docker commands
2. **Don't edit Docker Compose files** directly unless necessary
3. **Clean up unused images** regularly
4. **Monitor resource usage** during development
5. **Test in multiple environments** before deploying

### Git Workflow

1. **Create feature branches** for new work
2. **Test thoroughly** before merging
3. **Write descriptive commit messages**
4. **Keep commits focused** and atomic
5. **Use pull requests** for code review

## Advanced Usage

### Custom Environment Variables

Create a `.env.local` file for custom environment variables:

```bash
# .env.local
NODE_ENV=development
API_URL=http://localhost:9001
DEBUG=true
```

### Volume Mounts for Live Development

For advanced development scenarios, you can mount local directories:

```bash
# Edit docker-compose.dev.yaml to add volume mounts
volumes:
  - ./sirius-ui/src:/app/src
  - ./sirius-api:/app
```

### Debugging

Enable debug mode for more verbose logging:

```bash
# Set debug environment variable
export DEBUG=true
./scripts/switch-env.sh dev
```

### Performance Testing

Use production mode for performance testing:

```bash
./scripts/switch-env.sh prod
# Run your performance tests
```

## Getting Help

### Documentation

- [Docker Architecture](README.docker-architecture.md) - Detailed Docker setup
- [Development Setup](README.development.md) - Legacy development guide
- [Container Testing](README.container-testing.md) - Testing procedures

### Common Issues

- Check the troubleshooting section above
- Review container logs for error messages
- Ensure all prerequisites are installed
- Verify Docker is running properly

### Support

- Create an issue on GitHub for bugs
- Use discussions for questions
- Check existing issues before creating new ones

---

_This guide follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](ABOUT.documentation.md)._
