---
title: "Docker Container Deployment Guide"
description: "Complete guide for deploying Sirius using prebuilt container images from GitHub Container Registry"
template: "TEMPLATE.guide"
version: "1.0.0"
last_updated: "2026-04-08"
author: "Development Team"
tags: ["docker", "deployment", "containers", "ghcr", "registry", "production"]
categories: ["deployment", "infrastructure"]
difficulty: "beginner"
prerequisites: ["docker", "docker-compose"]
related_docs:
  - "README.terraform-deployment.md"
  - "README.development.md"
  - "README.docker-architecture.md"
dependencies: ["docker-compose.yaml"]
llm_context: "high"
search_keywords:
  [
    "docker",
    "deployment",
    "containers",
    "ghcr",
    "registry",
    "production",
    "images",
    "compose",
  ]
---

# Docker Container Deployment Guide

## Purpose

This guide explains how to deploy Sirius using prebuilt container images from GitHub Container Registry (GHCR). This approach provides faster deployments (5-8 minutes vs 20-25 minutes) by eliminating on-instance Docker builds. The guide covers production deployments, image versioning, and fallback strategies.

## When to Use

- **Production deployments** - Deploying Sirius to production environments
- **Demo environments** - Setting up demo instances quickly
- **Staging environments** - Creating isolated testing environments
- **Quick deployments** - When you need fast deployment without building from source
- **CI/CD pipelines** - Automated deployments using prebuilt images

**Avoid when**:

- **Local development** - Use `docker-compose.dev.yaml` for local builds with hot reloading
- **Custom modifications** - When you need to modify source code before deployment
- **Offline environments** - When registry access is unavailable

## How to Use

### Quick Start

```bash
# Clone repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Generate startup config and secrets
docker compose -f docker-compose.installer.yaml run --rm sirius-installer

# Deploy with prebuilt images (default)
docker compose up -d

# Or specify a version tag
IMAGE_TAG=v0.4.1 docker compose up -d

# Optional: verify the public GHCR contract before pulling
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG:-latest}"
```

### Prerequisites

- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **Internet access** to GitHub Container Registry (ghcr.io)
- **Git** (for cloning repository)

## Container Registry Integration

### GitHub Container Registry (GHCR)

Sirius images are automatically built and pushed to GitHub Container Registry on every push to the main branch. Images are available at:

- **UI**: `ghcr.io/siriusscan/sirius-ui:{tag}`
- **API**: `ghcr.io/siriusscan/sirius-api:{tag}`
- **Engine**: `ghcr.io/siriusscan/sirius-engine:{tag}`
- **Postgres**: `ghcr.io/siriusscan/sirius-postgres:{tag}`
- **RabbitMQ**: `ghcr.io/siriusscan/sirius-rabbitmq:{tag}`
- **Valkey**: `ghcr.io/siriusscan/sirius-valkey:{tag}`

`docker-compose.yaml` is the public-image deployment path for Sirius. If an unauthenticated `docker pull` against one of the image refs above returns `unauthorized`, the GHCR public-visibility contract is broken and operators should stop before rollout.

### Image Tagging Strategy

Images are tagged with the following strategy:

| Tag      | Description              | When Created            |
| -------- | ------------------------ | ----------------------- |
| `latest` | Latest main branch build | On every push to main   |
| `beta`   | Beta release candidate   | On main branch pushes   |
| `v0.4.1` | Version-specific tag     | After the `Publish Release Image Tags` workflow succeeds |
| `dev`    | Development builds       | On other branch pushes  |
| `pr-123` | Pull request builds      | On PR creation/updates  |

### Image Availability

- **Public images**: No authentication required
- **Multi-architecture**: Images support `linux/amd64` and `linux/arm64`
- **Automatic updates**: Latest images are built automatically by CI/CD
- **Release contract**: A release tag is only valid for operators after the release-tag workflow publishes it, the anonymous GHCR verification step passes, and the public Compose smoke test succeeds. CI validates **`latest`** on every main push (`public-stack-contract` in `ci.yml`); **semver** tags are additionally checked when a GitHub Release is published and on a weekly schedule ([`verify-ghcr-release-tag.yml`](../../../.github/workflows/verify-ghcr-release-tag.yml)).

## Docker Compose Configuration

