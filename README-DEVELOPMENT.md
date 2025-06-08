# Sirius Development Setup

## Quick Start

```bash
# Standard development (uses built-in repositories)
./scripts/dev-setup.sh start

# Extended development (with local repository mounts)
./scripts/dev-setup.sh init           # Create local overrides
./scripts/dev-setup.sh start-extended # Start with local mounts
```

## Development Modes

### 🎯 Standard Development

**Best for: UI/API development, testing, most development tasks**

```bash
./scripts/dev-setup.sh start
```

- Uses built-in repositories from Docker images
- No local repository setup required
- All services start with `go run` in development mode
- Live reloading for UI changes

### 🔧 Extended Development

**Best for: Working on scanner, terminal, or agent code**

```bash
# 1. Set up local repositories (one-time)
mkdir -p ../minor-projects && cd ../minor-projects
git clone https://github.com/SiriusScan/app-scanner.git
git clone https://github.com/SiriusScan/app-terminal.git
git clone https://github.com/SiriusScan/app-agent.git
cd ../Sirius

# 2. Initialize local overrides
./scripts/dev-setup.sh init

# 3. Edit docker-compose.local.yaml (uncomment what you need)
nano docker-compose.local.yaml

# 4. Start extended development
./scripts/dev-setup.sh start-extended
```

## File Structure

```
Sirius/
├── docker-compose.yaml                 # Base configuration
├── docker-compose.override.yaml        # 🔒 Committed: Safe development defaults
├── docker-compose.local.example.yaml   # 🔒 Committed: Template for local overrides
├── docker-compose.local.yaml           # 🚫 Git-ignored: Your personal overrides
└── scripts/dev-setup.sh               # 🔒 Committed: Development helper
```

## Safety Features

### 🛡️ Prevents Accidental Commits

- `docker-compose.local.yaml` is git-ignored
- CI/CD validates that volume mounts stay commented in `docker-compose.override.yaml`
- Pre-commit hook auto-fixes uncommented volume mounts

### 🔧 Developer-Friendly

- Easy setup with `./scripts/dev-setup.sh init`
- Template file shows all available options
- Helper script for common development tasks

## Available Commands

```bash
./scripts/dev-setup.sh init              # Create local overrides from template
./scripts/dev-setup.sh start             # Standard development mode
./scripts/dev-setup.sh start-extended    # Extended development with local repos
./scripts/dev-setup.sh stop              # Stop all services
./scripts/dev-setup.sh status            # Show container status
./scripts/dev-setup.sh logs [service]    # Show logs
./scripts/dev-setup.sh shell <service>   # Open shell in container
./scripts/dev-setup.sh clean             # Clean containers and volumes
```

## Troubleshooting

### Volume Mounts Not Working

```bash
# Check if local file exists
ls -la docker-compose.local.yaml

# Check if repositories exist
ls -la ../minor-projects/

# Verify you're using start-extended
./scripts/dev-setup.sh start-extended
```

### Git Commits Being Rejected

Your CI/CD is preventing commits with uncommented volume mounts:

```bash
# Fix automatically
git add docker-compose.override.yaml
git commit  # Pre-commit hook will fix and re-stage

# Or fix manually - comment out volume mounts with #
nano docker-compose.override.yaml
```

### Services Not Starting

```bash
# Check container status
./scripts/dev-setup.sh status

# View logs for specific service
./scripts/dev-setup.sh logs sirius-engine

# Restart clean
./scripts/dev-setup.sh stop
./scripts/dev-setup.sh clean
./scripts/dev-setup.sh start
```

## Best Practices

1. **Use standard mode** for most development work
2. **Only use extended mode** when working on engine/scanner/terminal/agent code
3. **Never commit** `docker-compose.local.yaml`
4. **Always test** your changes work in standard mode before committing
5. **Keep local overrides minimal** - only uncomment what you're actively developing

## Migration from Old Setup

If you were previously editing `docker-compose.override.yaml` directly:

```bash
# 1. Reset override file to clean state
git checkout docker-compose.override.yaml

# 2. Set up new local overrides
./scripts/dev-setup.sh init

# 3. Move your customizations to docker-compose.local.yaml
nano docker-compose.local.yaml

# 4. Start with new system
./scripts/dev-setup.sh start-extended
```

## CI/CD Integration

The repository includes automatic validation:

- **GitHub Actions**: Validates docker-compose files on PRs
- **Pre-commit Hook**: Auto-fixes volume mount issues
- **Git Ignore**: Prevents local files from being committed

This ensures the repository stays clean and deployments are predictable.
