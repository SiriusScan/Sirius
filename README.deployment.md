# Sirius Scan Deployment Guide

## Quick Start

### Development (Local)

```bash
# Current method (still works)
docker compose up --build

# New method (equivalent)
./scripts/deploy.sh development
```

### Staging Deployment

```bash
# Deploy latest images to staging
./scripts/deploy.sh staging

# Deploy specific version to staging
./scripts/deploy.sh staging v1.2.3
```

### Production Deployment

```bash
# Deploy specific version to production
./scripts/deploy.sh production v1.2.3
```

## Environment Files

Create environment-specific configuration files:

```bash
# Copy template and customize
cp environments/.env.example environments/.env.staging
cp environments/.env.example environments/.env.production

# Edit with your specific values
nano environments/.env.staging
nano environments/.env.production
```

## Key Benefits

✅ **No Manual File Changes**: No more editing docker-compose.yaml for different environments

✅ **Environment Isolation**: Separate configurations for dev/staging/production

✅ **Version Control**: Deploy specific image versions with confidence

✅ **Automated CI/CD**: GitHub Actions automatically deploy to staging on main branch pushes

✅ **Security**: Proper secrets management for production

## File Structure

```
Sirius/
├── docker-compose.yaml              # Base configuration
├── docker-compose.override.yaml     # Development (auto-loaded)
├── docker-compose.staging.yaml      # Staging environment
├── docker-compose.production.yaml   # Production environment
├── environments/
│   ├── .env.example                 # Template
│   ├── .env.staging                 # Staging config
│   └── .env.production              # Production config
└── scripts/
    └── deploy.sh                    # Deployment script
```

## GitHub Actions

### Automatic Staging Deployment

- Pushes to `main` branch automatically deploy to staging
- Images are tagged with `main-YYYYMMDD-{commit}`

### Manual Production Deployment

1. Go to GitHub Actions
2. Select "Deploy to Environment"
3. Choose environment and image tag
4. Click "Run workflow"

## Migration from Current Setup

1. **No immediate changes needed** - current `docker compose up --build` still works
2. **Gradually adopt** - start using `./scripts/deploy.sh development`
3. **Set up staging/production** when ready

## Troubleshooting

### Common Issues

**Script not executable:**

```bash
chmod +x scripts/deploy.sh
```

**Missing environment file:**

```bash
cp environments/.env.example environments/.env.staging
# Edit the file with your values
```

**Docker not running:**

```bash
# Start Docker Desktop or Docker daemon
sudo systemctl start docker  # Linux
```

### Getting Help

```bash
# Show deployment script help
./scripts/deploy.sh help

# Check service status
docker compose ps

# View logs
docker compose logs -f [service_name]
```

## Next Steps

1. **Try the new deployment script** with development environment
2. **Create staging environment** configuration
3. **Set up production environment** when ready
4. **Configure GitHub Actions secrets** for automated deployments

For detailed information, see: [documentation/README.deployment-strategy.md](documentation/README.deployment-strategy.md)
