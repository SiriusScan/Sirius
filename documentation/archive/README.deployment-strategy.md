# Sirius Scan Production Deployment Strategy

## Overview

This document outlines the recommended approach for managing multiple environments (development, staging, production) without manual file modifications.

## 🎯 Goals

- **Zero Manual Changes**: No file modifications required for different environments
- **Environment Parity**: Consistent configuration across all environments
- **Security**: Proper secrets management for production
- **Scalability**: Easy to add new environments
- **Developer Experience**: Simple local development setup

## 🏗️ Architecture: Multi-Environment Configuration

### 1. Docker Compose Override Pattern

Instead of modifying `docker-compose.yaml`, we use Docker Compose's built-in override system:

```
docker-compose.yaml              # Base configuration (shared)
docker-compose.override.yaml     # Local development (auto-loaded)
docker-compose.staging.yaml      # Staging environment
docker-compose.production.yaml   # Production environment
```

### 2. Environment Variable Management

#### Current State

- Hardcoded values in `docker-compose.yaml`
- Manual `.env` file management
- No centralized configuration

#### Recommended State

```
environments/
├── .env.development     # Local development
├── .env.staging        # Staging environment
├── .env.production     # Production environment
└── .env.example        # Template for new environments
```

### 3. Deployment Commands

#### Development (Current)

```bash
docker compose up --build
```

#### Staging

```bash
docker compose -f docker-compose.yaml -f docker-compose.staging.yaml --env-file environments/.env.staging up -d
```

#### Production

```bash
docker compose -f docker-compose.yaml -f docker-compose.production.yaml --env-file environments/.env.production up -d
```

## 🔧 Implementation Plan

### Phase 1: Environment Separation

1. **Create Environment-Specific Compose Files**

   ```yaml
   # docker-compose.production.yaml
   version: "3.8"
   services:
     sirius-ui:
       image: ghcr.io/siriusscan/sirius-ui:${IMAGE_TAG:-latest}
       build: null # Disable build, use pre-built images
       volumes: [] # Remove development volume mounts
       environment:
         - NODE_ENV=production
         - SKIP_ENV_VALIDATION=0

     sirius-api:
       image: ghcr.io/siriusscan/sirius-api:${IMAGE_TAG:-latest}
       build: null
       volumes: []

     sirius-engine:
       image: ghcr.io/siriusscan/sirius-engine:${IMAGE_TAG:-latest}
       build: null
       volumes: []
   ```

2. **Environment Variable Templates**

   ```bash
   # environments/.env.production
   # Database Configuration
   POSTGRES_USER=sirius_prod
   POSTGRES_PASSWORD=${POSTGRES_PASSWORD}  # From secrets
   POSTGRES_DB=sirius_production

   # Image Tags
   IMAGE_TAG=v1.2.3

   # API Configuration
   NODE_ENV=production
   GO_ENV=production

   # External Services
   SIRIUS_API_URL=https://api.sirius.company.com
   NEXT_PUBLIC_SIRIUS_API_URL=https://api.sirius.company.com
   ```

### Phase 2: Secrets Management

#### Option A: Docker Secrets (Recommended for Docker Swarm)

```yaml
# docker-compose.production.yaml
services:
  sirius-postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    external: true
```

#### Option B: External Secret Management

- **HashiCorp Vault**: Enterprise-grade secret management
- **AWS Secrets Manager**: For AWS deployments
- **Azure Key Vault**: For Azure deployments
- **Kubernetes Secrets**: For K8s deployments

### Phase 3: CI/CD Integration

#### GitHub Actions Workflow Enhancement

```yaml
# .github/workflows/deploy.yml
name: Deploy to Environment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
      image_tag:
        description: "Image tag to deploy"
        required: true
        default: "latest"

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          # Generate environment-specific docker-compose command
          docker compose \
            -f docker-compose.yaml \
            -f docker-compose.${{ github.event.inputs.environment }}.yaml \
            --env-file environments/.env.${{ github.event.inputs.environment }} \
            up -d
        env:
          IMAGE_TAG: ${{ github.event.inputs.image_tag }}
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
```

## 🛠️ Technology Recommendations

### 1. Container Orchestration

#### Current: Docker Compose

