# Sirius Scan v1.0.0

![Sirius Scan Dashboard](/documentation/dash-dark.gif)

Sirius is an open-source comprehensive vulnerability scanner that leverages community-driven security intelligence and automated penetration testing capabilities. **v1.0.0** is the first production release, bringing the complete scanning platform, hardened CI/CD workflows, and release-grade deployment readiness. Get started in minutes with our Docker-based setup.

## 🚀 Quick Start Guide

### Prerequisites

- **Docker Engine** 20.10.0+ with Docker Compose V2
- **System Requirements**: 4GB RAM minimum, 10GB free disk space
- **Network Access**: Internet connectivity for vulnerability database updates
- **Supported Platforms**: Linux, macOS, Windows (with WSL2)

### ⚡ Quick Start (Current Runtime Requirements)

### ⚡ Startup Command Cheat Sheet

```bash
# 1) Generate/merge required runtime secrets (.env)
docker compose -f docker-compose.installer.yaml run --rm sirius-installer

# 2a) Start standard stack
docker compose up -d

# 2b) Start development overlay
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d

# 2c) Optional hardened production overlay
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

```bash
# Clone repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Generate and validate startup secrets/config (installer-first)
docker compose -f docker-compose.installer.yaml run --rm sirius-installer

# Start Sirius with release images
docker compose up -d

# Access the web interface
open http://localhost:3000
```

**Important**:
- `SIRIUS_API_KEY` is required for `sirius-ui`, `sirius-api`, and `sirius-engine`.
- `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET`, and `INITIAL_ADMIN_PASSWORD` are required.
- This repository does **not** include `docker-compose.user.yaml`; use `docker-compose.yaml`, `docker-compose.dev.yaml`, and `docker-compose.prod.yaml`.

### 🧭 Using the New Startup System

Sirius now uses an installer-first startup flow. This keeps secrets synchronized across services and removes insecure defaults.

#### 1) First-time local setup (interactive)

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose up -d
```

What happens:
- Reads `.env.production.example`
- Merges existing `.env` values if present
- Generates missing required values:
  - `SIRIUS_API_KEY`
  - `POSTGRES_PASSWORD`
  - `NEXTAUTH_SECRET`
  - `INITIAL_ADMIN_PASSWORD`

#### 2) Non-interactive setup (CI/Terraform/user-data)

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets
docker compose up -d
```

#### 3) Force secret rotation/regeneration

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --force
```

#### 4) Development overlay startup

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

#### 5) Verify configuration renders

```bash
SIRIUS_API_KEY=test-key \
POSTGRES_PASSWORD=test-pass \
NEXTAUTH_SECRET=test-secret \
INITIAL_ADMIN_PASSWORD=test-admin-pass \
docker compose config --quiet
```

## 🆕 What's New in v1.0.0

### System Monitoring & Observability

- **Real-time Health Monitoring**: Live service health checks for all components
- **Centralized Logging**: Unified log collection and management system
- **Performance Metrics**: Container resource utilization tracking
- **System Dashboard**: Comprehensive monitoring interface at `/system-monitor`

### Enhanced Reliability

- **Improved Container Builds**: Production-ready Docker configurations
- **Better Error Handling**: Comprehensive error management and recovery
- **SSH Troubleshooting**: Enhanced debugging capabilities for deployments
- **Automated Testing**: Robust container testing and validation

### 🔧 Installation Options

#### Option 1: Standard Setup (Recommended for Most Users)

The default configuration provides a complete scanning environment:

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose up -d
```

#### Option 2: Local Development Overlay

Use live-reload/development mounts for active code work:

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

#### Option 3: Production Overlay

Optional hardened production settings and validation overlay:

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

##### Host Discovery Prerequisites (All Compose Modes)

- `sirius-engine` runs with `NET_RAW` capability in base/dev/prod compose configurations for ICMP-based fingerprint discovery.
- Keep `SIRIUS_API_URL` and `API_BASE_URL` pointing to `http://sirius-api:9001` for container-to-container API persistence.
- Use `NEXT_PUBLIC_SIRIUS_API_URL=http://localhost:9001` so browser calls hit the host-exposed API.

### ✅ Verify Installation

```bash
# Check all services are running
docker ps

# Expected services:
# - sirius-ui (port 3000)
# - sirius-api (port 9001)
# - sirius-engine (ports 5174, 50051)
# - sirius-postgres (port 5432)
# - sirius-rabbitmq (ports 5672, 15672)
# - sirius-valkey (port 6379)

# Access web interface
curl http://localhost:3000

# Check API health
curl http://localhost:9001/health
```

