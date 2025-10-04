# Sirius Developer Deployment Guide

**Status**: Updated for Terminal Rework Integration  
**Version**: 2.0  
**Last Updated**: Current

## 🎯 Overview

This guide provides comprehensive instructions for developers working on Sirius in different environments. After the terminal rework project, our Docker setup supports multiple deployment modes with flexible volume mounting for local development.

## 📋 Prerequisites

- Docker Engine 20.10.0+
- Docker Compose V2
- 4GB RAM minimum (8GB recommended for development)
- 10GB free disk space (20GB for full development setup)
- Git 2.0+

## 🚀 Quick Reference

| Use Case                  | Command                                            | Description                                  |
| ------------------------- | -------------------------------------------------- | -------------------------------------------- |
| **End User**              | `docker compose -f docker-compose.user.yaml up -d` | Clean production-like experience             |
| **Standard Development**  | `./scripts/dev-setup.sh start`                     | Default development with automatic overrides |
| **Extended Development**  | `./scripts/dev-setup.sh start-extended`            | Development with local repository mounts     |
| **Setup Local Overrides** | `./scripts/dev-setup.sh init`                      | Create git-ignored local configuration       |
| **Staging Deployment**    | `./scripts/deploy.sh staging`                      | Deploy to staging environment                |
| **Production Deployment** | `./scripts/deploy.sh production v1.2.3`            | Deploy specific version to production        |

## 🏗️ Deployment Modes

### 1. End User Mode (Recommended for Testing)

**Purpose**: Clean, production-like environment without development complexity

```bash
# Clone and start
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Use simplified configuration
docker compose -f docker-compose.user.yaml up -d

# Access application
open http://localhost:3000
```

**What happens:**

- Uses built-in repositories from Docker images
- No volume mounts
- Health checks enabled
- Optimized for stability

### 2. Standard Development Mode (Default)

**Purpose**: Development with automatic file watching and live reload

```bash
# Clone and start
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Standard development start
docker compose up -d

# View logs
docker compose logs -f
```

**What happens:**

- `docker-compose.override.yaml` automatically loaded
- Source code mounted for live reloading
- Development environment variables
- Debug logging enabled

### 3. Extended Development Mode

**Purpose**: Full development access to selected repositories with local volume mounts

```bash
# 1. Set up repository structure (optional)
mkdir -p ../minor-projects
cd ../minor-projects

# 2. Clone repositories you want to develop on
git clone https://github.com/SiriusScan/go-api.git
git clone https://github.com/SiriusScan/app-scanner.git
git clone https://github.com/SiriusScan/app-terminal.git
git clone https://github.com/SiriusScan/app-agent.git

# 3. Return to main directory
cd ../Sirius

# 4. Set up local development overrides
./scripts/dev-setup.sh init

# 5. Edit docker-compose.local.yaml to enable desired repositories
nano docker-compose.local.yaml

# 6. Start with extended development setup
./scripts/dev-setup.sh start-extended
```

**What happens:**

- Uses `docker-compose.local.yaml` (git-ignored) for local repository mounts
- Live code changes reflected immediately in mounted repositories
- Original `docker-compose.override.yaml` remains clean for commits
- Full development environment with all tools

### 4. Local Development Configuration

**Purpose**: Safe local customization without affecting the repository

The new local override system prevents accidental commits of development configuration:

- `docker-compose.override.yaml` - **Committed to Git**: Contains safe defaults with commented examples
- `docker-compose.local.yaml` - **Git-ignored**: Your personal development overrides
- `docker-compose.local.example.yaml` - **Committed to Git**: Template for creating local overrides

**Setting up local overrides:**

```bash
# Initialize local development configuration
./scripts/dev-setup.sh init

# Edit your local overrides (this file is git-ignored)
nano docker-compose.local.yaml

# Uncomment the repositories you want to mount locally
# Example:
# services:
#   sirius-engine:
#     volumes:
#       - ../minor-projects/app-agent:/app-agent
#       - ../minor-projects/app-scanner:/app-scanner

# Start with your local overrides
./scripts/dev-setup.sh start-extended
```

**Benefits:**

- ✅ Never accidentally commit local development configuration
- ✅ Each developer can have different local setups
- ✅ Clean repository with predictable CI/CD
- ✅ Easy onboarding with helper scripts

## 📂 Repository Structure

### Current Structure

