# Implementation Plan: Scan Source Tracking & History System

## Project Overview

This implementation plan addresses the critical issue where multiple scan sources (network scanner, agent scanner, manual submissions) overwrite each other's results in the database. The solution implements source-tagged scan history to maintain comprehensive vulnerability data from all sources.

## Goals

1. **Eliminate Data Loss**: Prevent scan results from different sources overwriting each other
2. **Source Attribution**: Track which scanner/tool reported each finding
3. **Historical Tracking**: Maintain timeline of when vulnerabilities were first/last seen
4. **Holistic View**: Present unified vulnerability assessment combining all sources
5. **Backward Compatibility**: Ensure existing API consumers continue working

## Technical Approach

### Database Schema Evolution

**Current Problem**: Junction tables use `Association(...).Replace()` which completely overwrites all relationships, losing data from other sources.

**Solution**: Enhanced junction tables with source attribution and temporal tracking.

#### New Schema Design

```go
// Enhanced junction table with source tracking
type HostVulnerability struct {
    gorm.Model
    HostID          uint      `json:"host_id"`
    VulnerabilityID uint      `json:"vulnerability_id"`
    Source          string    `json:"source"`          // "nmap", "agent", "manual", "rustscan"
    SourceVersion   string    `json:"source_version"`  // Scanner version/build
    FirstSeen       time.Time `json:"first_seen"`      // When first detected
    LastSeen        time.Time `json:"last_seen"`       // When last confirmed
    Status          string    `json:"status"`          // "active", "resolved", "false_positive"
    Confidence      float64   `json:"confidence"`      // 0.0-1.0 confidence score
    Port            *int      `json:"port,omitempty"`  // Specific port if applicable
    ServiceInfo     string    `json:"service_info,omitempty"` // Service details
    Notes           string    `json:"notes,omitempty"` // Additional context
}

// Similarly for ports
type HostPort struct {
    gorm.Model
    HostID        uint      `json:"host_id"`
    PortID        uint      `json:"port_id"`
    Source        string    `json:"source"`
    SourceVersion string    `json:"source_version"`
    FirstSeen     time.Time `json:"first_seen"`
    LastSeen      time.Time `json:"last_seen"`
    Status        string    `json:"status"`
    Notes         string    `json:"notes,omitempty"`
}
```

### API Architecture Changes

#### Source-Aware Data Structures

```go
type ScanSource struct {
    Name    string `json:"name"`    // "nmap", "agent", "rustscan", "manual"
    Version string `json:"version"` // Tool version
    Config  string `json:"config"`  // Scan configuration used
}

type SourcedHost struct {
    sirius.Host
    Source ScanSource `json:"source"`
}
```

#### New Core Functions

Replace the problematic `Association(...).Replace()` calls with source-aware operations:

```go
// Core function signatures
func AddHostWithSource(host sirius.Host, source ScanSource) error
func UpdateVulnerabilitiesWithSource(hostID uint, vulns []sirius.Vulnerability, source ScanSource) error
func UpdatePortsWithSource(hostID uint, ports []sirius.Port, source ScanSource) error
func GetHostWithSources(ip string) (HostWithSources, error)
func GetVulnerabilityHistory(hostID uint, vulnID uint) ([]SourceAttribution, error)
```

### Scanner Integration Strategy

#### Network Scanner (`app-scanner/`)

**File**: `app-scanner/internal/scan/manager.go`

**Changes**:

- Add source metadata to all database calls
- Include scanner version and configuration details
- Update result processing to use source-aware API functions

```go
// Example integration
source := ScanSource{
    Name:    "nmap",
    Version: getNmapVersion(),
    Config:  scanConfig.String(),
}
err := host.AddHostWithSource(discoveredHost, source)
```

#### Agent Scanner (`app-agent/`)

**File**: `app-agent/internal/commands/scan/scan_command.go`

**Changes**:

- Include agent version and scan type in API submissions
- Modify HTTP POST payload to include source information
- Update result structures to carry source metadata

#### API Handlers (`sirius-api/`)

**File**: `sirius-api/handlers/host_handler.go`

**Changes**:

- Detect source information from request headers or payload
- Route to appropriate source-aware functions
- Maintain backward compatibility for existing clients

### Database Migration Strategy

Since existing data preservation is not required, we'll implement a clean migration:

1. **Schema Update**: Add new fields to junction tables
2. **Index Creation**: Add indexes for efficient source-based queries
3. **Data Migration**: Mark existing data with "unknown" source
4. **Constraint Addition**: Add foreign key constraints and validation

### Frontend Enhancement Plan

#### Enhanced Display Components

**Vulnerability Tables**:

- Source attribution columns
- Historical timeline view
- Source filtering capabilities
- Confidence-based sorting

**Host Details Views**:

- Per-source vulnerability breakdown
- Scanner coverage matrix
- Historical scan timeline

#### New API Endpoints for Frontend

```
GET /host/{ip}/sources           - Get all sources that scanned this host
GET /host/{ip}/history          - Get scan history timeline
GET /vulnerability/{id}/sources  - Get which sources reported this CVE
GET /sources/coverage           - Get coverage statistics per source
```

## Implementation Phases

### Phase 1: Core Database & API Changes (Week 1)

**Priority**: High
**Goal**: Fix the data overwriting issue

1. Update database schema with source tracking fields
2. Create database migration scripts
3. Implement source-aware core functions
4. Replace `Association(...).Replace()` calls
5. Add comprehensive unit tests

### Phase 2: Scanner Integration (Week 2)

**Priority**: High
**Goal**: Integrate source attribution into scanners

1. Update network scanner to use source-aware API
2. Update agent scanner to include source metadata
3. Modify API handlers for source detection
4. Implement backward compatibility layer
5. Add integration tests

### Phase 3: Frontend Enhancements (Week 3)

**Priority**: Medium
**Goal**: Present source-attributed data to users

1. Create enhanced vulnerability display components
2. Add source filtering and comparison features
3. Implement historical timeline views
4. Update existing pages to show source information
5. Add source coverage dashboards

### Phase 4: Testing & Documentation (Week 4)

**Priority**: Medium
**Goal**: Ensure reliability and maintainability

1. Comprehensive end-to-end testing
2. Performance testing with multiple sources
3. Documentation updates
4. Deployment and monitoring setup

## Risk Mitigation

### Technical Risks

1. **Performance Impact**: Additional fields and joins may slow queries
   - _Mitigation_: Add strategic indexes, implement query optimization
2. **Backward Compatibility**: Existing API clients may break
   - _Mitigation_: Implement compatibility layer, gradual deprecation
3. **Data Consistency**: Complex source attribution logic may introduce bugs
   - _Mitigation_: Comprehensive testing, atomic transactions

### Development Risks

1. **Scope Creep**: Feature complexity may expand during development
   - _Mitigation_: Clear phase boundaries, regular stakeholder reviews
2. **Testing Complexity**: Multiple sources create exponential test scenarios
   - _Mitigation_: Automated test suites, containerized test environments

## Success Metrics

### Technical Metrics

- Zero data loss incidents between scan sources
- All vulnerabilities properly attributed to sources
- Response time degradation < 20% after source tracking
- 100% API backward compatibility maintained

### Functional Metrics

- Users can see which scanner found each vulnerability
- Historical vulnerability tracking works across all sources
- Unified vulnerability view combines all source data
- Source-specific filtering and reporting functions

### Quality Metrics

- Unit test coverage > 85% for new functionality
- Integration test coverage for all scanner combinations
- End-to-end testing validates complete workflows
- Documentation covers all new features and APIs

## Dependencies

### Internal Dependencies

- Database migration capabilities
- Scanner development environments
- Frontend development stack
- Testing infrastructure

### External Dependencies

- PostgreSQL database availability
- Scanner tool compatibility (nmap, rustscan, etc.)
- Agent deployment and connectivity
- Container orchestration for testing

## Rollback Strategy

If critical issues arise during implementation:

1. **Phase 1 Rollback**: Revert database schema, restore original `Association(...).Replace()` logic
2. **Phase 2 Rollback**: Disable source-aware scanner calls, use legacy API endpoints
3. **Phase 3 Rollback**: Hide source attribution UI, revert to original display components
4. **Data Recovery**: Full database backup before each phase, automated restore procedures

## Post-Implementation

### Monitoring

- Database query performance metrics
- API response time monitoring
- Source attribution accuracy tracking
- User adoption of new features

### Maintenance

- Regular source attribution data quality checks
- Scanner version tracking and updates
- Historical data cleanup and archival
- Performance optimization based on usage patterns

---

This implementation plan provides a structured approach to solving the scan result overwriting issue while maintaining system reliability and user experience. The phased approach allows for incremental delivery and risk management throughout the development process.
