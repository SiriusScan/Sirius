# Database Scan Reporting System - Architecture & Problem Analysis

## Overview

This document provides a comprehensive analysis of the Sirius scan reporting system, detailing the current architecture, identified problems with scan result overwriting, and the planned solution for implementing source-tagged scan history.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Scan Sources and Entry Points](#scan-sources-and-entry-points)
3. [Database Schema Analysis](#database-schema-analysis)
4. [Current Data Flow](#current-data-flow)
5. [Core Problem Analysis](#core-problem-analysis)
6. [File Structure and Key Components](#file-structure-and-key-components)
7. [API Endpoints](#api-endpoints)
8. [Frontend Interfaces](#frontend-interfaces)
9. [Libraries and Dependencies](#libraries-and-dependencies)
10. [Proposed Solution Architecture](#proposed-solution-architecture)

---

## System Architecture

### High-Level Components

The Sirius vulnerability management system consists of multiple interconnected components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Network       │    │   Agent/        │    │   Manual/API    │
│   Scanner       │    │   Terminal      │    │   Submissions   │
│  (app-scanner)  │    │  (app-agent)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Go API        │
                    │  (go-api)       │
                    │  Host Management│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   NextJS UI     │
                    │  (sirius-ui)    │
                    └─────────────────┘
```

### Project Structure

- **`go-api/`** - Core Go API and database management
- **`app-scanner/`** - Network-based vulnerability scanning
- **`app-agent/`** - Host-based agent scanning
- **`sirius-ui/`** - NextJS frontend interface
- **`sirius-api/`** - REST API handlers (Fiber framework)

---

## Scan Sources and Entry Points

### 1. Network Scanner (`app-scanner/`)

**Purpose**: External network-based vulnerability discovery
**Tools**: nmap, rustscan, naabu, NSE scripts
**Entry Point**: `app-scanner/internal/scan/manager.go`

**Key Files**:

- `app-scanner/internal/scan/manager.go` - Main scan orchestration
- `app-scanner/internal/scan/strategies.go` - Scan strategy implementations
- `app-scanner/modules/nmap/nmap.go` - Nmap integration
- `app-scanner/modules/rustscan/rustscan.go` - RustScan integration
- `app-scanner/modules/naabu/naabu.go` - Naabu integration

**Data Flow**:

```
Scan Target → Discovery (RustScan) → Vulnerability Scan (Nmap) →
host.AddHost() → Database Update → KV Store Update
```

**Capabilities**:

- Port discovery and enumeration
- Service detection
- Vulnerability scanning via NSE scripts
- CVE identification and scoring
- Network-accessible vulnerability assessment

### 2. Agent/Terminal Scanner (`app-agent/`)

**Purpose**: Internal host-based vulnerability and inventory discovery
**Tools**: PowerShell scripts, package managers, system queries
**Entry Point**: `app-agent/internal/commands/scan/scan_command.go`

**Key Files**:

- `app-agent/internal/commands/scan/scan_command.go` - Main scan orchestration
- `app-agent/internal/commands/scan/types.go` - Scan result structures
- `app-agent/internal/commands/scan/windows_scan.go` - Windows-specific scanning
- `app-agent/internal/shell/` - Script execution framework

**Data Flow**:

```
Terminal Command → Agent Execution → Package/Patch Enumeration →
API POST /host → handlers.AddHost() → host.AddHost() → Database Update
```

**Capabilities**:

- Installed software inventory
- Patch level assessment
- Internal configuration scanning
- Custom PowerShell script execution
- OS-specific vulnerability detection

### 3. Manual/API Submissions

**Purpose**: Direct API-based host and vulnerability data submission
**Entry Point**: REST API endpoints

**Data Flow**:

```
External Tool/User → HTTP POST /host → handlers.AddHost() →
host.AddHost() → Database Update
```

---

## Database Schema Analysis

### Core Models

Located in `go-api/sirius/postgres/models/`

#### Host Model (`host.go`)

```go
type Host struct {
    gorm.Model
    HID             string
    OS              string
    OSVersion       string
    IP              string `gorm:"uniqueIndex"`
    Hostname        string
    Ports           []Port `gorm:"many2many:host_ports"`
    Services        []Service
    Vulnerabilities []Vulnerability `gorm:"many2many:host_vulnerabilities"`
    CPEs            []CPE
    Users           []User
    Notes           []Note
    AgentID         uint
}
```

#### Vulnerability Model (`vulnerability.go`)

```go
type Vulnerability struct {
    gorm.Model
    VID string `gorm:"column:v_id"`
    Description string
    Title       string
    Hosts       []Host `gorm:"many2many:host_vulnerabilities"`
    RiskScore   float64
}
```

#### Junction Tables

```go
type HostVulnerability struct {
    gorm.Model
    HostID          uint
    VulnerabilityID uint
    // MISSING: Source attribution fields
}

type HostPort struct {
    gorm.Model
    HostID uint
    PortID uint
    // MISSING: Source attribution fields
}
```

### Current Schema Limitations

**Problem**: Junction tables lack source attribution, making it impossible to track which scanner reported which findings.

**Missing Fields**:

- Source identification (scanner name)
- Source version
- First/last seen timestamps
- Confidence scoring
- Status tracking

---

## Current Data Flow

### Network Scanner Flow

1. **Scan Initiation**: `app-scanner/internal/scan/manager.go`
2. **Discovery Phase**: RustScan finds open ports
3. **Vulnerability Phase**: Nmap performs vulnerability assessment
4. **Data Processing**: Results mapped to `sirius.Host` structure
5. **Database Update**: `host.AddHost()` called
6. **Association Replacement**: **[PROBLEM]** All existing associations replaced

### Agent Scanner Flow

1. **Command Execution**: Terminal runs scan command
2. **Agent Processing**: `app-agent/internal/commands/scan/scan_command.go`
3. **Data Collection**: OS-specific package/vulnerability enumeration
4. **API Submission**: HTTP POST to `/host` endpoint
5. **Handler Processing**: `sirius-api/handlers/host_handler.go`
6. **Database Update**: `host.AddHost()` called
7. **Association Replacement**: **[PROBLEM]** All existing associations replaced

---

## Core Problem Analysis

### The Overwriting Issue

**Location**: `go-api/sirius/host/host.go`, lines 216-229

```go
// THIS IS THE PROBLEM - Complete replacement of associations
err = db.Model(&existingHost).Association("Vulnerabilities").Replace(dbHost.Vulnerabilities)
err = db.Model(&existingHost).Association("Ports").Replace(dbHost.Ports)
```

### Impact

1. **Data Loss**: When network scanner runs after agent scan, all agent-discovered vulnerabilities are lost
2. **Incomplete Assessment**: No holistic view combining findings from multiple sources
3. **False Negatives**: Internal vulnerabilities hidden when external scan runs
4. **No Historical Tracking**: No way to see when vulnerabilities were first/last detected
5. **Source Attribution Loss**: No way to know which tool found which vulnerability

### Example Scenario

```
1. Agent scan finds: CVE-2023-1234 (internal software vulnerability)
2. Database stores: Host X -> CVE-2023-1234 (source: unknown)
3. Network scan finds: CVE-2023-5678 (network service vulnerability)
4. Database now only contains: Host X -> CVE-2023-5678
5. CVE-2023-1234 is lost forever
```

---

## File Structure and Key Components

### Go API Core (`go-api/`)

```
go-api/
├── sirius/
│   ├── host/
│   │   └── host.go                    # Core host management (NEEDS MODIFICATION)
│   ├── vulnerability/
│   │   └── vulnerability.go           # Vulnerability management
│   ├── postgres/
│   │   ├── models/
│   │   │   ├── host.go               # Host data model (NEEDS MODIFICATION)
│   │   │   └── vulnerability.go      # Vulnerability data model
│   │   ├── connection.go             # Database connection management
│   │   ├── host_operations.go        # Low-level host operations
│   │   └── vulnerability_operations.go
│   ├── store/
│   │   └── store.go                  # KV store for scan results
│   └── sirius.go                     # Core data structures
├── migrations/
│   └── 001_fix_relationships.go      # Previous schema migration
└── nvd/
    └── nvd.go                        # NVD API integration
```

### Network Scanner (`app-scanner/`)

```
app-scanner/
├── internal/
│   └── scan/
│       ├── manager.go                # Main scan orchestration (NEEDS MODIFICATION)
│       └── strategies.go             # Scan strategy implementations
├── modules/
│   ├── nmap/
│   │   └── nmap.go                   # Nmap integration
│   ├── rustscan/
│   │   └── rustscan.go              # RustScan integration
│   └── naabu/
│       └── naabu.go                 # Naabu integration
└── cmd/
    └── scan-full-test/
        └── main.go                   # Testing utilities
```

### Agent Scanner (`app-agent/`)

```
app-agent/
├── internal/
│   └── commands/
│       └── scan/
│           ├── scan_command.go       # Main scan command (NEEDS MODIFICATION)
│           ├── types.go              # Scan result types
│           └── windows_scan.go       # Windows-specific scanning
└── internal/
    └── shell/                        # Script execution framework
```

### REST API (`sirius-api/`)

```
sirius-api/
├── handlers/
│   └── host_handler.go               # HTTP handlers (NEEDS MODIFICATION)
└── routes/
    └── host_routes.go                # Route definitions
```

### Frontend (`sirius-ui/`)

```
sirius-ui/
├── src/
│   ├── pages/
│   │   ├── scanner.tsx               # Network scanner interface
│   │   └── terminal.tsx              # Agent/terminal interface
│   ├── components/
│   │   ├── scanner/                  # Scanner-specific components
│   │   └── EnvironmentDataTable.tsx  # Host data display
│   ├── hooks/
│   │   ├── useScanResults.ts         # Scan result management
│   │   └── useStartScan.ts           # Scan initiation
│   └── types/
│       └── scanTypes.ts              # Type definitions
```

---

## API Endpoints

### Host Management Endpoints

**Base URL**: `http://localhost:9001`

#### Core Endpoints

- **POST `/host`** - Add/update host data
  - Handler: `sirius-api/handlers/host_handler.go:AddHost()`
  - **CRITICAL**: This is where agent data enters the system
- **GET `/host/{ip}`** - Get host details
  - Handler: `sirius-api/handlers/host_handler.go:GetHost()`
- **GET `/host`** - List all hosts
  - Handler: `sirius-api/handlers/host_handler.go:GetAllHosts()`

#### Vulnerability Endpoints

- **GET `/host/vulnerabilities/all`** - Get all vulnerabilities
- **GET `/host/statistics/{ip}`** - Get host statistics
- **GET `/host/severity/{ip}`** - Get vulnerability severity counts

#### Scan Management Endpoints

- **POST `/app/scan`** - Start network scan
  - Initiates network scanner workflow
  - Updates KV store with scan progress

### Request/Response Formats

#### Host Submission Format

```json
{
  "hid": "a1b2c3d4e5f6",
  "os": "Windows",
  "osversion": "Server 2003",
  "ip": "192.168.50.13",
  "hostname": "lab-server",
  "ports": [
    {
      "id": 445,
      "protocol": "tcp",
      "state": "closed"
    }
  ],
  "vulnerabilities": [
    {
      "vid": "CVE-2021-34527",
      "description": "Mock Data",
      "title": ""
    }
  ],
  "cpe": ["cpe:2.3:o:canonical:ubuntu:22.04"],
  "users": ["alice", "bob"],
  "notes": ["Initial setup completed"]
}
```

---

## Frontend Interfaces

### Scanner Interface (`scanner.tsx`)

**Location**: `sirius-ui/src/pages/scanner.tsx`

**Purpose**: Network scanning interface and results display

**Key Features**:

- Target specification (IP, CIDR, ranges)
- Scan template selection (quick, comprehensive, etc.)
- Live scan progress monitoring
- Host and vulnerability result tables
- Report generation functionality

**Components Used**:

- `ScanForm` - Target input and scan initiation
- `ScanStatus` - Live scan progress display
- `EnvironmentDataTable` - Host results
- `VulnerabilityTable` - Vulnerability results

### Terminal Interface (`terminal.tsx`)

**Location**: `sirius-ui/src/pages/terminal.tsx`

**Purpose**: Agent-based terminal interface

**Key Features**:

- Terminal emulation for agent commands
- Agent connectivity management
- Scan command execution
- Result submission to API

**Components Used**:

- `TerminalWrapper` - Main terminal interface
- `DynamicTerminal` - Terminal emulation logic

### Data Flow in Frontend

1. **Network Scan**: User initiates via scanner.tsx → API call → Database update
2. **Agent Scan**: User executes via terminal.tsx → Agent execution → API submission → Database update
3. **Result Display**: Both interfaces query same API endpoints for unified view

---

## Libraries and Dependencies

### Go Dependencies (`go-api/go.mod`)

**Core Framework**:

- `gorm.io/gorm` - ORM for database operations
- `gorm.io/driver/postgres` - PostgreSQL driver

**Database and Storage**:

- PostgreSQL - Primary data storage
- Valkey - KV store for scan progress

**External APIs**:

- NVD API - CVE data enrichment

### Scanner Dependencies

**Network Scanner Tools**:

- `nmap` - Network mapper and vulnerability scanner
- `rustscan` - Fast port discovery
- `naabu` - Port scanning library

**Agent Framework**:

- PowerShell - Windows script execution
- Various package managers - Software inventory

### Frontend Dependencies (`sirius-ui/package.json`)

**Core Framework**:

- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

**UI Components**:

- `tailwindcss` - Styling framework
- `@shadcn/ui` - Component library
- Custom component system

**State Management**:

- `@tanstack/react-query` - Data fetching and caching
- `trpc` - Type-safe API calls

---

## Proposed Solution Architecture

### Phase 1: Enhanced Database Schema

#### New Junction Table Structure

```go
type HostVulnerability struct {
    gorm.Model
    HostID          uint
    VulnerabilityID uint
    Source          string    `json:"source"`          // "nmap", "agent", "manual"
    SourceVersion   string    `json:"source_version"`  // Scanner version
    FirstSeen       time.Time `json:"first_seen"`
    LastSeen        time.Time `json:"last_seen"`
    Status          string    `json:"status"`          // "active", "resolved"
    Confidence      float64   `json:"confidence"`      // 0.0-1.0
    Port            *int      `json:"port,omitempty"`  // Specific port
    Notes           string    `json:"notes,omitempty"`
}
```

### Phase 2: Source-Aware API

#### New Function Signatures

```go
func AddHostWithSource(host sirius.Host, source ScanSource) error
func UpdateVulnerabilitiesWithSource(hostID uint, vulns []sirius.Vulnerability, source ScanSource) error
func GetHostWithSources(ip string) (HostWithSources, error)
```

### Phase 3: Scanner Integration

#### Modified Entry Points

- **Network Scanner**: Update `app-scanner/internal/scan/manager.go` to use source-aware functions
- **Agent Scanner**: Update `app-agent/internal/commands/scan/scan_command.go` to include source metadata
- **API Handlers**: Update `sirius-api/handlers/host_handler.go` to determine and pass source information

### Phase 4: Frontend Enhancements

#### Enhanced Display Components

- Source attribution in vulnerability tables
- Historical timeline views
- Source filtering and comparison
- Confidence-based result ranking

---

## Implementation Priority

### Critical Files to Modify

1. **`go-api/sirius/postgres/models/host.go`** - Add source tracking fields
2. **`go-api/sirius/host/host.go`** - Replace Association.Replace() with source-aware logic
3. **`app-scanner/internal/scan/manager.go`** - Add source metadata to database calls
4. **`sirius-api/handlers/host_handler.go`** - Add source determination logic
5. **Database migration** - Update schema and migrate existing data

### Development Phases

1. **Phase 1** (Week 1): Database schema and core API changes
2. **Phase 2** (Week 2): Scanner integration and source attribution
3. **Phase 3** (Week 3): Frontend enhancements and testing
4. **Phase 4** (Week 4): Migration, documentation, and deployment

---

## Risk Assessment

### High Risk Areas

1. **Data Migration**: Existing data needs proper source attribution
2. **Backward Compatibility**: Existing API clients must continue working
3. **Performance Impact**: Additional fields and queries may affect performance
4. **Testing Coverage**: Multiple scan sources need comprehensive testing

### Mitigation Strategies

1. **Gradual Migration**: Phase implementation with backward compatibility
2. **Comprehensive Testing**: Test all scan source combinations
3. **Performance Monitoring**: Track query performance during development
4. **Rollback Plan**: Maintain ability to revert changes if needed

---

This documentation serves as the foundation for implementing source-tagged scan history in the Sirius vulnerability management system. All identified files, functions, and data flows have been mapped to enable efficient development and maintenance of the enhanced system.