```
Sirius/                           # Main UI and orchestration
├── sirius-ui/                   # Frontend (Next.js/React)
├── sirius-api/                  # Backend API (Go)
├── sirius-engine/               # Scanning engine (Go)
├── docker-compose.yaml          # Base configuration
├── docker-compose.override.yaml # Development overrides
├── docker-compose.user.yaml     # Simplified user setup
├── docker-compose.staging.yaml  # Staging configuration
└── docker-compose.production.yaml # Production configuration
```

### Extended Development Structure

```
Projects/
├── Sirius/                      # Main repository
└── minor-projects/              # Additional repositories (optional)
    ├── go-api/                  # Shared Go API library
    ├── app-scanner/             # Scanning modules
    ├── app-terminal/            # Terminal backend
    └── app-agent/               # Agent communication
```

## 🔧 Service Architecture

| Service             | Purpose            | Port(s)     | Volume Mounts               |
| ------------------- | ------------------ | ----------- | --------------------------- |
| **sirius-ui**       | Frontend interface | 3000        | Source code in dev mode     |
| **sirius-api**      | Backend API        | 9001        | Source code in dev mode     |
| **sirius-engine**   | Scanning engine    | 5174, 50051 | Multiple repo mounts in dev |
| **sirius-postgres** | Database           | 5432        | Data persistence            |
| **sirius-rabbitmq** | Message queue      | 5672, 15672 | Configuration               |
| **sirius-valkey**   | Key-value store    | 6379        | Data persistence            |

## 📄 Configuration Files Deep Dive

### docker-compose.yaml (Base Configuration)

- Production-ready defaults
- Environment variables with fallbacks
- Resource limits and health checks
- Used by all deployment modes

### docker-compose.override.yaml (Development)

Automatically loaded in development mode, provides:

```yaml
services:
  sirius-ui:
    target: development # Use development Docker stage
    volumes:
      - ./sirius-ui/src:/app/src # Live source code
      - ./sirius-ui/public:/app/public # Static assets
      - node_modules:/app/node_modules # Preserve container modules
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1

  sirius-engine:
    volumes:
      # Optional: Uncomment repositories you want to develop
      - ../minor-projects/app-agent:/app-agent
      - ../minor-projects/app-scanner:/app-scanner
      - ../minor-projects/app-terminal:/app-terminal
```

### docker-compose.user.yaml (Simplified)

Clean configuration for end users:

- No development complexity
- Built-in repositories only
- Health checks enabled
- Optimized for stability

## 🛠️ Development Workflow

### Starting Development Session

1. **Check Current Status**

   ```bash
   docker compose ps
   docker compose logs -f sirius-ui
   ```

2. **Choose Your Development Level**

   - **UI Only**: Standard mode is sufficient
   - **Backend API**: Standard mode is sufficient
   - **Engine/Scanner**: Consider extended mode

3. **Enable Repository Mounts** (if needed)

   ```bash
   # Edit override file
   nano docker-compose.override.yaml

   # Uncomment desired volume mounts
   # - ../minor-projects/app-scanner:/app-scanner

   # Restart to apply changes
   docker compose down
   docker compose up -d --build
   ```

### Working with Terminal Features

After the terminal rework, several new components require special attention:

#### Key Files Modified

- `sirius-ui/src/components/DynamicTerminal.tsx` - Main terminal interface
- `sirius-ui/src/components/agent/AgentCard.tsx` - Agent display cards
- `sirius-ui/src/server/api/routers/agent.ts` - Agent data integration

#### Development Dependencies

The terminal rework added `tsx` for TypeScript execution:

```json
{
  "devDependencies": {
    "tsx": "^4.19.4"
  }
}
```

#### Database Integration

Terminal now uses real PostgreSQL data:

- Agent information from database
- Real-time status updates
- Enhanced command responses

### Live Development Features

| Component           | Live Reload | Notes                   |
| ------------------- | ----------- | ----------------------- |
| **UI Changes**      | ✅ Instant  | Hot reload with Next.js |
| **API Changes**     | ✅ Fast     | Go air tool rebuilds    |
| **Engine Changes**  | ✅ Fast     | Go air tool rebuilds    |
| **Database Schema** | 🔄 Manual   | Requires migration      |

## 🚢 Production Deployment

### Staging Deployment

```bash
# Deploy latest to staging
./scripts/deploy.sh staging

# Deploy specific version
./scripts/deploy.sh staging v1.2.3

# Check status
docker compose -f docker-compose.yaml -f docker-compose.staging.yaml ps
```