### 🔎 Host Discovery Validation

```bash
# Confirm compose renders successfully and includes NET_RAW
SIRIUS_API_KEY=test-key POSTGRES_PASSWORD=test-pass NEXTAUTH_SECRET=test-secret \
INITIAL_ADMIN_PASSWORD=test-admin-pass \
docker compose -f docker-compose.yaml config | rg "NET_RAW"

# Confirm scanner system template is canonicalized on startup (quick includes fingerprint)
docker compose exec sirius-valkey valkey-cli GET template:quick | rg '"scan_types"'

# Run a scan from UI/API, then verify queue consumers and scan state
docker compose exec sirius-rabbitmq rabbitmqctl list_queues name consumers messages_ready messages_unacknowledged | rg "scan|scan_control"
docker compose exec sirius-valkey valkey-cli GET currentScan
```

## 🎯 What Can Sirius Do?

### Core Capabilities

- **🔍 Network Discovery**: Automated host discovery and service enumeration
- **🛡️ Vulnerability Assessment**: CVE-based vulnerability detection with CVSS scoring
- **📊 Risk Management**: Comprehensive risk scoring and remediation guidance
- **🎪 Visual Scanning Workflows**: Drag-and-drop scan configuration
- **🔄 Automated Scanning**: Scheduled and continuous security assessments
- **📡 Remote Agent Support**: Distributed scanning across multiple environments
- **💻 Interactive Terminal**: PowerShell-based command interface for advanced operations
- **📈 Real-time Dashboards**: Live scanning progress and vulnerability metrics

### Supported Scan Types

- **Network Scanning**: Nmap-based port and service discovery
- **Vulnerability Scanning**: NSE script-based vulnerability detection
- **SMB/Windows Assessment**: Specialized Windows security testing
- **Custom Workflows**: User-defined scanning configurations
- **Agent-based Scanning**: Remote endpoint assessment

## 🏗️ System Architecture

Sirius uses a microservices architecture with the following components:

| Service             | Description             | Technology                     | Ports       | Purpose                               |
| ------------------- | ----------------------- | ------------------------------ | ----------- | ------------------------------------- |
| **sirius-ui**       | Web frontend            | Next.js 14, React, TailwindCSS | 3000        | User interface and visualization      |
| **sirius-api**      | REST API backend        | Go, Gin framework              | 9001        | API endpoints and business logic      |
| **sirius-engine**   | Multi-service container | Go services + embedded app-agent gRPC server | 5174, 50051 | Scanner, terminal, and agent services |
| **sirius-postgres** | Primary database        | PostgreSQL 15                  | 5432        | Vulnerability and scan data storage   |
| **sirius-rabbitmq** | Message queue           | RabbitMQ                       | 5672, 15672 | Inter-service communication           |
| **sirius-valkey**   | Cache layer             | Redis-compatible               | 6379        | Session and temporary data            |

### 📡 Service Communication Flow

```
User Interface (sirius-ui)
    ↓ HTTP/WebSocket
REST API (sirius-api)
    ↓ AMQP Messages
Message Queue (sirius-rabbitmq)
    ↓ Queue Processing
Scanning Engine (sirius-engine)
    ↓ SQL Queries
Database (sirius-postgres)
```

### 🤖 Agent Runtime Note

- `app-agent` runs inside `sirius-engine` in the default deployment.
- The gRPC endpoint is exposed on port `50051`.
- You do not need a separate `app-agent` container for the standard/prod compose flows in this repo.

### 🗄️ Data Storage

- **PostgreSQL**: Vulnerability data, scan results, host information
- **SQLite**: User authentication and session data (development)
- **Valkey/Redis**: Caching, temporary scan data, session storage
- **RabbitMQ**: Message queues for scan requests and agent communication

## 📱 Interface Overview

### 📊 Dashboard

![Sirius Scan Dashboard](/documentation/dash-dark.gif)

Your central command center featuring:

- Real-time scanning activity and progress monitoring
- Latest vulnerability discoveries with severity trends
- System performance metrics and resource utilization
- Quick-access controls for common scanning operations
- Executive summary with risk scoring

### 🔍 Scanning Interface

![Scanning Interface](/documentation/scanner.jpg)

Advanced scanning capabilities:

