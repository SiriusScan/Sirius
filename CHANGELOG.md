# Changelog

All notable changes to SiriusScan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-17

### Added
- Production API key support across services, including new API key management endpoints and shared SDK updates.
- Expanded scanner, host, and vulnerability capabilities in both API and UI, including new workflows and richer data presentation.
- Security testing suite under `testing/security` to validate API surface, headers, auth pathways, and service protections.

### Changed
- CI/CD workflows were stabilized for release reliability, including improved build and integration behavior for pull requests.
- Docker deployment configuration was updated with production overrides and safer validation defaults for CI checks.
- Documentation coverage expanded significantly across architecture, operations, and scanner internals.

### Removed
- Legacy development artifacts and deprecated UI/router files used only for earlier prototyping phases.

### Fixed
- Multiple release-blocking issues in image publishing, dependency pinning, and integration test orchestration.
- Documentation linting script behavior in CI environments.

## [0.4.0] - 2025-10-11

### Added
- **System Monitoring Dashboard**: Complete real-time monitoring system with service health checks and centralized logging
- **Centralized Logging Infrastructure**: Valkey-based logging system with log submission, retrieval, and management APIs
- **Real-time Service Health Monitoring**: Comprehensive health checks for all microservices (UI, API, Engine, PostgreSQL, Valkey, RabbitMQ)
- **System Resource Monitoring**: Real container metrics collection with CPU, memory, disk, and network monitoring
- **Advanced Log Viewer**: TanStack Table-based log viewer with filtering, search, and real-time updates
- **System Monitor Binary**: Lightweight Go binary for collecting and reporting system metrics from each container
- **Log Retention Policies**: Automatic cleanup with configurable retention (24 hours for metrics, 7 days for logs)
- **Performance Optimization**: Efficient polling, pagination, and memory management for large datasets

### Enhanced
- **Container Build System**: Improved Docker builds with proper Go module management and production-ready configurations
- **API Health Endpoints**: Enhanced `/health` endpoint with comprehensive system health information
- **Frontend Performance**: Optimized React components with memoization and efficient state management
- **Error Handling**: Comprehensive error handling and retry logic throughout the monitoring system
- **User Experience**: Improved UI/UX with loading states, error indicators, and responsive design

### Fixed
- **Go Module Dependencies**: Resolved version conflicts between sirius-api, go-api, and app-scanner modules
- **Container Build Issues**: Fixed missing go.sum entries and production build configurations
- **RabbitMQ Connectivity**: Corrected health check patterns for reliable service monitoring
- **SSH Access Configuration**: Added proper SSH troubleshooting capability for demo deployments
- **CI/CD Pipeline**: Fixed GitHub Actions workflows for automated demo deployments

### Technical Improvements
- **Multi-stage Docker Builds**: Optimized container images with separate build and runtime stages
- **Production Go Modules**: Proper separation of development and production go.mod files
- **Automated Testing**: Enhanced container testing suite with health checks and integration tests
- **Infrastructure as Code**: Improved Terraform configurations with SSH access and proper networking
- **Documentation**: Comprehensive documentation for system monitoring features and troubleshooting

### Security
- **SSH Key Management**: Secure SSH access configuration for troubleshooting and maintenance
- **Container Security**: Improved container security with proper user permissions and minimal attack surface
- **Access Control**: Enhanced security group configurations with proper CIDR restrictions

## [0.3.2] - Previous Release

### Added
- Basic vulnerability scanning capabilities
- Docker-based deployment system
- Web-based user interface
- PostgreSQL database integration
- RabbitMQ message queue system
- Valkey caching layer

---

## Release Notes

### v0.4.0 - System Monitoring & Observability

This major release introduces comprehensive system monitoring and observability capabilities to SiriusScan. The new monitoring dashboard provides real-time insights into system health, performance metrics, and centralized logging.

**Key Features:**
- **Real-time Monitoring**: Live health checks and system metrics
- **Centralized Logging**: Unified log collection and management
- **Performance Tracking**: Container resource utilization monitoring
- **Troubleshooting Tools**: Enhanced debugging and diagnostic capabilities

**Breaking Changes:** None

**Migration Guide:** No migration required. The monitoring features are additive and don't affect existing functionality.

**Upgrade Instructions:**
1. Pull the latest changes: `git pull origin main`
2. Rebuild containers: `docker compose down && docker compose up -d --build`
3. Access the new monitoring dashboard at `/system-monitor`

**Known Issues:** None

**Contributors:** Development Team