### Base Configuration (Production)

The default `docker-compose.yaml` uses prebuilt images:

```yaml
services:
  sirius-ui:
    image: ghcr.io/siriusscan/sirius-ui:${IMAGE_TAG:-latest}
    pull_policy: always
    # ... other configuration

  sirius-api:
    image: ghcr.io/siriusscan/sirius-api:${IMAGE_TAG:-latest}
    pull_policy: always
    # ... other configuration

  sirius-engine:
    image: ghcr.io/siriusscan/sirius-engine:${IMAGE_TAG:-latest}
    pull_policy: always
    # ... other configuration
```

### Environment Variables

Control which images to use with the `IMAGE_TAG` environment variable:

```bash
# Use latest images (default)
docker compose up -d

# Use specific version
IMAGE_TAG=v0.4.1 docker compose up -d

# Use beta release
IMAGE_TAG=beta docker compose up -d

# Validate that the selected tag is publicly readable before rollout
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG:-latest}"
```

`.env.production.example` leaves `IMAGE_TAG` blank so fresh installer runs inherit the Compose default (`latest`). Pin a release tag only after the publish workflow has validated that all six Sirius images exist for that tag.

### Development Override

For local development with source code changes, use the development override:

```bash
# Build locally with hot reloading
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d --build
```

The `docker-compose.dev.yaml` file overrides the registry images with local builds, enabling:

- Hot reloading
- Volume mounts for source code
- Development-specific environment variables
- Debug logging

## Deployment Workflow

### Standard Production Deployment

1. **Clone repository**:

   ```bash
   git clone https://github.com/SiriusScan/Sirius.git
   cd Sirius
   ```

2. **Configure environment**:

   ```bash
   docker compose -f docker-compose.installer.yaml run --rm sirius-installer
   # Optional: pass explicit values
   # docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets
   ```

3. **Deploy services**:

   ```bash
   docker compose up -d
   ```

4. **Verify deployment**:

   ```bash
   docker compose ps
   docker compose logs -f
   ```

5. **Check health**:
   ```bash
   curl http://localhost:9001/health  # API
   curl http://localhost:3000/api/health  # UI
   ```

### Maintainer Validation Path

Use the shared validation script to exercise the same public Compose path that operators use:

```bash
# Validate the default public stack (latest)
bash scripts/validate-public-compose-path.sh latest

# Validate a published release tag
bash scripts/validate-public-compose-path.sh v0.4.1
```

### Version-Specific Deployment

Deploy a specific version:

```bash
# Set version tag
export IMAGE_TAG=v0.4.1

# Confirm the compose-rendered GHCR images are public and readable
bash scripts/verify-ghcr-public-access.sh "$IMAGE_TAG"

# Pull and start services
docker compose pull
docker compose up -d
```

### Updating Deployment

To update to the latest version:

```bash
# Pull latest images
docker compose pull

# Restart services with new images
docker compose up -d
```

## Fallback Strategy

### When Registry is Unavailable

If GitHub Container Registry is unavailable or images fail to pull, you can fall back to local builds:

1. **Use the committed source-build override**:

   ```bash
   docker compose -f docker-compose.yaml -f docker-compose.build.yaml up -d --build
   ```

**Note**: Local builds take significantly longer (20-25 minutes vs 5-8 minutes) and require more system resources.

## Secrets Hardening Overlays

For hardened deployments, Sirius includes optional overlay manifests:

- `docker-compose.secrets.yaml` for Compose secrets mounted at `/run/secrets/*`
- `docker-stack.swarm.yaml` for Swarm stack deployments

Example:

```bash
mkdir -p secrets
printf '%s' "your-postgres-password" > secrets/postgres_password.txt
printf '%s' "your-service-key" > secrets/sirius_api_key.txt
chmod 644 secrets/sirius_api_key.txt
printf '%s' "your-nextauth-secret" > secrets/nextauth_secret.txt
printf '%s' "your-admin-password" > secrets/initial_admin_password.txt

docker compose -f docker-compose.yaml -f docker-compose.secrets.yaml up -d
```

`sirius_api_key.txt` should stay **world-readable** (`644`) so bind-mounted `/run/secrets/sirius_api_key` is readable inside **sirius-api** / **sirius-ui** / **sirius-engine** (non-root UIDs).