### Production Deployment

```bash
# Deploy specific version (required)
./scripts/deploy.sh production v1.2.3

# Check deployment
docker compose -f docker-compose.yaml -f docker-compose.production.yaml ps
```

### Environment Configuration

No separate environment files needed! All environments use sensible defaults:

```bash
# Production with defaults
./scripts/deploy.sh production v1.2.3

# Override specific variables
export POSTGRES_PASSWORD=secure-production-password
export NEXTAUTH_SECRET=your-production-secret
./scripts/deploy.sh production v1.2.3

# Check what variables you can override
grep -E '\$\{.*:-.*\}' docker-compose.production.yaml
```

## 🐛 Troubleshooting

### Common Issues After Terminal Rework

#### 1. Terminal Commands Not Working

```bash
# Check UI container logs
docker compose logs -f sirius-ui

# Verify database connection
docker compose exec sirius-postgres psql -U postgres -d sirius -c "\dt"

# Check agent data
docker compose exec sirius-postgres psql -U postgres -d sirius -c "SELECT * FROM agents LIMIT 5;"
```

#### 2. Volume Mount Issues

```bash
# Check what's mounted
docker compose exec sirius-engine ls -la /app-agent
docker compose exec sirius-engine ls -la /app-scanner

# Verify mount points
docker inspect sirius-engine | grep -A 10 "Mounts"
```

#### 3. Build Failures

```bash
# Clean rebuild
docker compose down -v
docker system prune -f
docker compose up -d --build --force-recreate

# Check build logs
docker compose logs sirius-ui
docker compose logs sirius-engine
```

#### 4. Database Connection Issues

```bash
# Check database status
docker compose exec sirius-postgres pg_isready -U postgres

# Reset database (development only)
docker compose down
docker volume rm sirius_postgres_data
docker compose up -d
```

### Performance Optimization

#### Development Performance

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Prune unused images
docker image prune -f

# Monitor resource usage
docker stats
```

#### Memory Management

```bash
# Check container memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Adjust memory limits in compose files if needed
```

## 📊 Monitoring and Logs

### Log Access

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f sirius-ui

# Last 100 lines
docker compose logs --tail=100 sirius-engine

# Follow logs with timestamps
docker compose logs -f -t sirius-api
```

### Health Checks

```bash
# Check service health
docker compose ps

# Manual health checks
curl http://localhost:3000/api/health
curl http://localhost:9001/health
curl http://localhost:5174/health
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Network inspection
docker network ls
docker network inspect sirius
```

## 🔄 Migration Guide

### From Previous Setup

If you're upgrading from an older setup:

1. **Backup Data**

   ```bash
   docker compose exec sirius-postgres pg_dump -U postgres sirius > backup.sql
   ```

2. **Update Configuration**

   ```bash
   git pull origin main
   docker compose down
   docker compose up -d --build
   ```

3. **Verify Terminal Features**
   - Access http://localhost:3000
   - Test terminal commands: `help`, `agents`, `status`
   - Verify agent data appears correctly

### Breaking Changes

- **Terminal Interface**: Complete rework requires browser refresh
- **Database Schema**: New agent tables and relationships
- **API Endpoints**: Enhanced agent data endpoints

## 📝 Best Practices

### Development

- Use standard mode for UI/API development
- Only enable repository mounts for components you're actively developing
- Regularly pull latest changes from dependent repositories
- Monitor container resource usage during development

### Deployment

- Always use specific version tags for production
- Test in staging before production deployment
- Keep environment files secure and version controlled separately
- Monitor logs during and after deployment

### Maintenance

- Regularly update base images
- Prune unused Docker resources
- Backup database before major updates
- Document any custom configuration changes

---

## 🚀 Getting Started Checklist

- [ ] Clone main repository
- [ ] Choose deployment mode based on development needs
- [ ] Start with `docker compose up -d` for standard development
- [ ] Access web interface at http://localhost:3000
- [ ] Test terminal functionality (`help`, `agents`, `status`)
- [ ] Enable additional repository mounts if needed
- [ ] Set up staging/production environments when ready

For additional help, see:

- [Main README](../README.md)
- [Deployment Strategy](./README.deployment-strategy.md)
- [Terminal Rework Handoff](./dev-notes/TERMINAL-REWORK-HANDOFF.md)
