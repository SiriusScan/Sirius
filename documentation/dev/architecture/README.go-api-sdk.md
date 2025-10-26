---
title: "Go API SDK Architecture"
description: "Comprehensive guide to the Sirius Go API SDK architecture, design patterns, and integration"
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["architecture", "sdk", "backend"]
tags: ["go", "api", "sdk", "database", "orm", "gorm"]
related_docs:
  - "README.architecture.md"
  - "../operations/README.sdk-releases.md"
  - "../../../minor-projects/go-api/README.md"
search_keywords: ["go-api", "sdk", "gorm", "database", "models", "postgres", "rabbitmq", "valkey"]
---

# Go API SDK Architecture

## Overview

The **Sirius Go API SDK** (`github.com/SiriusScan/go-api`) is a shared library that provides:

- **Core data models** (Host, Port, Vulnerability, Service)
- **Database operations** (PostgreSQL via GORM)
- **Message queue integration** (RabbitMQ)
- **Key-value store** (ValKey/Redis)
- **NVD API integration** (vulnerability data enrichment)

**Design Principles:**
- **Shared Types**: Single source of truth for data structures
- **Abstraction**: Database and queue operations hidden behind clean APIs
- **Source Attribution**: Track which tool found each piece of data
- **Flexibility**: Works across multiple projects (scanner, API server, agents)

## Package Structure

```
go-api/
├── sirius/               # Core functionality
│   ├── sirius.go        # Core types (Host, Port, Vulnerability, Service)
│   ├── postgres/        # Database operations
│   │   ├── connection.go        # DB initialization and connection management
│   │   ├── host_operations.go  # Host CRUD operations
│   │   ├── vulnerability_operations.go
│   │   └── models/      # Database models (GORM)
│   │       ├── host.go          # Host, Port, Service models
│   │       ├── vulnerability.go # Vulnerability, CVE models
│   │       └── scan_source.go   # Source attribution models
│   ├── host/           # Host management SDK
│   │   ├── host.go            # Basic host operations
│   │   └── source_aware.go    # Source-attributed operations
│   ├── queue/          # RabbitMQ integration
│   │   └── queue.go           # Publish/subscribe operations
│   ├── store/          # Key-value store (ValKey/Redis)
│   │   └── store.go           # KV operations
│   └── logging/        # Logging infrastructure
│       ├── client.go          # Logging client
│       └── api/               # Logging API server
├── nvd/                # NVD API integration
│   └── nvd.go                 # CVE data fetching
├── migrations/         # Database schema migrations
└── docs/               # SDK documentation
```

## Core Data Models

### Host Model

**File:** `sirius/sirius.go`

```go
type Host struct {
    HID             string          // Host identifier
    OS              string          // Operating system
    OSVersion       string          // OS version
    IP              string          // IP address
    Hostname        string          // DNS hostname
    Ports           []Port          // Open ports
    Services        []Service       // Running services
    Vulnerabilities []Vulnerability // Found vulnerabilities
    CPE             []string        // Common Platform Enumeration
    Agent           *SiriusAgent    // Optional agent info
}
```

### Port Model

**File:** `sirius/sirius.go` (Core), `sirius/postgres/models/host.go` (Database)

```go
// Core type (used by applications)
type Port struct {
    Number   int    `json:"number"`   // Port number (22, 80, 443, etc.)
    Protocol string `json:"protocol"` // tcp, udp
    State    string `json:"state"`    // open, closed, filtered
}

// Database model (used by GORM)
type Port struct {
    gorm.Model              // ID, CreatedAt, UpdatedAt, DeletedAt
    Number    int           // Port number
    Protocol  string        // Protocol
    State     string        // State
    Hosts     []Host        `gorm:"many2many:host_ports"`
    HostPorts []HostPort    `gorm:"foreignKey:PortID"`
}
```

**Key Design Decision:** Port numbers are stored in the `Number` field, NOT the auto-increment `ID` field. This allows the same port (e.g., port 22) to be associated with multiple hosts without conflicts.