## Troubleshooting

### Images Not Pulling

**Problem**: `docker compose pull` fails with authentication or network errors.

**Solutions**:

- Verify internet connectivity: `curl -I https://ghcr.io`
- Check image exists: Visit `https://github.com/SiriusScan/Sirius/pkgs/container/sirius-ui`
- Try pulling manually: `docker pull ghcr.io/siriusscan/sirius-ui:latest`
- Run the contract check: `bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG:-latest}"`
- If the script reports `Anonymous access denied`, the package is not publicly readable and the GHCR visibility workflow or token scope needs attention
- If the script reports `Manifest missing`, the requested tag was not published and you should verify the release-tag workflow completed successfully
- If the public Compose smoke test fails after pull succeeds, run `bash scripts/validate-public-compose-path.sh "${IMAGE_TAG:-latest}"` to reproduce the operator path and inspect the runtime contract failure
- Use fallback build strategy (see above)

### Wrong Version Deployed

**Problem**: Services are running an unexpected version.

**Solutions**:

- Check current IMAGE_TAG: `echo $IMAGE_TAG`
- Verify image tags: `docker compose images`
- Pull specific version: `IMAGE_TAG=v0.4.1 docker compose pull`
- Restart services: `docker compose up -d`

### Services Not Starting

**Problem**: Containers fail to start after pulling images.

**Solutions**:

- Check logs: `docker compose logs`
- Verify environment variables: `docker compose config`
- Check image compatibility: Ensure architecture matches (amd64/arm64)
- Verify dependencies: Ensure PostgreSQL, RabbitMQ, Valkey are running

### Performance Issues

**Problem**: Deployment is slower than expected.

**Solutions**:

- Check network speed: `docker pull` should be fast on good connections
- Verify image sizes: Large images take longer to pull
- Use specific version tags instead of `latest` for faster pulls
- Consider using image caching strategies

## Best Practices

### Security

- **Use specific version tags** in production (e.g., `v0.4.1`) instead of `latest`
- **Regularly update images** to get security patches
- **Scan images** for vulnerabilities using Docker security scanning
- **Use private registries** for sensitive deployments (if needed)

### Version Management

- **Pin versions** in production environments
- **Test updates** in staging before production
- **Document versions** deployed in each environment
- **Use semantic versioning** for releases

### Performance

- **Pre-pull images** before deployment to reduce startup time
- **Use image caching** to avoid redundant pulls
- **Monitor image sizes** and optimize Dockerfiles if needed
- **Use multi-stage builds** to reduce final image sizes

### Monitoring

- **Track deployment times** to measure improvements
- **Monitor registry availability** and fallback usage
- **Log image versions** deployed for audit trails
- **Alert on deployment failures** for quick response

## Comparison: Registry vs Local Builds

| Aspect                | Registry Images   | Local Builds         |
| --------------------- | ----------------- | -------------------- |
| **Deployment Time**   | 5-8 minutes       | 20-25 minutes        |
| **Resource Usage**    | Low (pull only)   | High (compilation)   |
| **Network Required**  | Yes (for pull)    | No (after clone)     |
| **Customization**     | Limited           | Full                 |
| **CI/CD Integration** | Automatic         | Manual               |
| **Best For**          | Production, demos | Development, offline |

## Integration with CI/CD

### GitHub Actions

Images are automatically built and pushed by GitHub Actions on:

- Push to `main` branch → `latest` and `beta` tags
- Manual `Publish Release Image Tags` run → version-specific tag (e.g., `v0.4.1`)
- Pull requests → `pr-{number}` tags

### Deployment Automation

Example GitHub Actions workflow for deployment:

```yaml
name: Deploy Sirius
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy with registry images
        run: |
          docker compose pull
          docker compose up -d
```

## Related Documentation

- [Terraform Deployment Guide](README.terraform-deployment.md) - AWS deployment using Terraform
- [Development Guide](../README.development.md) - Local development setup
- [Docker Architecture Guide](../architecture/README.docker-architecture.md) - Container architecture details

## Support

For issues with container deployment:

1. Check the troubleshooting section above
2. Review Docker logs: `docker compose logs`
3. Verify image availability on GitHub Container Registry
4. Create an issue in the Sirius repository

---

_This guide follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