- **Pros**: Simple, good for single-host deployments
- **Cons**: Limited scaling, no built-in load balancing

#### Recommended Upgrades:

**For Small-Medium Scale:**

- **Docker Swarm**: Native Docker clustering
- **Portainer**: Web UI for container management
- **Traefik**: Automatic service discovery and load balancing

**For Large Scale:**

- **Kubernetes**: Industry standard orchestration
- **Helm Charts**: Package management for K8s
- **ArgoCD**: GitOps continuous deployment

### 2. Configuration Management

#### Recommended: Kustomize + ConfigMaps

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - base/

patchesStrategicMerge:
  - environment-patches.yaml

configMapGenerator:
  - name: app-config
    envs:
      - .env.production
```

#### Alternative: Helm with Values

```yaml
# values.production.yaml
environment: production
image:
  tag: "v1.2.3"
  pullPolicy: Always

database:
  host: "prod-postgres.company.com"
  name: "sirius_production"

ingress:
  enabled: true
  host: "sirius.company.com"
  tls: true
```

### 3. Infrastructure as Code (IaC)

#### Terraform for Infrastructure

```hcl
# main.tf
module "sirius_infrastructure" {
  source = "./modules/sirius"

  environment = var.environment
  image_tag   = var.image_tag

  database_instance_class = var.environment == "production" ? "db.r5.large" : "db.t3.micro"

  tags = {
    Environment = var.environment
    Project     = "sirius-scan"
  }
}
```

#### Pulumi Alternative (TypeScript/Go)

```typescript
// infrastructure/index.ts
import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";

const environment = pulumi.getStack();

const cluster = new aws.ecs.Cluster(`sirius-${environment}`);

const service = new aws.ecs.Service(`sirius-ui-${environment}`, {
  cluster: cluster.arn,
  taskDefinition: taskDefinition.arn,
  desiredCount: environment === "production" ? 3 : 1,
});
```

### 4. Monitoring and Observability

#### Recommended Stack:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and alerting
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing
- **AlertManager**: Alert routing

#### Implementation:

```yaml
# monitoring/docker-compose.yaml
version: "3.8"
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
```

## 🚀 Migration Strategy

### Week 1: Environment Separation

1. Create `docker-compose.override.yaml` for development
2. Create `docker-compose.staging.yaml` and `docker-compose.production.yaml`
3. Set up `environments/` directory with `.env` files
4. Update CI/CD to use environment-specific configurations

### Week 2: Secrets Management

1. Implement Docker secrets for sensitive data
2. Update deployment scripts to use external secret sources
3. Configure GitHub Actions environments with proper secrets

### Week 3: Infrastructure as Code

1. Create Terraform/Pulumi modules for infrastructure
2. Set up separate infrastructure for staging and production
3. Implement automated infrastructure deployment

### Week 4: Monitoring and Optimization

1. Deploy monitoring stack
2. Set up alerting and dashboards
3. Performance testing and optimization

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Secrets properly managed
- [ ] Database migrations ready
- [ ] Health checks configured
- [ ] Monitoring enabled

### Deployment

- [ ] Pull latest images
- [ ] Run database migrations
- [ ] Deploy services with zero downtime
- [ ] Verify health checks
- [ ] Run smoke tests

### Post-Deployment

- [ ] Monitor application metrics
- [ ] Check error rates
- [ ] Verify functionality
- [ ] Update documentation

## 🔒 Security Best Practices

### 1. Secrets Management

- Never commit secrets to version control
- Use environment-specific secret stores
- Rotate secrets regularly
- Implement least-privilege access

### 2. Container Security

- Use non-root users in containers
- Scan images for vulnerabilities
- Keep base images updated
- Implement resource limits

### 3. Network Security

- Use private networks for internal communication
- Implement proper firewall rules
- Use TLS for all external communication
- Regular security audits

## 📚 Additional Resources

- [Docker Compose Override Documentation](https://docs.docker.com/compose/extends/)
- [Kubernetes Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/)
- [12-Factor App Methodology](https://12factor.net/)
- [GitOps Principles](https://www.gitops.tech/)

---

This strategy eliminates manual file modifications while providing a robust, scalable deployment pipeline suitable for enterprise environments.