### Vulnerability Model

**File:** `sirius/sirius.go` (Core), `sirius/postgres/models/vulnerability.go` (Database)

```go
// Core type
type Vulnerability struct {
    VID         string  `json:"vid"`         // CVE ID (CVE-2017-0144)
    Title       string  `json:"title"`       // Vulnerability title
    Description string  `json:"description"` // Description
    RiskScore   float64 `json:"risk_score"`  // CVSS score (0-10)
}

// Database model
type Vulnerability struct {
    gorm.Model
    VID         string  `gorm:"column:v_id;uniqueIndex"` // Unique CVE ID
    Description string
    Title       string
    RiskScore   float64
    Hosts       []Host              `gorm:"many2many:host_vulnerabilities"`
    HostVulnerabilities []HostVulnerability `gorm:"foreignKey:VulnerabilityID"`
}
```

## Source Attribution System

### Purpose

Track **which tool** found **which data** on **which host** at **what time**. This enables:
- **Audit trails**: Know where data came from
- **Tool comparison**: Compare effectiveness of different scanners
- **Historical tracking**: See when vulnerabilities first appeared
- **Confidence scoring**: Weight findings by source reliability

### Junction Tables with Source

**HostPort Junction Table:**

```go
type HostPort struct {
    HostID        uint      `json:"host_id" gorm:"primaryKey"`
    PortID        uint      `json:"port_id" gorm:"primaryKey"`
    Source        string    `json:"source" gorm:"primaryKey"`      // nmap, rustscan, naabu
    SourceVersion string    `json:"source_version"`                 // Tool version
    FirstSeen     time.Time `json:"first_seen"`                     // First detection
    LastSeen      time.Time `json:"last_seen"`                      // Last confirmation
    Status        string    `json:"status" gorm:"default:active"`   // active, resolved
    Notes         string    `json:"notes,omitempty"`                // Config details
}
```

**Primary Key:** `(host_id, port_id, source)` allows:
- Same port on same host tracked by multiple tools
- Comparison of results between tools
- Historical view of port states

**HostVulnerability Junction Table:**

Similar structure with additional fields:
- `Confidence` (0.0-1.0): How confident is this finding?
- `Port` (optional): Specific port where vulnerability found
- `ServiceInfo`: Service details

### Using Source Attribution

**Example: Add host with source:**

```go
import (
    "github.com/SiriusScan/go-api/sirius"
    "github.com/SiriusScan/go-api/sirius/host"
    "github.com/SiriusScan/go-api/sirius/postgres/models"
)

// Create host data
hostData := sirius.Host{
    IP: "192.168.1.100",
    Ports: []sirius.Port{
        {Number: 22, Protocol: "tcp", State: "open"},
        {Number: 80, Protocol: "tcp", State: "open"},
    },
}

// Create source metadata
source := models.ScanSource{
    Name:    "nmap",
    Version: "7.94",
    Config:  "ports:1-1000;template:quick;timing:T4",
}

// Submit with source attribution
err := host.AddHostWithSource(hostData, source)
```

## Database Operations

### Connection Management

**File:** `sirius/postgres/connection.go`

```go
// Get database connection (singleton)
db := postgres.GetDB()

// Initialize schema
err := postgres.InitDB()
```

**Environment Variables:**
- `DATABASE_HOST` (default: `localhost`)
- `DATABASE_PORT` (default: `5432`)
- `DATABASE_USER` (default: `postgres`)
- `DATABASE_PASSWORD` (default: `postgres`)
- `DATABASE_NAME` (default: `sirius`)

### Host Operations

**Basic Operations (Legacy):**

```go
import "github.com/SiriusScan/go-api/sirius/host"

// Add or update host
err := host.AddHost(hostData)

// Get host by IP
hostData, err := host.GetHost("192.168.1.100")

// Get all hosts
hosts, err := host.GetAllHosts()

// Delete host
err := host.DeleteHost("192.168.1.100")
```