- **Visual Workflow Editor**: Drag-and-drop scan module configuration
- **Real-time Progress**: Live scan status with detailed logging
- **Custom Profiles**: Save and reuse scanning configurations
- **Scheduled Scans**: Automated scanning with cron-like scheduling
- **Multi-target Support**: Scan multiple hosts, networks, or IP ranges
- **NSE Script Integration**: Custom Nmap scripts for specialized testing

### 🎯 Vulnerability Navigator

![Vulnerability Navigator](/documentation/vulnerability-navigator.jpg)

Comprehensive vulnerability management:

- **Dynamic Filtering**: Real-time search across all vulnerability data
- **Risk Prioritization**: CVSS-based severity sorting and filtering
- **Detailed Reports**: CVE/CPE mapping with remediation guidance
- **Export Capabilities**: PDF, CSV, and JSON report generation
- **Historical Tracking**: Vulnerability timeline and remediation progress
- **Integration Ready**: API endpoints for external security tools

### 🌐 Environment Overview

![Environment Overview](/documentation/environment.jpg)

Complete infrastructure visibility:

- **Asset Inventory**: Comprehensive host and service discovery
- **Network Topology**: Interactive visualization of discovered infrastructure
- **Risk Assessment**: Environment-wide security posture analysis
- **Service Enumeration**: Detailed service versioning and configuration
- **Compliance Tracking**: Security baseline monitoring and reporting

### 🖥️ Host Details

![Host Details](/documentation/host.jpg)

In-depth system analysis:

- **System Profiling**: Complete hardware and software inventory
- **Port Analysis**: Detailed service discovery and version detection
- **Security Metrics**: Host-specific vulnerability counts and risk scores
- **Historical Data**: Scan history and security trend analysis
- **Remediation Tracking**: Fix validation and security improvement monitoring

### 💻 Terminal Interface

![Terminal Interface](/documentation/terminal.jpg)

Advanced operations console:

- **PowerShell Environment**: Full scripting capabilities for automation
- **Agent Management**: Remote agent deployment and configuration
- **Custom Scripts**: Execute custom security testing scripts
- **Batch Operations**: Bulk scanning and management operations
- **System Diagnostics**: Real-time system health and performance monitoring

## 🛠️ Standard Setup

Perfect for security professionals and penetration testers:

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose up -d
```

This configuration provides:

- ✅ Complete scanning capabilities out-of-the-box
- ✅ Pre-configured vulnerability databases
- ✅ No additional setup required
- ✅ Production-ready security scanning

## 🤝 Contributing

Want to contribute to Sirius? We welcome contributions from the community!

**For Developers**: Check out our comprehensive [Contributing Guide](./documentation/contributing.md) for:

- 🔧 Development environment setup
- 🔄 Development workflow and best practices
- 🧪 Testing and quality assurance
- 📝 Code standards and Git workflow
- 🚀 Submitting pull requests

**Quick Links**:
- [Development Setup](./documentation/contributing.md#development-environment-setup)
- [Testing Guide](./documentation/contributing.md#testing--quality-assurance)
- [Code Standards](./documentation/contributing.md#code-standards)
- [GitHub Issues](https://github.com/SiriusScan/Sirius/issues)

Join our community and help make security scanning accessible to everyone!

## 🔌 API & Integration

Sirius provides comprehensive APIs for integration with existing security workflows:

### REST API Endpoints

- Sirius exposes REST endpoints on `http://localhost:9001`.
- The API is protected by `SIRIUS_API_KEY` middleware.
- Include the API key in requests with `X-API-Key: <your key>`.

### WebSocket APIs

- **Real-time Updates**: Live scan progress and vulnerability notifications
- **Agent Communication**: Bidirectional agent management
- **System Monitoring**: Live system metrics and health status

### Integration Examples

```bash
# Health endpoint
curl http://localhost:9001/health \
  -H "X-API-Key: $SIRIUS_API_KEY"

# Example authenticated request
curl http://localhost:9001/api/v1/scan/get/all \
  -H "X-API-Key: $SIRIUS_API_KEY"
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 🐳 Container Issues

**Problem**: Services fail to start

```bash
# Diagnosis
docker compose ps              # Check service status
docker compose logs <service>  # View service logs
docker system df              # Check disk space

# Solutions
docker compose -f docker-compose.installer.yaml run --rm sirius-installer  # Ensure required secrets exist in .env
docker compose down && docker compose up -d --build  # Fresh restart
docker system prune -f                               # Clean up space
```

**Problem**: Infrastructure services (PostgreSQL, RabbitMQ, Valkey) don't start

```bash
# This occurs when using only docker-compose.dev.yaml
# The dev file is an OVERRIDE file, not standalone

