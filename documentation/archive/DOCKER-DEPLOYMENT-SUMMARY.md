# Docker Deployment Quick Reference

**Status**: Post-Terminal Rework  
**Updated**: Current

## 🚀 TL;DR - Quick Commands

```bash
# End User (Clean, Simple)
docker compose -f docker-compose.user.yaml up -d

# Standard Development (Recommended)
docker compose up -d

# Extended Development (All Repositories)
# 1. Clone repos to ../minor-projects/
# 2. Edit docker-compose.override.yaml
# 3. docker compose up -d --build

# Production
./scripts/deploy.sh production v1.2.3

# Staging
./scripts/deploy.sh staging
```

## 📊 Deployment Mode Matrix

| Mode             | File                       | Use Case           | Volume Mounts | Performance |
| ---------------- | -------------------------- | ------------------ | ------------- | ----------- |
| **End User**     | `docker-compose.user.yaml` | Testing, Demo      | None          | 🟢 Fast     |
| **Standard Dev** | Default                    | UI/API Development | UI Source     | 🟡 Medium   |
| **Extended Dev** | Override Enabled           | Engine Development | All Repos     | 🔴 Slow     |
| **Staging**      | `staging.yaml`             | Pre-production     | None          | 🟢 Fast     |
| **Production**   | `production.yaml`          | Live Deployment    | None          | 🟢 Fast     |

## 🔧 Service Status Check

```bash
# Quick health check
docker compose ps

# Service logs
docker compose logs -f sirius-ui
docker compose logs -f sirius-engine

# Terminal functionality test
curl http://localhost:3000
# Then test: help, agents, status commands
```

## 📁 Repository Structure

```
📦 Your Development Setup
├── 🗂️ Sirius/                    # Main repo (required)
│   ├── sirius-ui/               # Frontend
│   ├── sirius-api/              # Backend
│   ├── sirius-engine/           # Engine
│   └── docker-compose.*.yaml   # All configs
└── 🗂️ minor-projects/            # Extended dev (optional)
    ├── go-api/                  # Shared library
    ├── app-scanner/             # Scanner modules
    ├── app-terminal/            # Terminal backend
    └── app-agent/               # Agent system
```

## ⚡ Quick Troubleshooting

```bash
# Reset everything (development)
docker compose down -v
docker system prune -f
docker compose up -d --build

# Check terminal rework features
docker compose exec sirius-postgres psql -U postgres -d sirius -c "SELECT COUNT(*) FROM agents;"

# Volume mount verification
docker compose exec sirius-engine ls -la /app-agent
```

## 🎯 Development Workflow

1. **Choose your mode** based on what you're developing
2. **Start services** with appropriate compose file
3. **Verify functionality** - especially terminal commands
4. **Enable repo mounts** only for active development
5. **Monitor resources** - extended mode uses more CPU/memory

## 🚨 Post-Terminal Rework Notes

- **Database Integration**: Terminal now uses real PostgreSQL data
- **New Dependencies**: `tsx` added for TypeScript execution
- **Enhanced Commands**: `help`, `agents`, `status` with rich formatting
- **Real-time Updates**: Agent data refreshes automatically

## 📝 Environment Variables

All compose files have sensible defaults. Override as needed:

```bash
# Production overrides
export POSTGRES_PASSWORD=secure-password
export NEXTAUTH_SECRET=your-secret-key
export NEXTAUTH_URL=https://yourdomain.com

# Staging overrides
export NEXTAUTH_URL=https://staging.yourdomain.com

# Check available variables
grep -E '\$\{.*:-.*\}' docker-compose.production.yaml
```

---

**For detailed instructions**: See [Developer Deployment Guide](./DEVELOPER-DEPLOYMENT-GUIDE.md)