**Source-Aware Operations (Recommended):**

```go
// Add/update with source tracking
err := host.AddHostWithSource(hostData, source)

// Get host with all source attributions
hostWithSources, err := host.GetHostWithSources("192.168.1.100")

// Get vulnerability history by source
history, err := host.GetVulnerabilityHistory(hostID, vulnID)

// Get source coverage statistics
stats, err := host.GetSourceCoverageStats()
```

### Mapping Between Core and Database Types

**File:** `sirius/host/host.go`

```go
// Convert database model to core type
siriusHost := host.MapDBHostToSiriusHost(dbHost)

// Convert core type to database model
dbHost := host.MapSiriusHostToDBHost(siriusHost)
```

**Important:** These functions handle:
- Port.Number ↔ Port field mapping
- Relationship loading (ports, services, vulnerabilities)
- Type conversions

## Message Queue Integration

### RabbitMQ

**File:** `sirius/queue/queue.go`

```go
import "github.com/SiriusScan/go-api/sirius/queue"

// Publish message to queue
err := queue.Publish("scan", scanMessage)

// Listen for messages
queue.Listen("scan", func(msg string) {
    // Process message
})
```

**Environment Variables:**
- `RABBITMQ_HOST` (default: `localhost`)
- `RABBITMQ_PORT` (default: `5672`)
- `RABBITMQ_USER` (default: `guest`)
- `RABBITMQ_PASSWORD` (default: `guest`)

**Common Queues:**
- `scan` - Scan requests
- `scanner_logs` - Scanner log events
- `agent_commands` - Agent commands
- `terminal` - Terminal commands

## Key-Value Store Integration

### ValKey/Redis

**File:** `sirius/store/store.go`

```go
import "github.com/SiriusScan/go-api/sirius/store"

// Set value
err := store.SetValue(ctx, "key", "value")

// Get value
result, err := store.GetValue(ctx, "key")

// Delete value
err := store.DeleteValue(ctx, "key")

// List keys
keys, err := store.ListKeys(ctx, "pattern:*")
```

**Environment Variables:**
- `VALKEY_HOST` (default: `localhost`)
- `VALKEY_PORT` (default: `6379`)

**Common Use Cases:**
- Real-time scan progress tracking
- Template storage (scan templates)
- Temporary data caching

## NVD Integration

### CVE Data Enrichment

**File:** `nvd/nvd.go`

```go
import "github.com/SiriusScan/go-api/nvd"

// Fetch CVE details from NVD
cveData, err := nvd.GetCVE("CVE-2017-0144")

// Access CVSS scores
score := cveData.Metrics.CvssMetricV31[0].CvssData.BaseScore
```

**Rate Limiting:** NVD API has rate limits. SDK respects these limits.

## Integration Patterns

### Pattern 1: Local Development with Replace Directive

**Use Case:** Developing changes to go-api and dependent project simultaneously

**go.mod:**
```go
module github.com/SiriusScan/app-scanner

replace github.com/SiriusScan/go-api => ../go-api  // Local development

require (
    github.com/SiriusScan/go-api v0.0.11  // Version for production
)
```

**Benefits:**
- Test SDK changes immediately
- No need to publish SDK for every test
- Easy debugging across projects

### Pattern 2: Production Use with Versioned Import

**Use Case:** Production deployments

**go.mod:**
```go
module github.com/SiriusScan/app-scanner

require (
    github.com/SiriusScan/go-api v0.0.11  // Specific version
)
```

**Benefits:**
- Reproducible builds
- Version pinning
- Explicit dependency management

### Pattern 3: Container Development with Volume Mounts

**Use Case:** Docker-based development (sirius-engine, sirius-api)

**docker-compose.dev.yaml:**
```yaml
services:
  sirius-engine:
    volumes:
      - ../minor-projects/go-api:/go-api:ro  # Mount SDK source
      - ../minor-projects/app-scanner:/app-scanner
```