# ❌ Wrong (only starts 3 services):
docker compose -f docker-compose.dev.yaml up -d

# ✅ Correct (starts all 6 services):
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

**Problem**: "Port already in use" errors

```bash
# Find process using port
netstat -tuln | grep 3000
lsof -i :3000

# Solution: Stop conflicting service or change port
docker compose down
# Edit docker-compose.yaml to use different ports if needed
```

#### 🔍 Scanner Issues

**Problem**: Nmap errors or scanning failures

```bash
# Check scanner logs
docker logs sirius-engine | grep -i nmap

# Test Nmap directly
docker exec sirius-engine nmap --version
docker exec sirius-engine nmap -p 80 127.0.0.1

# Common fixes
docker restart sirius-engine
docker exec sirius-engine which nmap  # Verify Nmap installation
```

**Problem**: "Duplicate port specification" warnings

```bash
# This is resolved in current version, but if you see it:
docker exec sirius-engine grep -r "port.*specification" /app-scanner-src/
# Should show corrected port ranges like "1-1000,3389"
```

#### 🗄️ Database Issues

**Problem**: Database connection failures

```bash
# Check PostgreSQL status
docker exec sirius-postgres pg_isready
docker logs sirius-postgres

# Test connection
docker exec sirius-postgres psql -U postgres -d sirius -c "SELECT version();"

# Reset database if needed
docker compose down
docker volume rm sirius_postgres_data
docker compose up -d
```

#### 🐰 Message Queue Issues

**Problem**: RabbitMQ connectivity issues

```bash
# Check RabbitMQ status
docker exec sirius-rabbitmq rabbitmqctl status

# View queue status
docker exec sirius-rabbitmq rabbitmqctl list_queues

# Access management interface
open http://localhost:15672
```

**Problem**: RabbitMQ schema integrity check failed

```bash
# This occurs when RabbitMQ has old data from an incompatible version
# Solution: Remove old volumes and restart fresh

docker compose down -v  # For standard setup
# Or for development:
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down -v
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

#### 🌐 Network & Connectivity

**Problem**: Services can't communicate

```bash
# Test internal network
docker exec sirius-ui ping sirius-api
docker exec sirius-api ping sirius-postgres

# Check network configuration
docker network ls
docker network inspect sirius
```

**Problem**: External access issues

```bash
# Verify port mapping
docker port sirius-ui
docker port sirius-api

# Check firewall (Linux)
sudo ufw status
sudo iptables -L

# Check firewall (macOS)
sudo pfctl -s all
```

### 🚨 Emergency Recovery

**Complete System Reset**:

```bash
# Stop all services
docker compose down

# Remove all data (⚠️ This deletes all scan data!)
docker compose down -v

# Clean Docker system
docker system prune -a -f

# Fresh start
docker compose up -d --build
```

**Backup Current Data**:

```bash
# Backup database
docker exec sirius-postgres pg_dump -U postgres sirius > backup.sql

# Backup scan results directory
docker cp sirius-engine:/opt/sirius/ ./sirius-backup/
```

## 🔒 Security Best Practices

### 🏭 Production Deployment

**Essential Security Steps**:

1. **Change Default Credentials**:

```bash
# Generate secure values with the installer
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --force

