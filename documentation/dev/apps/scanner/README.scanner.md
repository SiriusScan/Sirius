---
title: "Sirius Scanner - Vulnerability Scanning Engine"
description: "Comprehensive documentation for the Sirius vulnerability scanning engine"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["scanner", "vulnerability", "nmap", "nse", "go", "rabbitmq"]
categories: ["backend", "security", "scanning"]
difficulty: "advanced"
prerequisites: ["Go 1.23+", "Docker", "RabbitMQ", "Nmap"]
related_docs:
  - "documentation/dev/architecture/README.architecture.md"
  - "documentation/dev/README.development.md"
dependencies:
  - "../minor-projects/app-scanner"
  - "../minor-projects/go-api"
  - "../minor-projects/sirius-nse"
llm_context: "high"
search_keywords:
  [
    "scanner",
    "vulnerability",
    "nmap",
    "nse",
    "rabbitmq",
    "valkey",
    "scanning-engine",
  ]
---

# Sirius Scanner - Vulnerability Scanning Engine

## Overview

Sirius Scanner is a sophisticated, modular vulnerability scanning engine that orchestrates multiple security scanning tools (Nmap, RustScan, Naabu) through a message-driven architecture. Built in Go, it processes scan requests from RabbitMQ, executes multi-phase security assessments, and enriches vulnerability data with NVD information.

**Key Features:**

- **Message-Driven Architecture**: RabbitMQ-based scan request processing
- **Multi-Phase Scanning**: Enumeration → Discovery → Vulnerability assessment
- **Concurrent Processing**: Worker pool pattern for parallel target scanning
- **NSE Script Management**: Git-based synchronization with curated script repository
- **Template System**: Pre-configured and custom scan templates
- **Source Attribution**: Comprehensive tracking of scan origins and configurations
- **Real-Time Updates**: ValKey integration for live scan progress monitoring

**Repository Location:** `../minor-projects/app-scanner`