**go.mod in container:**
```go
replace github.com/SiriusScan/go-api => /go-api
```

**Benefits:**
- Live code reload
- No rebuild for SDK changes
- Mirrors local development

## Version Management

### Semantic Versioning

**Format:** `v{MAJOR}.{MINOR}.{PATCH}`

**Rules:**
- **MAJOR** (0.x.x → 1.x.x): Breaking changes, incompatible API changes
- **MINOR** (x.0.x → x.1.x): New features, backward compatible
- **PATCH** (x.x.0 → x.x.1): Bug fixes, backward compatible

**Current:** v0.0.11 (pre-1.0, unstable API)

### Breaking Change Policy

**What Constitutes a Breaking Change:**
- ✅ Renaming exported fields (e.g., `Port.ID` → `Port.Number`)
- ✅ Changing function signatures
- ✅ Removing exported functions/types
- ✅ Changing database schema in non-backward-compatible way
- ❌ Adding new fields (backward compatible)
- ❌ Adding new functions (backward compatible)
- ❌ Internal implementation changes

**Communication:**
- Document in CHANGELOG.md with `BREAKING CHANGE:` prefix
- Include migration guide
- Increment version appropriately
- Notify dependent projects

### Compatibility Guarantees

**Before v1.0.0:**
- ⚠️ No API stability guaranteed
- Breaking changes may occur in patch releases
- Use exact version pinning in production

**After v1.0.0:**
- ✅ Semantic versioning strictly followed
- ✅ Breaking changes only in major versions
- ✅ Deprecation warnings before removal

## Development Workflow

### Making Changes to SDK

**1. Create feature branch:**
```bash
cd go-api
git checkout -b feature/my-change
```

**2. Make changes and test locally:**
```bash
# Edit files
go test ./...
go build ./...
```

**3. Test in dependent project:**
```bash
cd ../app-scanner
# Ensure replace directive points to ../go-api
go mod tidy
go build .
```

**4. Commit and push:**
```bash
cd ../go-api
git add .
git commit -m "feat: add new feature"
git push origin feature/my-change
```

**5. Create Pull Request**

**6. After merge to main:**
- CI/CD automatically creates new release
- Update dependent projects to new version

### Testing Changes

**Unit Tests:**
```bash
cd go-api
go test ./...
```

**Integration Tests:**
```bash
# Test with actual database
DATABASE_HOST=localhost go test ./sirius/postgres/...

# Test with actual RabbitMQ
RABBITMQ_HOST=localhost go test ./sirius/queue/...
```

**Manual Testing:**
```bash
# Use in dependent project with replace directive
cd app-scanner
go run main.go
```

### Contributing Guidelines

**Code Style:**
- Follow Go idioms and best practices
- Use `gofmt` for formatting
- Write meaningful commit messages (conventional commits)
- Add tests for new functionality

**Documentation:**
- Update CHANGELOG.md for user-facing changes
- Add godoc comments for exported types/functions
- Update SDK documentation for architectural changes

**Pull Requests:**
- Keep PRs focused and small
- Include test coverage
- Reference related issues
- Wait for CI/CD to pass

## Common Patterns & Best Practices

### Pattern: Bulk Operations

**Problem:** Need to process many hosts efficiently

**Solution:**
```go
// Use transactions for bulk operations
db := postgres.GetDB()
tx := db.Begin()

for _, hostData := range hosts {
    dbHost := host.MapSiriusHostToDBHost(hostData)
    if err := tx.Create(&dbHost).Error; err != nil {
        tx.Rollback()
        return err
    }
}

tx.Commit()
```

### Pattern: Error Handling

**Problem:** Need consistent error handling

**Solution:**
```go
import "fmt"

// Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to add host %s: %w", ip, err)
}

// Check for specific errors
if errors.Is(err, gorm.ErrRecordNotFound) {
    // Handle not found
}
```

### Pattern: Connection Pooling

**Problem:** Efficient database connections