# Or set explicit values in .env if needed
# POSTGRES_PASSWORD=your_secure_password
# NEXTAUTH_SECRET=your_long_random_secret
# SIRIUS_API_KEY=your_long_random_api_key
# INITIAL_ADMIN_PASSWORD=your_strong_admin_password
```

2. **Network Security**:

```bash
# Use internal networks for service communication
# Expose only necessary ports (3000 for UI)
# Configure firewall rules
sudo ufw allow 3000/tcp
sudo ufw deny 5432/tcp  # Don't expose database
```

3. **SSL/TLS Configuration**:

```bash
# Use reverse proxy with SSL (nginx/traefik)
# Enable HTTPS for web interface
# Secure API endpoints with proper certificates
```

4. **Data Protection**:

```bash
# Encrypt database backups
# Secure volume mounts
# Regular security updates
docker compose pull  # Update images regularly
```

### 🛡️ Security Scanning Best Practices

- **Network Isolation**: Run scans from isolated networks when possible
- **Permission Management**: Use least-privilege principles for scan accounts
- **Scan Scheduling**: Perform intensive scans during maintenance windows
- **Data Retention**: Implement appropriate data lifecycle policies
- **Audit Logging**: Enable comprehensive logging for compliance

## 📚 Documentation & Resources

### 📖 Essential Documentation

- [📘 Installation Guide](https://sirius.publickey.io/docs/getting-started/installation) - Detailed setup instructions
- [🎯 Quick Start Guide](https://sirius.publickey.io/docs/getting-started/quick-start) - Get scanning in 5 minutes
- [🎪 Interface Tour](https://sirius.publickey.io/docs/getting-started/interface-tour) - Complete UI walkthrough
- [🔧 Configuration Guide](https://sirius.publickey.io/docs/guides/configuration) - Advanced configuration options
- [🛡️ Security Guide](https://sirius.publickey.io/docs/guides/security) - Production security best practices

### 🔌 Technical Documentation

- [🚀 API Reference](https://sirius.publickey.io/docs/api/rest/authentication) - Complete API documentation
- [📦 Go SDK](https://sirius.publickey.io/docs/api/sdk/go) - Go integration library
- [🐳 Docker Guide](./documentation/DOCKER-IMPLEMENTATION-DOCUMENTATION.md) - Comprehensive Docker documentation
- [🏗️ Architecture Guide](./documentation/README.architecture.md) - System architecture deep-dive
- [🔄 CI/CD Guide](./documentation/README.cicd.md) - Deployment automation

### 🎓 User Guides

- [🔍 Scanning Guide](https://sirius.publickey.io/docs/guides/scanning) - Advanced scanning techniques
- [🎯 Vulnerability Management](https://sirius.publickey.io/docs/guides/vulnerabilities) - Managing discovered vulnerabilities
- [🌐 Environment Management](https://sirius.publickey.io/docs/guides/environment) - Infrastructure assessment
- [🖥️ Host Management](https://sirius.publickey.io/docs/guides/hosts) - Individual host analysis
- [💻 Terminal Guide](https://sirius.publickey.io/docs/guides/terminal) - Advanced PowerShell operations

### 🤝 Community & Support

- [❓ FAQ](https://sirius.publickey.io/docs/community/faq) - Frequently asked questions
- [🐛 GitHub Issues](https://github.com/SiriusScan/Sirius/issues) - Bug reports and feature requests
- [💬 Discord Community](https://sirius.publickey.io/community) - Real-time community support
- [🤝 Contributing Guide](./documentation/contributing.md) - How to contribute to Sirius
- [📧 Support Contact](mailto:support@publickey.io) - Direct technical support

## 📊 Performance & Scaling

### 📈 System Requirements by Use Case

| Use Case            | CPU       | RAM   | Storage | Network    |
| ------------------- | --------- | ----- | ------- | ---------- |
| **Personal Lab**    | 2 cores   | 4GB   | 20GB    | Basic      |
| **Small Business**  | 4 cores   | 8GB   | 100GB   | Dedicated  |
| **Enterprise**      | 8+ cores  | 16GB+ | 500GB+  | High-speed |
| **MSP/Large Scale** | 16+ cores | 32GB+ | 1TB+    | Enterprise |

### ⚡ Performance Optimization

```bash
# Monitor resource usage
docker stats

# Optimize for large environments
# Edit docker-compose.yaml and add:
services:
  sirius-engine:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

## 🆕 What's New

### Recent Updates

- ✅ **Fixed Nmap Configuration**: Resolved duplicate port specification warnings
- ✅ **Enhanced Development Mode**: Improved volume mounting for local development
- ✅ **Better Error Handling**: Enhanced debugging and logging capabilities
- ✅ **Performance Improvements**: Optimized container startup and resource usage
- ✅ **Security Enhancements**: Updated default configurations and security practices

### Upcoming Features

- 🔄 **Advanced Reporting**: Enhanced PDF and dashboard reporting
- 🎯 **AI-Powered Analysis**: Automated vulnerability risk assessment
- 📱 **Mobile Support**: Mobile-responsive interface improvements
- 🔌 **Plugin System**: Extensible scanning module architecture
- ☁️ **Cloud Integration**: Native cloud platform scanning support

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

---

**🚀 Ready to start scanning?** Follow our [Quick Start Guide](https://sirius.publickey.io/docs/getting-started/quick-start) and have Sirius running in under 5 minutes!

**💡 Need help?** Join our [Discord community](https://sirius.publickey.io/community) for real-time support and discussion.

**🐛 Found a bug?** Report it on [GitHub Issues](https://github.com/SiriusScan/Sirius/issues) - we respond quickly!

---

_For production deployments, always change default credentials and review our [Security Guide](https://sirius.publickey.io/docs/guides/security) for best practices._
