---
title: "Developer Quick Reference"
description: "Quick reference card for common development tasks and commands"
template: "TEMPLATE.reference"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["quick reference", "commands", "development", "docker"]
categories: ["reference", "development"]
difficulty: "beginner"
prerequisites: ["docker", "git"]
related_docs:
  - "README.developer-guide.md"
  - "README.development.md"
dependencies: []
llm_context: "medium"
search_keywords: ["quick reference", "commands", "cheat sheet", "development"]
---

# Developer Quick Reference

## Environment Switching

```bash
# Switch to development mode (hot reloading)
./scripts/switch-env.sh dev

# Switch to production mode (optimized builds)
./scripts/switch-env.sh prod

# Switch to base mode (standard config)
./scripts/switch-env.sh base
```

## Common Commands

### Container Management

```bash
# View container status
docker compose ps

# View logs
docker compose logs -f
docker compose logs sirius-ui -f
docker compose logs sirius-api -f
docker compose logs sirius-engine -f

# Restart services
docker compose restart
docker compose restart sirius-ui

# Stop all services
docker compose down
```

### Development Workflow

```bash
# Start development
./scripts/switch-env.sh dev

# Make changes to code
# UI changes appear instantly (hot reloading)
# API/Engine changes require restart

# Test production build
./scripts/switch-env.sh prod

# Switch back to development
./scripts/switch-env.sh dev
```

### Container Access

```bash
# Open shell in container
docker compose exec sirius-ui sh
docker compose exec sirius-api sh
docker compose exec sirius-engine sh

# Run commands in container
docker compose exec sirius-ui npm run build
docker compose exec sirius-api go run main.go
```

### Health Checks

```bash
# Check service health
curl http://localhost:3000/api/health
curl http://localhost:9001/api/v1/health
curl http://localhost:5174/health

# Check database
docker compose exec sirius-postgres pg_isready -U postgres
```

### Troubleshooting

```bash
# Clean Docker cache
docker system prune -f

# Force rebuild
./scripts/switch-env.sh dev

# Check what's running
docker compose exec sirius-ui ps aux

# View detailed logs
docker compose logs sirius-ui --tail=50
```

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| sirius-ui | 3000 | Web interface |
| sirius-api | 9001 | REST API |
| sirius-engine | 5174 | Engine interface |
| sirius-engine | 50051 | gRPC communication |
| sirius-postgres | 5432 | Database |
| sirius-valkey | 6379 | Cache |
| sirius-rabbitmq | 5672 | Message queue |
| sirius-rabbitmq | 15672 | Management UI |

## File Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| UI Source | `sirius-ui/src/` | React components and pages |
| API Source | `sirius-api/` | Go REST API code |
| Engine Source | `sirius-engine/` | Multi-service engine code |
| Docker Config | `docker-compose*.yaml` | Environment configurations |
| Switch Script | `scripts/switch-env.sh` | Environment switching |

## Environment Differences

| Feature | Development | Production |
|---------|-------------|------------|
| UI Server | `npm run dev` | `npm start` |
| Database | SQLite | PostgreSQL |
| Hot Reloading | ✅ Yes | ❌ No |
| Volume Mounts | ✅ Yes | ❌ No |
| Debug Logging | ✅ Yes | ❌ No |
| Optimizations | ❌ No | ✅ Yes |

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Wrong environment running | `./scripts/switch-env.sh dev` |
| Hot reloading not working | Check you're in dev mode |
| Services not starting | Check logs: `docker compose logs` |
| Port conflicts | `lsof -i :3000` then kill process |
| Database issues | `docker compose restart sirius-postgres` |
| Cache issues | `docker system prune -f` |

---

_For detailed information, see [README.developer-guide.md](README.developer-guide.md)._
