# Sirius Scan

Sirius is an open-source general purpose vulnerability scanner that leverages community-driven security intelligence. Get started in minutes with our Docker-based setup.

## Quick Start Guide

For detailed setup instructions, visit our [Installation Guide](https://sirius.publickey.io/docs/getting-started/installation).

### Prerequisites

- Docker Engine 20.10.0+
- Docker Compose V2
- 4GB RAM minimum
- 10GB free disk space

### Installation Options

#### Option 1: Standard Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Start all services
docker compose up -d

# Access the web interface
open http://localhost:3000
```

#### Option 2: Simplified User Setup

For the cleanest experience without development files:

```bash
# Clone the repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Use the simplified configuration
docker compose -f docker-compose.user.yaml up -d

# Access the web interface
open http://localhost:3000
```

### Login Credentials

- Username: `admin`
- Password: `password`

**⚠️ Security Notice**: Change these default credentials in production environments.

That's it! Your Sirius Scan instance is now running. For a complete walkthrough of the system, visit our [Quick Start Guide](https://sirius.publickey.io/docs/getting-started/quick-start).

## Interface Tour

For a comprehensive walkthrough of all features, visit our [Interface Tour](https://sirius.publickey.io/docs/getting-started/interface-tour).

### Dashboard

![Sirius Scan Dashboard](/documentation/dash-dark.gif)

The Dashboard serves as your central command center, providing:

- Real-time scanning activity and progress
- Latest vulnerability discoveries and trends
- System performance metrics
- Quick-access controls for common actions

[Learn more about the Dashboard](https://sirius.publickey.io/docs/getting-started/interface-tour#dashboard-overview)

### Scanning Interface

![Scanning Interface](/documentation/scanner.jpg)

The Scan page is where you control vulnerability assessments:

- Visual module editor for custom workflows
- Real-time scan progress monitoring
- Automated scanning schedules
- Fine-tuned scanning parameters
- Custom scan profiles and templates

[Learn more about Scanning](https://sirius.publickey.io/docs/guides/scanning)

### Vulnerability Navigator

![Vulnerability Navigator](/documentation/vulnerability-navigator.jpg)

Comprehensive platform for managing discovered vulnerabilities:

- Dynamic vulnerability listing with real-time updates
- Advanced search and filtering capabilities
- Multiple view options (list, grid, severity-based)
- Detailed vulnerability reports including:
  - CVE/CPE mapping
  - CVSS scoring breakdown
  - Step-by-step remediation instructions

[Learn more about Vulnerability Management](https://sirius.publickey.io/docs/guides/vulnerabilities)

### Environment Overview

![Environment Overview](/documentation/environment.jpg)

Complete visibility into your infrastructure:

- Full host inventory management
- Risk scoring and security metrics
- Interactive network topology visualization
- Detailed system information
- Service enumeration and version tracking

[Learn more about Environment Management](https://sirius.publickey.io/docs/guides/environment)

### Host Details

![Host Details](/documentation/host.jpg)

Detailed view of individual systems:

- Complete system specifications
- Port and service enumeration
- Vulnerability counts by severity
- Historical scan findings
- Security risk indicators

[Learn more about Host Management](https://sirius.publickey.io/docs/guides/hosts)

### Terminal Interface

![Terminal Interface](/documentation/terminal.jpg)

Direct access to Sirius backend:

- PowerShell environment for advanced operations
- Custom script execution
- Agent deployment and management
- System diagnostics
- Batch operations support

[Learn more about Terminal Access](https://sirius.publickey.io/docs/guides/terminal)

## System Architecture

Sirius operates through several microservices:

| Service         | Description             | Port(s)                         |
| --------------- | ----------------------- | ------------------------------- |
| sirius-ui       | Web interface (Next.js) | 3000 (HTTP), 3001 (Dev)         |
| sirius-api      | Backend API service     | 9001                            |
| sirius-engine   | Scanning engine         | 5174                            |
| sirius-rabbitmq | Message broker          | 5672 (AMQP), 15672 (Management) |
| sirius-postgres | Database                | 5432                            |
| sirius-valkey   | Key-value store         | 6379                            |

For detailed configuration options, visit our [Configuration Guide](https://sirius.publickey.io/docs/guides/configuration).

## Development

For complete development setup instructions, visit our [Contributing Guide](https://sirius.publickey.io/docs/community/contributing).

### End User Setup (Default)

The default configuration is ready to use out-of-the-box:

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose up -d
```

This will start all services using the built-in configurations without requiring additional repositories.

### Developer Setup (Advanced)

For active development, you can mount local directories for live code editing:

1. **Optional: Clone Additional Repositories**

   ```bash
   # Create directory structure for development (optional)
   mkdir -p ../minor-projects
   cd ../minor-projects

   # Clone repositories you want to develop on:
   git clone https://github.com/SiriusScan/go-api.git
   git clone https://github.com/SiriusScan/app-scanner.git
   git clone https://github.com/SiriusScan/app-terminal.git
   git clone https://github.com/SiriusScan/app-agent.git
   ```

2. **Enable Development Volume Mounts**

   Edit `docker-compose.override.yaml` and uncomment the volume mounts you need:

   ```yaml
   # Uncomment only the repositories you have cloned:
   # - ../minor-projects/app-agent:/app-agent
   # - ../minor-projects/app-scanner:/app-scanner
   # - ../minor-projects/go-api:/go-api
   # - ../minor-projects/app-terminal:/app-terminal
   ```

3. **Start Development Environment**

   ```bash
   cd Sirius
   docker compose up -d
   ```

### Testing

```bash
# Show test options
./run_tests.sh --help

# Run all tests
./run_tests.sh --all

# Run specific suites
./run_tests.sh --models  # Model tests
./run_tests.sh --ui      # UI tests
```

## API Integration

For API documentation and SDK usage, visit our [API Documentation](https://sirius.publickey.io/docs/api).

- [REST API Reference](https://sirius.publickey.io/docs/api/rest/authentication)
- [Go SDK Documentation](https://sirius.publickey.io/docs/api/sdk/go)
- [Error Handling](https://sirius.publickey.io/docs/api/rest/errors)

## Troubleshooting

For detailed troubleshooting steps, visit our [FAQ](https://sirius.publickey.io/docs/community/faq).

### Service Status

```bash
# Check all services
docker compose ps

# View logs
docker compose logs

# Check specific service
docker compose logs sirius-api
```

### Common Issues

1. **Service Fails to Start**

   - Check logs: `docker compose logs <service-name>`
   - Verify ports: `netstat -tuln`
   - Check system resources

2. **Database Connection Issues**

   - Verify PostgreSQL: `docker compose ps sirius-postgres`
   - Check logs: `docker compose logs sirius-postgres`
   - Verify credentials

3. **Message Queue Problems**
   - Check RabbitMQ: http://localhost:15672
   - View logs: `docker compose logs sirius-rabbitmq`

## Security Notice

For production deployments:

- Change all default credentials
- Secure your services
- Update environment variables
- Configure firewall rules

For detailed security best practices, visit our [Security Guide](https://sirius.publickey.io/docs/guides/security).

## Support & Resources

- [Documentation Home](https://sirius.publickey.io/docs)
- [API Reference](https://sirius.publickey.io/docs/api)
- [User Guides](https://sirius.publickey.io/docs/guides)
- [GitHub Issues](https://github.com/SiriusScan/Sirius/issues)
- [Discord Community](https://sirius.publickey.io/community)
- [FAQ](https://sirius.publickey.io/docs/community/faq)
- [Contributing Guide](https://sirius.publickey.io/docs/community/contributing)

## License

This project is licensed under the terms specified in the LICENSE file.

---

**Note**: For production deployments, ensure you change all default credentials and properly secure your services.