**Solution:**
```go
// GetDB() returns singleton with connection pool
db := postgres.GetDB()

// Configure in connection.go:
sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(25)
sqlDB.SetMaxIdleConns(5)
sqlDB.SetConnMaxLifetime(5 * time.Minute)
```

### Pattern: Graceful Shutdown

**Problem:** Clean up resources on exit

**Solution:**
```go
func main() {
    // Initialize connections
    db := postgres.GetDB()
    
    // Handle shutdown
    c := make(chan os.Signal, 1)
    signal.Notify(c, os.Interrupt, syscall.SIGTERM)
    
    <-c
    
    // Cleanup
    sqlDB, _ := db.DB()
    sqlDB.Close()
}
```

## Troubleshooting

### Issue: "Module not found"

**Problem:**
```
go: github.com/SiriusScan/go-api@v0.0.11: invalid version: unknown revision v0.0.11
```

**Solutions:**
1. Check if version exists: `git ls-remote --tags https://github.com/SiriusScan/go-api`
2. Clear Go module cache: `go clean -modcache`
3. Use `replace` directive for local development

### Issue: "Undefined field after update"

**Problem:**
```
port.ID undefined (type sirius.Port has no field or method ID)
```

**Solution:**
- Check CHANGELOG.md for breaking changes
- Update code to use new field names (e.g., `port.Number`)
- Run `go mod tidy` after updating version

### Issue: Database connection fails

**Problem:**
```
failed to connect to database: connection refused
```

**Solution:**
1. Check environment variables are set correctly
2. Verify database is running: `docker ps | grep postgres`
3. Test connection: `psql -h localhost -U postgres -d sirius`

### Issue: "Duplicate key violation"

**Problem:**
```
ERROR: duplicate key value violates unique constraint "ports_pkey"
```

**Solution:**
- Ensure using SDK version ≥ v0.0.11 (fixes Port.ID conflict)
- Run migration 005_fix_critical_schema_issues
- Clear old data if necessary

## Migration Guides

### Migrating from v0.0.9/v0.0.10 to v0.0.11

**Breaking Changes:**
1. `Port.ID` → `Port.Number`
2. `CVEDataMeta.ID` → `CVEDataMeta.CVEIdentifier`

**Code Changes Required:**

**Before:**
```go
port := sirius.Port{
    ID:       22,
    Protocol: "tcp",
}

ports := make([]int, len(host.Ports))
for i, port := range host.Ports {
    ports[i] = port.ID  // ❌ No longer exists
}
```

**After:**
```go
port := sirius.Port{
    Number:   22,
    Protocol: "tcp",
}

ports := make([]int, len(host.Ports))
for i, port := range host.Ports {
    ports[i] = port.Number  // ✅ Correct
}
```

**Database Migration:**
```bash
# Run migration in container
docker exec sirius-engine bash -c "cd /tmp/migrations && go run 005_fix_critical_schema_issues/main.go"
```

**Verification:**
1. Update go.mod: `require github.com/SiriusScan/go-api v0.0.11`
2. Run: `go mod tidy`
3. Find all references: `grep -r "port\.ID" .`
4. Replace with `port.Number`
5. Test build: `go build ./...`
6. Run tests: `go test ./...`

## References

### Related Documentation

- [SDK Release Process](../operations/README.sdk-releases.md) - How to release new SDK versions
- [System Architecture](README.architecture.md) - Overall Sirius architecture
- [go-api README](../../../minor-projects/go-api/README.md) - SDK getting started guide
- [go-api CHANGELOG](../../../minor-projects/go-api/CHANGELOG.md) - Version history

### External Resources

- [GORM Documentation](https://gorm.io/docs/)
- [Go Module Reference](https://go.dev/ref/mod)
- [RabbitMQ Go Client](https://github.com/streadway/amqp)
- [ValKey Documentation](https://valkey.io/docs/)

---

**Last Updated:** 2025-10-26  
**SDK Version:** v0.0.11  
**Author:** Sirius Team

