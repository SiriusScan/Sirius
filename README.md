# Sirius Scan

Sirius is an open-source general purpose vulnerability scanner that leverages community-driven security intelligence. Get started in minutes with our Docker-based setup.

## Quick Start Guide

1. **Prerequisites**

   - Docker Engine 20.10.0+
   - Docker Compose V2
   - 4GB RAM minimum
   - 10GB free disk space

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/SiriusScan/Sirius.git
   cd Sirius

   # Start all services
   docker compose up -d

   # Access the web interface
   open http://localhost:3000
   ```

3. **Login**
   - Username: `admin`
   - Password: `password`

That's it! Your Sirius Scan instance is now running. Read on to explore its features.

## Interface Tour

### Dashboard

![Sirius Scan Dashboard](/dash-dark.gif)

The Dashboard serves as your central command center, providing:

- Real-time scanning activity and progress
- Latest vulnerability discoveries and trends
- System performance metrics
- Quick-access controls for common actions

### Scanning Interface

![Scanning Interface](/documentation/scanner.jpg)

The Scan page is where you control vulnerability assessments:

- Visual module editor for custom workflows
- Real-time scan progress monitoring
- Automated scanning schedules
- Fine-tuned scanning parameters
- Custom scan profiles and templates

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

### Environment Overview

![Environment Overview](/documentation/environment.jpg)

Complete visibility into your infrastructure:

- Full host inventory management
- Risk scoring and security metrics
- Interactive network topology visualization
- Detailed system information
- Service enumeration and version tracking

### Host Details

![Host Details](/documentation/host.jpg)

Detailed view of individual systems:

- Complete system specifications
- Port and service enumeration
- Vulnerability counts by severity
- Historical scan findings
- Security risk indicators

### Terminal Interface

![Terminal Interface](/documentation/terminal.jpg)

Direct access to Sirius backend:

- PowerShell environment for advanced operations
- Custom script execution
- Agent deployment and management
- System diagnostics
- Batch operations support

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

## Development

1. **Configure Development Environment**

   ```yaml
   volumes:
     - ../minor-projects/go-api:/go-api
     - ../minor-projects/app-scanner:/app-scanner
     - ../minor-projects/app-terminal:/app-terminal
     - ../minor-projects/nmap-db:/nmap-db
   ```

2. **Run Tests**

   ```bash
   # Show test options
   ./run_tests.sh --help

   # Run all tests
   ./run_tests.sh --all

   # Run specific suites
   ./run_tests.sh --models  # Model tests
   ./run_tests.sh --ui      # UI tests
   ```

## Troubleshooting

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

## Support & Resources

- [Documentation](/documentation)
- [GitHub Issues](https://github.com/SiriusScan/Sirius/issues)
- [Discord Community](/community)
- [FAQ](/documentation/community/faq)
- [Contributing Guide](/documentation/community/contributing)

## License

This project is licensed under the terms specified in the LICENSE file.

---

**Note**: For production deployments, ensure you change all default credentials and properly secure your services.