---

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Scanning Strategies](#scanning-strategies)
3. [NSE Script Management](#nse-script-management)
4. [Template System](#template-system)
5. [Scan Message Format](#scan-message-format)
6. [Target Processing](#target-processing)
7. [Source Attribution System](#source-attribution-system)
8. [State Management](#state-management)
9. [Docker Integration](#docker-integration)
10. [Configuration Files](#configuration-files)
11. [Development Workflow](#development-workflow)
12. [Key Files Reference](#key-files-reference)

---

## Core Architecture

### Message-Driven Design

The scanner operates as a **RabbitMQ consumer**, listening on the `scan` queue for incoming scan requests. This design enables:

- **Asynchronous Processing**: Scans don't block the API
- **Load Distribution**: Multiple scanner instances can consume from the same queue
- **Fault Tolerance**: Failed scans can be retried without data loss
- **Priority Handling**: Scan requests include priority levels (1-5)

**Entry Point:**

```go
// main.go
func main() {
    scanManager := scan.NewScanManager(kvStore, toolFactory, scanUpdater)
    scanManager.ListenForScans() // Blocks, listening for RabbitMQ messages
    select {} // Keep service running
}
```

### Multi-Phase Scanning Workflow

Scans proceed through up to three phases based on `scan_types` configuration:

```
┌─────────────────┐
│  Enumeration    │  Naabu: Fast port enumeration (SYN scan)
│  (Optional)     │  Output: List of open ports
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Discovery      │  RustScan: Rapid host/port discovery
│  (Optional)     │  Output: Live hosts with open ports
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vulnerability  │  Nmap + NSE: Deep vulnerability scanning
│  (Required)     │  Output: CVEs, service versions, OS detection
└─────────────────┘
```

**Phase Selection:**

```json
{
  "options": {
    "scan_types": ["enumeration", "discovery", "vulnerability"]
  }
}
```

### Worker Pool Pattern

The scanner uses a **concurrent worker pool** (default: 10 workers) to process multiple targets simultaneously:

```go
// internal/scan/worker_pool.go
type WorkerPool struct {
    workerCount int
    taskQueue   chan ScanTask
    manager     *ScanManager
}

// Each worker runs in its own goroutine
func (wp *WorkerPool) worker(ctx context.Context, id int) {
    for {
        select {
        case task := <-wp.taskQueue:
            wp.manager.scanIP(task.IP) // Execute scan
        case <-ctx.Done():
            return
        }
    }
}
```

**Benefits:**

- **Parallel Execution**: Scan multiple IPs concurrently
- **Resource Control**: Limit concurrent scans to prevent system overload
- **Graceful Shutdown**: Context-based cancellation

### Strategy Pattern

The scanner implements the **Strategy Pattern** for pluggable scan tools:

```go
// internal/scan/strategies.go
type ScanStrategy interface {
    Execute(target string) (sirius.Host, error)
}

// Implementations:
type NaabuStrategy struct { ... }      // Port enumeration
type RustScanStrategy struct { ... }   // Discovery
type NmapStrategy struct { ... }       // Vulnerability scanning
```

**Advantages:**

- **Extensibility**: Add new scanning tools without modifying core logic
- **Testability**: Mock strategies for unit testing
- **Flexibility**: Swap implementations based on requirements

### Factory Pattern

The `ScanToolFactory` dynamically creates appropriate strategies:

```go
// internal/scan/factory.go
func (f *ScanToolFactory) CreateTool(toolType string) ScanStrategy {
    switch toolType {
    case "enumeration":
        return &NaabuStrategy{...}
    case "discovery":
        return &RustScanStrategy{}
    case "vulnerability":
        return &NmapStrategy{...}
    }
}
```

---

## Scanning Strategies

### NaabuStrategy (Port Enumeration)

**Purpose:** Fast, accurate port enumeration using ProjectDiscovery's Naabu.

**Technology:** SYN-based port scanning (requires root/CAP_NET_RAW)

**Configuration:**

```go
type NaabuStrategy struct {
    Ports   string // Port range (e.g., "1-65535", "80,443,8080")
    Retries int    // Number of retry attempts
}
```

**Implementation Details:**

- Uses `github.com/projectdiscovery/naabu/v2` library
- Default timeout: 5 seconds per host
- Returns error `ErrHostDown` if no open ports found
- Outputs `sirius.Host` with populated `Ports` array

**Example Usage:**

```go
strategy := &NaabuStrategy{
    Ports:   "1-10000",
    Retries: 3,
}
host, err := strategy.Execute("192.168.1.100")
// host.Ports: [{ID: 80, Protocol: "tcp", State: "open"}, ...]
```

**When to Use:**

- Need comprehensive port enumeration
- Scanning large port ranges (1-65535)
- Require retry logic for unstable networks
- Want detailed port state information

### RustScanStrategy (Discovery)

**Purpose:** Ultra-fast port discovery for identifying live hosts.

**Technology:** Adaptive multi-threaded port scanning (RustScan binary)

**Configuration:**

```go
type RustScanStrategy struct {
    // Uses default RustScan settings
    // Automatically adjusts thread count based on available resources
}
```

**Implementation Details:**

- Executes `rustscan` binary via `exec.Command`
- Parses output to extract open ports
- Filters results: hosts with no open ports are skipped
- Much faster than Nmap for initial discovery (5-20x speedup)

**Example Usage:**

```go
strategy := &RustScanStrategy{}
host, err := strategy.Execute("192.168.1.100")
// host.Ports: [{ID: 22, ...}, {ID: 80, ...}, {ID: 443, ...}]
```

**When to Use:**

- Scanning large IP ranges (entire subnets)
- Need rapid feedback on live hosts
- Initial reconnaissance phase
- Time-sensitive assessments

### NmapStrategy (Vulnerability Scanning)

**Purpose:** Deep vulnerability assessment with NSE script execution.

**Technology:** Nmap with NSE (Nmap Scripting Engine) for CVE detection

**Configuration:**

```go
type NmapStrategy struct {
    Protocols  []string // Legacy: protocol-based selection (e.g., ["smb", "http"])
    ScriptList []string // Explicit script names (overrides Protocols)
}
```

**Implementation Details:**

- **Script Selection:**

  - **Template-based**: Uses `EnabledScripts` from template
  - **Protocol-based**: Selects scripts matching protocols (smb, http, ssh, ftp, rdp)
  - **Wildcard**: `["*"]` runs all available NSE scripts

- **Nmap Command Construction:**

```bash
nmap -T4 -sV -Pn -p <ports> --script <scripts> --script-args-file <args.txt> <target> -oX -
```

- **CVE Extraction:** Parses Nmap XML output for CVE patterns
- **Vulnerability Enrichment:** Fetches CVE details from NVD API
- **Fallback Mechanism:** If script errors occur, retries with minimal safe scripts

**Example Usage:**

```go
// Template-based (recommended)
strategy := &NmapStrategy{
    ScriptList: []string{"vulners", "smb-vuln-ms17-010", "http-shellshock"},
}

// Protocol-based
strategy := &NmapStrategy{
    Protocols: []string{"smb", "http"},
}

host, err := strategy.Execute("192.168.1.100")
// host.Vulnerabilities: [{VID: "CVE-2017-0143", RiskScore: 9.3, ...}, ...]
```

**Script Processing:**

1. **Execution**: Nmap runs selected NSE scripts against target
2. **Parsing**: Extract structured data from script output
3. **CVE Detection**: Regex matching for `CVE-YYYY-NNNNN` patterns
4. **Enrichment**: Query NVD API for descriptions, CVSS scores
5. **Deduplication**: Remove duplicate CVEs from different scripts

**Fallback Scan:**

If NSE scripts fail (e.g., script syntax errors), scanner automatically retries with minimal safe scripts:

```go
safeScripts := []string{"banner", "http-title", "ssl-cert"}
```

**When to Use:**

- Deep security assessment required
- Need CVE identification
- Service version detection
- OS fingerprinting
- Protocol-specific vulnerability checks

---

## NSE Script Management

The scanner maintains a curated collection of NSE scripts via the `sirius-nse` repository.

### Repository Management (`internal/nse/repo.go`)

**Purpose:** Git-based synchronization of NSE scripts.

**Repository URL:** `https://github.com/SiriusScan/sirius-nse.git`

**Local Path:** `/opt/sirius/nse/sirius-nse` (in Docker container)

**Operations:**

```go
type RepoManager struct {
    BasePath string // /opt/sirius/nse/sirius-nse
    RepoURL  string // GitHub repository
    gitOps   GitOperations
}

// Ensure repository exists and is up-to-date
func (rm *RepoManager) EnsureRepo() error {
    if !rm.isGitRepo() {
        // Clone on first run
        return rm.gitOps.Clone(rm.RepoURL, rm.BasePath)
    }
    // Update existing repository
    return rm.updateRepo()
}

// Update: fetch + reset to origin/main
func (rm *RepoManager) updateRepo() error {
    rm.gitOps.Fetch(rm.BasePath)
    rm.gitOps.Reset(rm.BasePath) // Hard reset to origin/main
    return nil
}
```

**Sync Timing:**

- **Startup**: Syncs when `ScanManager` initializes
- **Before Scans**: Automatic sync before first scan (via `ListenForScans`)
- **Manual**: Can be triggered via management API (future)

**Symlink Strategy:**

Nmap's script directory is symlinked to sirius-nse:

```dockerfile
# Dockerfile
RUN ln -sf /opt/sirius/nse/sirius-nse/scripts /usr/local/share/nmap/scripts
```

This ensures **only curated scripts** are available, preventing accidental execution of default Nmap scripts.

### Script Selection (`internal/nse/script_selector.go`)

**Purpose:** Select appropriate NSE scripts based on protocols or explicit list.

**Manifest Structure:**

```json
{
  "version": "1.0",
  "scripts": [
    {
      "name": "vulners",
      "category": "vuln",
      "protocols": ["*"]
    },
    {
      "name": "smb-vuln-ms17-010",
      "category": "vuln",
      "protocols": ["smb"]
    }
  ]
}
```

**Script Selection Logic:**

```go
type ScriptSelector struct {
    manifest *Manifest
    blacklist map[string]bool
}

// Build Nmap --script flag
func (ss *ScriptSelector) BuildNmapScriptFlag(protocols ...string) (string, error) {
    if len(protocols) == 1 && protocols[0] == "*" {
        // Return all non-blacklisted scripts
        return ss.getAllScripts(), nil
    }

    // Filter by protocols
    scripts := []string{}
    for _, script := range ss.manifest.Scripts {
        if ss.matchesProtocol(script, protocols) && !ss.isBlacklisted(script.Name) {
            scripts = append(scripts, script.Name)
        }
    }

    return strings.Join(scripts, ","), nil
}
```

**Protocol Matching:**

- `*` (wildcard): Script applies to all protocols
- Exact match: `["smb"]` matches scripts with `protocols: ["smb"]`
- Multiple protocols: `["smb", "http"]` matches scripts with either protocol

**Example:**

```go
selector := nse.NewScriptSelector(manifest)
scriptFlag, _ := selector.BuildNmapScriptFlag("smb", "http")
// Result: "vulners,smb-vuln-ms17-010,smb-os-discovery,http-title,http-enum,..."
```

### Script Blacklist (`internal/nse/script_blacklist.go`)

**Purpose:** Exclude problematic or slow scripts.

**Blacklist Criteria:**

- **False Positives**: Scripts with high FP rates
- **Performance**: Extremely slow scripts (>5 minutes per host)
- **Stability**: Scripts that crash or hang frequently
- **Compatibility**: Scripts incompatible with our environment

**Example Blacklist:**

```go
var DefaultBlacklist = map[string]bool{
    "broadcast-dhcp-discover": true,  // Sends broadcasts
    "firewalk":                true,  // Very slow
    "http-slowloris-check":    true,  // DoS risk
}
```

**Blacklist Management:**

- Centrally managed in `script_blacklist.go`
- Can be overridden via environment variables (future)
- Logged when scripts are excluded

### Sync Manager (`internal/nse/sync.go`)

**Purpose:** Coordinate NSE repository updates with scan operations.

**Responsibilities:**

1. **Pre-Scan Sync**: Ensure scripts are up-to-date before scanning
2. **Concurrency Control**: Prevent multiple simultaneous syncs
3. **Error Handling**: Log sync failures but don't block scans
4. **Context Awareness**: Respect context cancellation

**Implementation:**

```go
type SyncManager struct {
    repoManager *RepoManager
    kvStore     store.KVStore
    lastSync    time.Time
    syncMutex   sync.Mutex
}

func (sm *SyncManager) Sync(ctx context.Context) error {
    sm.syncMutex.Lock()
    defer sm.syncMutex.Unlock()

    // Skip if recently synced (within 1 hour)
    if time.Since(sm.lastSync) < time.Hour {
        return nil
    }

    // Perform sync
    if err := sm.repoManager.EnsureRepo(); err != nil {
        return fmt.Errorf("failed to sync NSE repo: %w", err)
    }

    sm.lastSync = time.Now()
    return nil
}
```

**Sync Strategy:**

- **Cooldown Period**: 1 hour between syncs
- **Non-Blocking**: Sync failures logged but don't prevent scans
- **Startup Sync**: Always sync on scanner startup

---

## Template System

Templates provide **pre-configured scan profiles** for common use cases.

### Template Structure

```go
type Template struct {
    ID             string          // Unique identifier (e.g., "high-risk")
    Name           string          // Human-readable name
    Description    string          // Usage description
    Type           TemplateType    // SystemTemplate or CustomTemplate
    EnabledScripts []string        // NSE scripts to run
    ScanOptions    TemplateOptions // Default scan options
    CreatedAt      time.Time
    UpdatedAt      time.Time
}

type TemplateOptions struct {
    ScanTypes    []string // ["enumeration", "discovery", "vulnerability"]
    PortRange    string   // "1-10000"
    Aggressive   bool     // Enable aggressive scanning
    MaxRetries   int      // Retry attempts
    Parallel     bool     // Parallel target scanning
    ExcludePorts []string // Ports to skip
}
```

### System Templates

**Pre-defined templates initialized on startup:**

#### 1. `high-risk` - Focused Critical Vulnerability Scan

**Purpose:** Balanced scan focusing on high-impact vulnerabilities.

**Scripts:** 10 carefully selected scripts

```go
EnabledScripts: []string{
    "vulners",                // CVE detection (highest value)
    "smb-vuln-ms17-010",      // EternalBlue
    "http-shellshock",        // Shellshock vulnerability
    "http-vuln-cve2017-5638", // Apache Struts RCE
    "banner",                 // Service identification
    "http-title",             // HTTP identification
    "ssl-cert",               // SSL certificate info
    "http-enum",              // HTTP path enumeration
    "smb-os-discovery",       // SMB OS detection
    "ftp-anon",               // Anonymous FTP access
}

ScanOptions: {
    ScanTypes:  []string{"enumeration", "discovery", "vulnerability"},
    PortRange:  "1-10000",
    Aggressive: true,
    MaxRetries: 3,
    Parallel:   true,
}
```

**Use Case:** Default scan for most security assessments.

#### 2. `all` - Comprehensive Scan

**Purpose:** Exhaustive scanning with all available NSE scripts.

**Scripts:** All non-blacklisted scripts (wildcard)

```go
EnabledScripts: []string{"*"} // Special marker

ScanOptions: {
    ScanTypes:  []string{"enumeration", "discovery", "vulnerability"},
    PortRange:  "1-65535",
    Aggressive: true,
    MaxRetries: 3,
    Parallel:   false, // Sequential for thoroughness
}
```

**Use Case:** Deep penetration testing, compliance audits.

**Warning:** Can take hours per host. Use sparingly.

#### 3. `quick` - Fast Scan

**Purpose:** Rapid assessment with essential scripts.

**Scripts:** 3 lightweight scripts

```go
EnabledScripts: []string{
    "vulners",    // CVE detection
    "banner",     // Service identification
    "http-title", // HTTP identification
}

ScanOptions: {
    ScanTypes:  []string{"enumeration", "vulnerability"},
    PortRange:  "top500Ports", // Most common 500 ports
    Aggressive: false,
    MaxRetries: 2,
    Parallel:   true,
}
```

**Use Case:** Initial reconnaissance, time-sensitive scans.

### Custom Templates

**Users can create custom templates via UI (future) or API.**

**Creation Example:**

```go
template := &Template{
    ID:          "web-app-scan",
    Name:        "Web Application Scan",
    Description: "Focused scan for web application vulnerabilities",
    Type:        CustomTemplate,
    EnabledScripts: []string{
        "vulners",
        "http-enum",
        "http-shellshock",
        "http-sql-injection",
        "ssl-cert",
    },
    ScanOptions: TemplateOptions{
        ScanTypes:  []string{"discovery", "vulnerability"},
        PortRange:  "80,443,8080,8443",
        Aggressive: false,
        MaxRetries: 2,
        Parallel:   true,
    },
}

templateManager.CreateTemplate(ctx, template)
```

**Template Operations:**

```go
// Get template
template, err := templateManager.GetTemplate(ctx, "high-risk")

// List all templates
templates, err := templateManager.ListTemplates(ctx)

// Update custom template (system templates are immutable)
templateManager.UpdateTemplate(ctx, template)

// Delete custom template
templateManager.DeleteTemplate(ctx, "my-template")
```

### Template Resolution

**When a scan message includes `template_id`, the scanner:**

1. **Fetches Template**: Retrieve from ValKey
2. **Applies Defaults**: Use template's `EnabledScripts` and `ScanOptions`
3. **Merges User Options**: User-provided options override template defaults
4. **Resolves Scripts**: Convert template script list to Nmap `--script` flag

**Resolution Logic:**

```go
func (sm *ScanManager) handleMessage(msg string) {
    var scanMsg ScanMessage
    json.Unmarshal([]byte(msg), &scanMsg)

    if scanMsg.Options.TemplateID != "" {
        template, _ := sm.templateManager.GetTemplate(ctx, scanMsg.Options.TemplateID)

        // User options override template defaults
        if scanMsg.Options.PortRange == "" {
            scanMsg.Options.PortRange = template.ScanOptions.PortRange
        }
        if len(scanMsg.Options.ScanTypes) == 0 {
            scanMsg.Options.ScanTypes = template.ScanOptions.ScanTypes
        }
        // ... merge other options
    }

    sm.processTarget(scanMsg.Targets[0])
}
```

**Priority:** User Options > Template Defaults > System Defaults

---

## Scan Message Format

Scan requests are **JSON messages** sent to the `scan` RabbitMQ queue.

### Message Structure

```go
type ScanMessage struct {
    ID          string      // Unique scan identifier
    Targets     []Target    // Targets to scan
    Options     ScanOptions // Scan configuration
    Priority    int         // 1 (low) to 5 (high)
    CallbackURL string      // Optional webhook on completion
}

type Target struct {
    Value   string     // IP, range, CIDR, or hostname
    Type    TargetType // Target type identifier
    Timeout int        // Per-target timeout (seconds, optional)
}

type TargetType string
const (
    SingleIP    TargetType = "single_ip"    // 192.168.1.1
    IPRange     TargetType = "ip_range"     // 192.168.1.1-192.168.1.254
    CIDR        TargetType = "cidr"         // 192.168.1.0/24
    DNSName     TargetType = "dns_name"     // example.com
    DNSWildcard TargetType = "dns_wildcard" // *.example.com (TODO)
)

type ScanOptions struct {
    TemplateID   string   // Template to use (optional)
    PortRange    string   // "1-65535", "80,443,8080"
    Aggressive   bool     // Aggressive scanning mode
    ExcludePorts []string // Ports to skip
    ScanTypes    []string // ["enumeration", "discovery", "vulnerability"]
    MaxRetries   int      // Retry attempts
    Parallel     bool     // Parallel target scanning
}
```

### Example Messages

#### Simple Single-IP Scan

```json
{
  "id": "scan-001",
  "targets": [
    {
      "value": "192.168.1.100",
      "type": "single_ip"
    }
  ],
  "options": {
    "template_id": "high-risk",
    "scan_types": ["vulnerability"]
  },
  "priority": 3
}
```

#### CIDR Range with Custom Options

```json
{
  "id": "scan-002",
  "targets": [
    {
      "value": "192.168.1.0/24",
      "type": "cidr"
    }
  ],
  "options": {
    "port_range": "1-10000",
    "aggressive": true,
    "scan_types": ["discovery", "vulnerability"],
    "max_retries": 3,
    "parallel": true
  },
  "priority": 4
}
```

#### Multi-Target Scan with Template

```json
{
  "id": "scan-003",
  "targets": [
    {
      "value": "192.168.1.1",
      "type": "single_ip"
    },
    {
      "value": "192.168.1.100-192.168.1.110",
      "type": "ip_range"
    },
    {
      "value": "example.com",
      "type": "dns_name"
    }
  ],
  "options": {
    "template_id": "quick",
    "scan_types": ["enumeration", "vulnerability"]
  },
  "priority": 2,
  "callback_url": "https://api.example.com/scan-complete"
}
```

### Validation Rules

**Required Fields:**

- `id`: Must be unique (recommended: UUID)
- `targets`: At least one target
- `options.scan_types`: At least one scan type
- `priority`: 1-5 (inclusive)

**Optional Fields:**

- `template_id`: If omitted, uses system defaults
- `callback_url`: If provided, webhook POST on completion

**Validation Errors:**

```go
func (sm *ScanManager) validateScanMessage(msg *ScanMessage) error {
    if len(msg.Targets) == 0 {
        return fmt.Errorf("no targets specified")
    }
    if msg.Priority < 1 || msg.Priority > 5 {
        return fmt.Errorf("invalid priority: must be between 1 and 5")
    }
    return nil
}
```

---

## Target Processing

### Target Type Expansion

The scanner **expands** targets into individual IPs for worker pool processing.

#### Single IP

**Format:** `192.168.1.100`

**Processing:** Direct pass-through

```go
case SingleIP:
    if !validateIP(target.Value) {
        return nil, fmt.Errorf("invalid IP address: %s", target.Value)
    }
    return []string{target.Value}, nil
```

#### IP Range

**Format:** `192.168.1.1-192.168.1.254`

**Processing:** Expand to all IPs in range

```go
case IPRange:
    return expandIPRange(target.Value)
    // Returns: ["192.168.1.1", "192.168.1.2", ..., "192.168.1.254"]
```

**Implementation:**

```go
func expandIPRange(rangeStr string) ([]string, error) {
    parts := strings.Split(rangeStr, "-")
    startIP := net.ParseIP(parts[0])
    endIP := net.ParseIP(parts[1])

    // Iterate from startIP to endIP
    ips := []string{}
    for ip := startIP; !ip.Equal(endIP); ip = incrementIP(ip) {
        ips = append(ips, ip.String())
    }
    return ips, nil
}
```

#### CIDR Block

**Format:** `192.168.1.0/24`

**Processing:** Expand to all IPs in subnet (excluding network/broadcast)

```go
case CIDR:
    if !validateCIDR(target.Value) {
        return nil, fmt.Errorf("invalid CIDR notation: %s", target.Value)
    }
    return expandCIDR(target.Value)
    // Returns: ["192.168.1.1", "192.168.1.2", ..., "192.168.1.254"]
```

**Note:** Skips network address (`.0`) and broadcast address (`.255`)

#### DNS Name

**Format:** `example.com`

**Processing:** DNS resolution to IP(s)

```go
case DNSName:
    ips, err := net.LookupIP(target.Value)
    if err != nil {
        return nil, fmt.Errorf("DNS lookup failed: %v", err)
    }
    result := make([]string, len(ips))
    for i, ip := range ips {
        result[i] = ip.String()
    }
    return result, nil
```

**Handles:**

- Multiple A/AAAA records (returns all IPs)
- IPv4 and IPv6 addresses
- DNS resolution failures (returns error)

#### DNS Wildcard (TODO)

**Format:** `*.example.com`

**Status:** Not yet implemented

**Planned Behavior:**

1. Subdomain enumeration (via DNS brute-force or Certificate Transparency logs)
2. Resolution of discovered subdomains to IPs
3. Deduplication of IPs

### Worker Pool Processing

After expansion, each IP is **enqueued as a task**:

```go
func (sm *ScanManager) processTarget(target Target) {
    targetIPs, err := sm.prepareTarget(target)
    if err != nil {
        log.Printf("Failed to prepare target: %v", err)
        return
    }

    // Add each IP to worker pool queue
    for _, ip := range targetIPs {
        task := ScanTask{
            IP:      ip,
            Options: sm.currentScanOptions,
        }
        sm.workerPool.AddTask(task)
    }
}
```

**Worker Pool Flow:**

```
Target Expansion
       │
       ▼
┌─────────────────┐
│  Task Queue     │
│  (Channel)      │
└────────┬────────┘
         │
         ├─────► Worker 1 ──► scanIP(192.168.1.1)
         ├─────► Worker 2 ──► scanIP(192.168.1.2)
         ├─────► Worker 3 ──► scanIP(192.168.1.3)
         │  ...
         └─────► Worker 10 ─► scanIP(192.168.1.10)
```

---

## Source Attribution System

The scanner implements **comprehensive source attribution** to track scan origins and configurations.

### Purpose

- **Audit Trail**: Who/what/when/how for each scan
- **Debugging**: Troubleshoot scanning issues with full context
- **Compliance**: Demonstrate due diligence in security assessments
- **Analytics**: Understand scanning patterns and effectiveness

### Source Metadata

```go
type ScanSource struct {
    Name    string // Tool name (e.g., "nmap", "rustscan", "naabu")
    Version string // Tool version (e.g., "7.94")
    Config  string // Scan configuration (semicolon-separated key:value pairs)
}
```

### Configuration Tracking

The scanner captures:

**Scan Configuration:**

- `ports`: Port range scanned
- `aggressive`: Aggressive mode enabled
- `types`: Scan types executed
- `exclude`: Excluded ports
- `template`: Template ID used

**System Information:**

- `host`: Hostname of scanning system
- `user`: User running scanner
- `scanner_id`: Unique scan identifier
- `go_version`: Go runtime version

**Example Config String:**

```
ports:1-10000;aggressive:true;types:enumeration,discovery,vulnerability;template:high-risk;host:scanner-prod-01;user:siriususer;scanner_id:scan-abc123;go_version:go1.23.0
```

### Version Detection

Automatically detects scanning tool versions:

```go
func (sm *ScanManager) detectScannerVersion(toolName string) string {
    switch toolName {
    case "nmap":
        output, _ := exec.Command("nmap", "--version").Output()
        // Parse: "Nmap version 7.94 ( https://nmap.org )"
        return extractVersion(output)
    case "rustscan":
        output, _ := exec.Command("rustscan", "--version").Output()
        // Parse: "rustscan 2.1.1"
        return extractVersion(output)
    case "naabu":
        output, _ := exec.Command("naabu", "-version").Output()
        return extractVersion(output)
    }
}
```

### API Submission

Results are submitted via **source-aware API endpoint**:

```go
func (sm *ScanManager) submitHostWithSource(host sirius.Host, toolName string) error {
    source := sm.createScanSource(toolName)

    request := SourcedHostRequest{
        Host:   host,
        Source: source,
    }

    jsonData, _ := json.Marshal(request)
    url := fmt.Sprintf("%s/host/with-source", sm.apiBaseURL)
    resp, _ := http.Post(url, "application/json", bytes.NewBuffer(jsonData))

    return nil
}
```

**API Endpoint:** `POST /host/with-source`

**Request Body:**

```json
{
  "host": {
    "ip": "192.168.1.100",
    "ports": [...],
    "vulnerabilities": [...]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "ports:1-10000;aggressive:true;template:high-risk;host:scanner-01;..."
  }
}
```

### Database Storage

The API stores source attribution in PostgreSQL:

**Schema:**

```sql
CREATE TABLE scan_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    version VARCHAR(50),
    config TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45),
    scan_source_id INTEGER REFERENCES scan_sources(id),
    ...
);
```

This enables queries like:

- "Show all vulnerabilities found by Nmap 7.94"
- "List scans using the 'high-risk' template"
- "Find hosts scanned from scanner-prod-01"

---

## State Management

The scanner maintains **real-time scan state** using two systems:

### ValKey Integration

**Purpose:** Live scan progress tracking for UI display.

**Key Structure:**

```
scan:<scan_id> = {
  "status": "running",
  "start_time": "2025-10-25T10:30:00Z",
  "end_time": null,
  "hosts": ["192.168.1.1", "192.168.1.2", ...],
  "hosts_completed": 45,
  "vulnerabilities": [
    {
      "id": "CVE-2017-0143",
      "severity": "critical",
      "title": "EternalBlue SMB RCE",
      "description": "Remote code execution..."
    }
  ]
}
```

**Update Pattern:**

```go
type ScanUpdater struct {
    kvStore store.KVStore
}

func (su *ScanUpdater) Update(ctx context.Context, updateFn func(*ScanResult) error) error {
    // 1. Get current scan state from ValKey
    current, _ := su.kvStore.GetValue(ctx, "scan:"+scanID)

    // 2. Apply update function
    var scan ScanResult
    json.Unmarshal([]byte(current.Message.Value), &scan)
    updateFn(&scan)

    // 3. Write updated state back to ValKey
    updated, _ := json.Marshal(scan)
    su.kvStore.SetValue(ctx, "scan:"+scanID, string(updated))

    return nil
}
```

**Update Events:**

- **Discovery Complete:** Add host to `hosts` array
- **Host Complete:** Increment `hosts_completed`
- **Vulnerability Found:** Add to `vulnerabilities` array
- **Scan Complete:** Set `status = "completed"`, set `end_time`

**Example Update:**

```go
sm.scanUpdater.Update(ctx, func(scan *ScanResult) error {
    scan.HostsCompleted++
    if scan.HostsCompleted >= len(scan.Hosts) {
        scan.Status = "completed"
        scan.EndTime = time.Now().Format(time.RFC3339)
    }
    return nil
})
```

### Logging System

**Purpose:** Structured audit trail for compliance and debugging.

**Implementation:** RabbitMQ-based logging to `scanner_logs` queue.

**Log Client:**

```go
type LoggingClient struct {
    queueName string // "scanner_logs"
}

func (lc *LoggingClient) LogScanEvent(scanID, eventType, message string, metadata map[string]interface{}) {
    logEntry := map[string]interface{}{
        "timestamp":  time.Now().Format(time.RFC3339),
        "scan_id":    scanID,
        "event_type": eventType,
        "message":    message,
        "metadata":   metadata,
    }

    jsonData, _ := json.Marshal(logEntry)
    queue.Publish("scanner_logs", string(jsonData))
}
```

**Event Types:**

| Event Type            | Description              | Metadata                                     |
| --------------------- | ------------------------ | -------------------------------------------- |
| `scan_initiated`      | Scan request received    | targets_count, priority, template_id         |
| `target_prepared`     | Target expanded to IPs   | target_value, target_type, ips_generated     |
| `host_discovered`     | Live host found          | host_ip, ports, tool                         |
| `tool_execution`      | Scanning tool completed  | tool, duration, success, ports_found         |
| `vulnerability_found` | CVE detected             | host_ip, cve_id, severity, tool              |
| `host_completed`      | All phases done for host | host_ip, vulnerabilities_found               |
| `scan_completed`      | Entire scan finished     | total_hosts, vulnerabilities_found, duration |
| `scan_error`          | Error occurred           | host_ip, error_type, error_message           |

**Example Log Entries:**

```json
// scan_initiated
{
  "timestamp": "2025-10-25T10:30:00Z",
  "scan_id": "scan-abc123",
  "event_type": "scan_initiated",
  "message": "Scan request received",
  "metadata": {
    "targets_count": 3,
    "priority": 4,
    "template_id": "high-risk"
  }
}

// vulnerability_found
{
  "timestamp": "2025-10-25T10:35:22Z",
  "scan_id": "scan-abc123",
  "event_type": "vulnerability_found",
  "message": "CVE detected",
  "metadata": {
    "host_ip": "192.168.1.100",
    "cve_id": "CVE-2017-0143",
    "severity": "critical",
    "tool": "nmap"
  }
}
```

**Log Consumption:**

- **Elasticsearch**: Indexing for search/analytics
- **File**: JSON lines for long-term storage
- **Monitoring**: Real-time alerting on errors

---

## Docker Integration

The scanner runs inside the `sirius-engine` container, which bundles multiple applications.

### Dockerfile Architecture

**Multi-Stage Build:**

```dockerfile
# Stage 1: Builder
FROM golang:1.23-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    git ca-certificates build-essential libpcap-dev

# Clone and build app-scanner
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd app-scanner && \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o scanner main.go

# Stage 2: Runtime
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nmap \           # Nmap binary
    rustscan \       # RustScan binary
    libpcap0.8 \     # Packet capture library
    git              # For NSE repo cloning

# Copy built scanner binary
COPY --from=builder /repos/app-scanner/scanner /app-scanner-src/scanner

# Create NSE directory
RUN mkdir -p /opt/sirius/nse/sirius-nse

# Symlink Nmap scripts to sirius-nse
RUN ln -sf /opt/sirius/nse/sirius-nse/scripts /usr/local/share/nmap/scripts
```

### Volume Mounts

**Development Mode:**

```yaml
# docker-compose.dev.yaml
services:
  sirius-engine:
    volumes:
      - ../minor-projects/app-scanner:/app-scanner # Live code reload
      - ../minor-projects/go-api:/go-api
      - ../minor-projects/sirius-nse:/sirius-nse
```

**Production Mode:**

No volume mounts. Uses pre-compiled binary at `/app-scanner-src/scanner`.

### Startup Script

The scanner is started by `start-enhanced.sh`:

```bash
#!/bin/bash

# Development mode: run from source with live reload
if [ "$GO_ENV" = "development" ] && [ -d "/app-scanner" ]; then
    echo "Starting scanner in development mode..."
    cd /app-scanner
    air -c .air.toml &  # Live reload with air
fi

# Production mode: run pre-compiled binary
if [ ! "$GO_ENV" = "development" ]; then
    echo "Starting scanner in production mode..."
    /app-scanner-src/scanner &
fi

# Keep container running
wait
```

### NSE Script Installation

**Automatic on Startup:**

The `SyncManager` automatically clones/updates the `sirius-nse` repository when `ListenForScans()` is called:

```go
func (sm *ScanManager) ListenForScans() {
    // Sync NSE scripts before listening
    if err := sm.nseSync.Sync(sm.ctx); err != nil {
        log.Printf("Warning: failed to sync NSE scripts: %v", err)
        // Continue anyway - may use cached scripts
    }

    queue.Listen("scan", sm.handleMessage)
}
```

**Fallback:** If sync fails, uses existing scripts from `/opt/sirius/nse/sirius-nse`.

### Environment Variables

```bash
# Scanner configuration
SIRIUS_API_URL=http://sirius-api:9001  # API endpoint for results
RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
VALKEY_HOST=sirius-valkey
VALKEY_PORT=6379

# Development settings
GO_ENV=development  # Enable dev mode
```

---

## Configuration Files

### manifest.json

**Location:** `/app-scanner/manifest.json`

**Purpose:** Reference to external repositories (sirius-nse).

**Structure:**

```json
{
  "repositories": [
    {
      "name": "sirius-nse",
      "url": "https://github.com/SiriusScan/sirius-nse.git"
    }
  ]
}
```

**Usage:** Read by installer scripts or future auto-update mechanisms.

### nmap-args/args.txt

**Location:** `/app-scanner/nmap-args/args.txt` (or `/opt/sirius/nse/sirius-nse/scripts/args.txt`)

**Purpose:** Default arguments for NSE scripts.

**Example Content:**

```
# Vulners script configuration
vulners.showall=false

# HTTP scripts
http.useragent=Sirius Scanner/1.0

# SMB scripts
smbdomain=WORKGROUP
smbusername=guest
smbpassword=

# Timing
timeout=30000
```

**Usage:** Passed to Nmap via `--script-args-file` flag.

**Path Resolution:**

```go
argsFilePaths := []string{
    "/opt/sirius/nse/sirius-nse/scripts/args.txt",
    "/app-scanner/nmap-args/args.txt",
    "/app-scanner-src/nmap-args/args.txt",
    "nmap-args/args.txt",
}

// Use first existing file
for _, path := range argsFilePaths {
    if _, err := os.Stat(path); err == nil {
        argsFilePath = path
        break
    }
}
```

### .air.toml

**Location:** `/app-scanner/.air.toml`

**Purpose:** Live reload configuration for development.

**Key Settings:**

```toml
[build]
  cmd = "go build -o ./tmp/scanner main.go"
  bin = "./tmp/scanner"
  include_ext = ["go", "tpl", "tmpl", "html"]
  exclude_dir = ["tmp", "vendor", "testdata"]
  delay = 1000  # 1 second delay before rebuild

[log]
  time = true
```

**Usage:** Automatically watches for file changes and rebuilds/restarts scanner.

---

## Development Workflow

### Running Tests

**Unit Tests:**

```bash
cd /app-scanner
go test ./internal/scan/... -v

# Specific test
go test ./internal/scan/ -run TestScanToolFactory -v

# With coverage
go test ./internal/scan/... -cover -coverprofile=coverage.out
go tool cover -html=coverage.out
```

**Integration Tests:**

```bash
# Full scan test (requires running infrastructure)
go run cmd/scan-full-test/main.go
```

### Manual Scan Testing

**Test Commands:**

```bash
# Direct Nmap test
cd cmd/direct-nmap-test
go run main.go

# NSE script test
cd cmd/nse-test
go run main.go

# Validate NSE script fixes
cd cmd/validate-nse-fix
go run main.go
```

### Debugging NSE Scripts

**Check Script Availability:**

```bash
docker exec sirius-engine nmap --script-help vulners
```

**Test Script Manually:**

```bash
docker exec sirius-engine nmap -sV --script vulners 192.168.1.100
```

**View NSE Repository:**

```bash
docker exec sirius-engine ls -la /opt/sirius/nse/sirius-nse/scripts/
```

**Check Symlink:**

```bash
docker exec sirius-engine ls -la /usr/local/share/nmap/scripts
# Should point to: /opt/sirius/nse/sirius-nse/scripts
```

### Live Reload Development

**Development Mode:**

1. Edit code in `../minor-projects/app-scanner`
2. Air detects changes and rebuilds
3. Scanner restarts automatically
4. Logs visible in `docker logs -f sirius-engine`

**Watch Logs:**

```bash
# Scanner logs
docker logs -f sirius-engine | grep scanner

# RabbitMQ messages
docker exec sirius-rabbitmq rabbitmqctl list_queues name messages

# ValKey scan state
docker exec sirius-valkey valkey-cli GET scan:scan-abc123
```

### Adding New Scan Strategies

**Step 1: Implement Strategy Interface**

```go
// internal/scan/strategies.go
type MyNewStrategy struct {
    CustomOption string
}

func (s *MyNewStrategy) Execute(target string) (sirius.Host, error) {
    // Your scanning logic here
    return host, nil
}
```

**Step 2: Update Factory**

```go
// internal/scan/factory.go
func (f *ScanToolFactory) CreateTool(toolType string) ScanStrategy {
    switch toolType {
    case "my-new-tool":
        return &MyNewStrategy{
            CustomOption: f.currentOptions.SomeOption,
        }
    // ... existing cases
    }
}
```

**Step 3: Add to Scan Types**

Update documentation and UI to include new scan type in `scan_types` options.

**Step 4: Write Tests**

```go
// internal/scan/strategies_test.go
func TestMyNewStrategy(t *testing.T) {
    strategy := &MyNewStrategy{CustomOption: "test"}
    host, err := strategy.Execute("192.168.1.100")
    assert.NoError(t, err)
    assert.NotEmpty(t, host.IP)
}
```

### Creating System Templates

**Step 1: Define Template**

```go
// internal/scan/template_manager.go
func (tm *TemplateManager) InitializeSystemTemplates(ctx context.Context) error {
    templates := []Template{
        // ... existing templates
        {
            ID:          "my-template",
            Name:        "My Custom Template",
            Description: "Description of what this template does",
            Type:        SystemTemplate,
            EnabledScripts: []string{
                "script1",
                "script2",
            },
            ScanOptions: TemplateOptions{
                ScanTypes:  []string{"vulnerability"},
                PortRange:  "1-1000",
                Aggressive: false,
            },
        },
    }
    // ... create templates
}
```

**Step 2: Rebuild Scanner**

```bash
cd /app-scanner
go build -o scanner main.go
```

**Step 3: Test Template**

```json
{
  "id": "test-scan",
  "targets": [{ "value": "192.168.1.100", "type": "single_ip" }],
  "options": { "template_id": "my-template" },
  "priority": 3
}
```

### Optimizing Scan Performance

**Strategies:**

1. **Adjust Worker Pool Size:**

```go
// internal/scan/manager.go
const DEFAULT_WORKERS = 20  // Increase for more parallelism
```

2. **Reduce Port Range:**

```json
{ "port_range": "1-1000" } // Instead of 1-65535
```

3. **Limit NSE Scripts:**

```json
{ "template_id": "quick" } // Use quick template
```

4. **Enable Parallel Processing:**

```json
{ "parallel": true }
```

5. **Adjust Nmap Timing:**

```go
// modules/nmap/nmap.go
args := []string{
    "-T5",  // Insane timing (faster but less accurate)
    // ...
}
```

---

## Key Files Reference

| File                                | Lines | Purpose                                                            |
| ----------------------------------- | ----- | ------------------------------------------------------------------ |
| `main.go`                           | 37    | Application entry point, initializes ScanManager                   |
| `internal/scan/manager.go`          | 783   | Core scan orchestration, RabbitMQ listener, worker pool            |
| `internal/scan/strategies.go`       | 164   | ScanStrategy interface and implementations (Naabu, RustScan, Nmap) |
| `internal/scan/factory.go`          | 50    | Strategy factory for creating scan tools                           |
| `internal/scan/worker_pool.go`      | ~150  | Concurrent worker pool for parallel scanning                       |
| `internal/scan/template_manager.go` | 413   | Template CRUD operations, system template initialization           |
| `internal/scan/template_types.go`   | ~100  | Template data structures                                           |
| `internal/scan/updater.go`          | ~150  | ValKey state update management                                     |
| `internal/scan/logging.go`          | ~200  | Structured logging to RabbitMQ                                     |
| `internal/scan/helpers.go`          | ~100  | Utility functions (severity calculation, etc.)                     |
| `internal/scan/network_helpers.go`  | ~150  | IP/CIDR expansion, validation                                      |
| `internal/nse/repo.go`              | 138   | Git repository management for NSE scripts                          |
| `internal/nse/sync.go`              | ~150  | NSE sync coordination                                              |
| `internal/nse/script_selector.go`   | ~200  | Protocol-based NSE script selection                                |
| `internal/nse/script_blacklist.go`  | ~50   | Problematic script exclusion                                       |
| `internal/nse/types.go`             | ~100  | NSE data structures (Manifest, Script)                             |
| `modules/nmap/nmap.go`              | 533   | Nmap integration, XML parsing, CVE extraction                      |
| `modules/rustscan/rustscan.go`      | ~150  | RustScan integration                                               |
| `modules/naabu/naabu.go`            | ~150  | Naabu integration                                                  |

**Total:** ~3,800 lines of application code

---

## Code Examples

### Sending a Scan Request

**From Go:**

```go
scanMsg := ScanMessage{
    ID: uuid.New().String(),
    Targets: []Target{
        {Value: "192.168.1.0/24", Type: CIDR},
    },
    Options: ScanOptions{
        TemplateID: "high-risk",
        ScanTypes:  []string{"discovery", "vulnerability"},
    },
    Priority: 4,
}

msgBytes, _ := json.Marshal(scanMsg)
queue.Publish("scan", string(msgBytes))
```

**From CLI (RabbitMQ):**

```bash
rabbitmqadmin publish exchange=amq.default \
  routing_key=scan \
  payload='{"id":"scan-123","targets":[{"value":"192.168.1.100","type":"single_ip"}],"options":{"template_id":"quick"},"priority":3}'
```

### Monitoring Scan Progress

**ValKey Query:**

```bash
docker exec sirius-valkey valkey-cli GET scan:scan-123
```

**Output:**

```json
{
  "status": "running",
  "start_time": "2025-10-25T10:30:00Z",
  "hosts": ["192.168.1.1", "192.168.1.2", "192.168.1.100"],
  "hosts_completed": 2,
  "vulnerabilities": [
    {
      "id": "CVE-2017-0143",
      "severity": "critical",
      "title": "EternalBlue SMB RCE"
    }
  ]
}
```

---

## Troubleshooting

### NSE Script Errors

**Symptom:** "NSE: failed to initialize the script engine"

**Causes:**

- Script syntax errors
- Missing script dependencies
- Blacklisted scripts referenced

**Solutions:**

1. **Check script exists:**

```bash
docker exec sirius-engine ls /opt/sirius/nse/sirius-nse/scripts/ | grep vulners
```

2. **Test script manually:**

```bash
docker exec sirius-engine nmap --script-help vulners
```

3. **Check blacklist:**

Review `internal/nse/script_blacklist.go`

4. **Force repository sync:**

```bash
docker exec sirius-engine rm -rf /opt/sirius/nse/sirius-nse
docker restart sirius-engine  # Will re-clone on startup
```

### Scan Timeouts

**Symptom:** Scans never complete, hosts stuck in "running" status

**Causes:**

- Network unreachability
- Firewall blocking scans
- Extremely large port ranges

**Solutions:**

1. **Reduce port range:**

```json
{ "port_range": "1-1000" } // Instead of 1-65535
```

2. **Enable aggressive mode:**

```json
{ "aggressive": true } // Faster but more detectable
```

3. **Check network connectivity:**

```bash
docker exec sirius-engine ping 192.168.1.100
```

4. **View scanner logs:**

```bash
docker logs -f sirius-engine | grep "ERROR\|Failed"
```

### Memory Issues

**Symptom:** Scanner crashes with OOM (Out of Memory) errors

**Causes:**

- Too many concurrent workers
- Large target ranges without pagination
- Memory leaks in scanning tools

**Solutions:**

1. **Reduce worker pool size:**

```go
const DEFAULT_WORKERS = 5  // Down from 10
```

2. **Scan smaller ranges:**

Split large CIDR blocks into smaller chunks.

3. **Increase Docker memory:**

```yaml
# docker-compose.yaml
services:
  sirius-engine:
    deploy:
      resources:
        limits:
          memory: 4G # Increase from 2G
```

4. **Monitor memory usage:**

```bash
docker stats sirius-engine
```

### RabbitMQ Disconnections

**Symptom:** "Failed to consume from queue: connection closed"

**Causes:**

- RabbitMQ container crashed
- Network partition
- Connection timeout

**Solutions:**

1. **Check RabbitMQ status:**

```bash
docker exec sirius-rabbitmq rabbitmqctl status
```

2. **Restart RabbitMQ:**

```bash
docker restart sirius-rabbitmq
```

3. **Check connection string:**

```bash
echo $RABBITMQ_URL
# Should be: amqp://guest:guest@sirius-rabbitmq:5672/
```

4. **Implement reconnection logic (future):**

Add automatic reconnection with exponential backoff.

---

## Performance Benchmarks

**Environment:** 4-core CPU, 8GB RAM, 1Gbps network

| Scan Type             | Target Range           | Duration  | Hosts/sec |
| --------------------- | ---------------------- | --------- | --------- |
| Quick (top 500 ports) | /24 subnet (254 hosts) | 3-5 min   | ~50-80    |
| High-Risk             | /24 subnet             | 15-25 min | ~10-15    |
| All Scripts           | /24 subnet             | 2-4 hours | ~1-2      |
| Quick                 | Single host            | 10-20 sec | N/A       |
| High-Risk             | Single host            | 2-5 min   | N/A       |

**Optimization Tips:**

- **Parallelism:** Increase worker count for faster subnet scans
- **Port Range:** Limit to relevant ports (80, 443, 22, 3389)
- **Script Selection:** Use templates instead of wildcard `*`
- **Network:** Faster networks = faster scans (avoid VPNs)

---

## Security Considerations

### Responsible Scanning

**Always:**

- ✅ Get written authorization before scanning
- ✅ Use reasonable rate limiting (avoid DoS)
- ✅ Scan only approved IP ranges
- ✅ Document all scanning activities

**Never:**

- ❌ Scan production systems without approval
- ❌ Use aggressive mode on fragile systems
- ❌ Store vulnerability data in insecure locations
- ❌ Share scan results with unauthorized parties

### Rate Limiting

The scanner implements implicit rate limiting through:

- **Worker Pool Size:** Limits concurrent scans
- **Nmap Timing:** `-T4` (balanced) by default, not `-T5` (insane)
- **Connection Limits:** Naabu respects system limits

**Future Enhancements:**

- Configurable rate limits (scans per second)
- Per-target rate limiting
- Adaptive throttling based on network conditions

---

## Future Enhancements

**Planned Features:**

1. **DNS Wildcard Support:** Subdomain enumeration via CT logs
2. **Distributed Scanning:** Multiple scanner instances coordinating via ValKey
3. **Scan Scheduling:** Cron-based recurring scans
4. **Advanced Reporting:** PDF/HTML reports with executive summaries
5. **Machine Learning:** Anomaly detection for unusual scan results
6. **API Gateway Integration:** Direct scan triggering via REST API
7. **WebSocket Updates:** Real-time scan progress in UI
8. **Scan Comparison:** Diff scans to identify new vulnerabilities

---

## LLM Context

This documentation is optimized for AI assistant context. Key information:

**Architecture:** Message-driven (RabbitMQ), worker pool concurrency, strategy pattern for extensibility

**Core Flow:** Receive scan message → Expand targets → Distribute to workers → Execute strategies → Enrich results → Submit to API

**Key Components:** ScanManager (orchestration), ScanStrategies (tool integrations), TemplateManager (scan configs), NSE system (script management)

**Integration Points:** RabbitMQ (input), ValKey (state), PostgreSQL (results), NVD API (CVE enrichment)

**Development:** Go 1.23+, runs in sirius-engine container, live reload with Air, unit/integration tests

**Common Tasks:** Add strategies (implement interface + factory), create templates (InitializeSystemTemplates), debug NSE (check symlinks/manifest)

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team  
**Repository:** https://github.com/SiriusScan/app-scanner
