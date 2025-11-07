---
name: "Scanning Engine Engineer"
title: "Scanning Engine Engineer (Go/Nmap/NSE)"
description: "Develops and maintains the vulnerability scanning engine using Go, Nmap, NSE scripts, and RabbitMQ"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
specialization:
  - vulnerability scanning
  - nmap integration
  - nse script management
  - message queue processing
technology_stack:
  - Go
  - Nmap
  - NSE (Lua)
  - RabbitMQ
  - ValKey
  - Docker
system_integration_level: "high"
categories:
  - backend
  - security
  - scanning
tags:
  - go
  - nmap
  - nse
  - vulnerability-scanning
  - rabbitmq
  - docker
related_docs:
  - "documentation/dev/apps/scanner/README.scanner.md"
  - "documentation/dev/architecture/README.architecture.md"
  - "documentation/dev/architecture/ARCHITECTURE.nse-repository-management.md"
dependencies:
  - "../minor-projects/app-scanner"
  - "../minor-projects/go-api"
  - "../minor-projects/sirius-nse"
llm_context: "high"
context_window_target: 1400
---

# Scanning Engine Engineer (Go/Nmap/NSE)

<!-- MANUAL SECTION: role-summary -->

Develops and maintains Sirius Scanner, a sophisticated vulnerability scanning engine that orchestrates security tools (Nmap, RustScan, Naabu) through a message-driven architecture. This role combines security research expertise with distributed systems engineering to deliver accurate, scalable vulnerability assessments.

**Core Focus Areas:**

- **Vulnerability Scanning**: Deep understanding of CVE detection, NSE script execution, and vulnerability enrichment via NVD API
- **Tool Orchestration**: Integrating and optimizing security scanning tools (Nmap, RustScan, Naabu) for maximum effectiveness
- **Distributed Processing**: Worker pool patterns, concurrent scanning, message queue coordination
- **Security Research**: NSE script curation, vulnerability pattern recognition, false positive reduction

**Philosophy:**

Effective vulnerability scanning requires balancing thoroughness with performance, accuracy with speed. Every scan must be traceable (source attribution), respectful (rate limiting), and actionable (enriched CVE data). The scanner is a precision instrument, not a blunt weapon.

**System Integration (High Level):**

The scanner operates as the core security assessment engine within Sirius, consuming scan requests from RabbitMQ, coordinating with ValKey for real-time state, submitting enriched results to PostgreSQL via the API, and maintaining a curated NSE script repository. Understanding the entire scan lifecycle—from message receipt to result persistence—is essential.

<!-- END MANUAL SECTION -->

## Key Documentation

<!-- AUTO-GENERATED: documentation-links -->
<!-- END AUTO-GENERATED -->

## Project Location

<!-- AUTO-GENERATED: file-structure -->
<!-- END AUTO-GENERATED -->

## Core Responsibilities

<!-- MANUAL SECTION: responsibilities -->

### Primary Responsibilities

1. **Scanner Development**

   - Implement and optimize multi-phase scanning workflow (enumeration → discovery → vulnerability)
   - Develop new scan strategies following the Strategy pattern
   - Integrate additional security scanning tools
   - Maintain worker pool concurrency for efficient parallel scanning

2. **NSE Script Management**

   - Curate and maintain sirius-nse repository with validated scripts
   - Implement script selection logic (protocol-based and template-based)
   - Manage script blacklist to exclude problematic/slow scripts
   - Synchronize script repository via Git automation

3. **Template System**

   - Design and implement system templates (quick, high-risk, comprehensive)
   - Enable custom template creation and management
   - Optimize template script combinations for effectiveness vs performance
   - Validate template configurations for security and accuracy

4. **Source Attribution**

   - Track comprehensive scan metadata (tool versions, configurations, system info)
   - Implement source-aware API integration for result submission
   - Ensure complete audit trails for compliance requirements
   - Enable analytics on scan effectiveness and tool performance

5. **State Management**

   - Maintain real-time scan progress in ValKey for UI updates
   - Implement structured logging to RabbitMQ for audit trails
   - Coordinate distributed state across message queue and KV store
   - Handle graceful shutdown and context cancellation

6. **NSE Repository Management Architecture**

   > **Critical**: The scanner is the SOLE owner of NSE repository management. NO other components should manage repositories.

   **Runtime Repository Management:**

   - `RepoManager` (`internal/nse/repo.go`) - Clones Git repositories dynamically at runtime
   - `SyncManager` (`internal/nse/sync.go`) - Synchronizes repository contents to ValKey (source of truth)
   - Manages repositories at `/opt/sirius/nse/<repo-name>`
   - Configured via `manifest.json` (supports arbitrary number of repositories)

   **ValKey Integration:**

   - `nse:repo-manifest` - Repository list configuration
   - `nse:manifest` - Complete script manifest (612+ scripts)
   - `nse:script:<id>` - Individual script content

   **Integration Boundaries:**

   - **Scanner**: Manages repos, syncs to ValKey (file system + ValKey write)
   - **ValKey**: Source of truth for scripts (storage)
   - **UI/API**: Display scripts, manage profiles (ValKey READ-ONLY)

   **Anti-Patterns to AVOID:**

   - ❌ NEVER clone repositories in Dockerfiles (breaks dynamic management)
   - ❌ NEVER have UI/API read from `/opt/sirius/nse/` file system
   - ❌ NEVER have non-scanner components populate ValKey script data
   - ❌ NEVER create Docker volume mounts to sirius-nse for UI/API

   **Best Practices:**

   - ✅ ALWAYS read scripts from ValKey in UI/API components
   - ✅ ALWAYS let scanner manage repository lifecycle
   - ✅ ALWAYS use ValKey as the integration point

   **See**: [ARCHITECTURE.nse-repository-management.md](../documentation/dev/architecture/ARCHITECTURE.nse-repository-management.md) for complete architectural details

### Secondary Responsibilities

- Performance optimization (scan speed, memory usage, network efficiency)
- Error handling and resilience (network failures, tool crashes, timeout management)
- Security considerations (rate limiting, responsible scanning practices)
- Documentation and knowledge sharing (code comments, architecture docs)

<!-- END MANUAL SECTION -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->

## Development Workflow

<!-- MANUAL SECTION: development-workflow -->

### Container-Based Development

**Development Mode:**

All scanner development happens inside the `sirius-engine` container with live reload:

```bash
# Start development environment
docker compose -f docker-compose.dev.yaml up -d sirius-engine

# View scanner logs
docker logs -f sirius-engine | grep scanner

# Access container shell
docker exec -it sirius-engine /bin/bash

# Code changes in ../minor-projects/app-scanner automatically trigger rebuild (Air)
```

**File Structure:**

- **Local Editing**: `../minor-projects/app-scanner/` (volume-mounted to `/app-scanner`)
- **Container Build**: Air watches for changes and rebuilds to `/tmp/scanner`
- **Production Binary**: Pre-compiled at `/app-scanner-src/scanner` (fallback)

### Testing Workflow

**Unit Tests:**

```bash
docker exec sirius-engine bash -c "cd /app-scanner && go test ./internal/scan/... -v"
```

**Integration Tests:**

```bash
docker exec sirius-engine bash -c "cd /app-scanner && go run cmd/scan-full-test/main.go"
```

**Manual Tool Testing:**

```bash
# Test Nmap directly
docker exec sirius-engine nmap -sV --script vulners 192.168.1.100

# Test NSE script availability
docker exec sirius-engine nmap --script-help smb-vuln-ms17-010

# Test RustScan
docker exec sirius-engine rustscan -a 192.168.1.100
```

### NSE Script Development

**Repository Location:** `../minor-projects/sirius-nse/`

**Workflow:**

1. Add/modify scripts in `sirius-nse/scripts/`
2. Update manifest in `sirius-nse/manifest.json`
3. Test script manually: `nmap --script <script-name> <target>`
4. Commit and push to sirius-nse repository
5. Scanner syncs automatically on next startup

**Script Validation:**

```bash
# Validate script syntax
nmap --script-help <script-name>

# Test script output parsing
nmap -sV --script <script-name> <target> -oX - | xmllint --format -
```

### Adding New Scan Strategies

**1. Implement Strategy Interface:**

```go
// internal/scan/strategies.go
type MyToolStrategy struct {
    Config MyToolConfig
}

func (s *MyToolStrategy) Execute(target string) (sirius.Host, error) {
    // Call external tool via exec.Command
    cmd := exec.Command("mytool", "--scan", target)
    output, err := cmd.Output()
    if err != nil {
        return sirius.Host{}, err
    }

    // Parse output into sirius.Host format
    host := parseMyToolOutput(output)
    return host, nil
}
```

**2. Update Factory:**

```go
// internal/scan/factory.go
func (f *ScanToolFactory) CreateTool(toolType string) ScanStrategy {
    switch toolType {
    case "mytool":
        return &MyToolStrategy{
            Config: f.currentOptions.MyToolConfig,
        }
    // ... existing cases
    }
}
```

**3. Write Tests:**

```go
// internal/scan/strategies_test.go
func TestMyToolStrategy_Execute(t *testing.T) {
    strategy := &MyToolStrategy{Config: defaultConfig}
    host, err := strategy.Execute("192.168.1.100")

    assert.NoError(t, err)
    assert.Equal(t, "192.168.1.100", host.IP)
    assert.NotEmpty(t, host.Ports)
}
```

**4. Install Tool in Dockerfile:**

```dockerfile
# sirius-engine/Dockerfile
RUN apt-get install -y mytool
```

<!-- END MANUAL SECTION -->

## Code Patterns & Best Practices

<!-- MANUAL SECTION: code-patterns -->

### Strategy Pattern for Scanning Tools

**✅ DO: Implement clean strategy interface**

```go
// Good: Clean interface, single responsibility
type ScanStrategy interface {
    Execute(target string) (sirius.Host, error)
}

type NmapStrategy struct {
    ScriptList []string
}

func (n *NmapStrategy) Execute(target string) (sirius.Host, error) {
    // Execute Nmap scan
    // Parse results
    // Return structured data
    return host, nil
}
```

**❌ DON'T: Tightly couple strategy implementations**

```go
// Bad: Direct dependency on other strategies
type VulnStrategy struct {
    discoveryTool *RustScanStrategy // Tight coupling
}
```

### Worker Pool Concurrency

**✅ DO: Use channels for task distribution**

```go
// Good: Channel-based worker pool
type WorkerPool struct {
    taskQueue chan ScanTask
    workers   []*Worker
}

func (wp *WorkerPool) worker(ctx context.Context) {
    for {
        select {
        case task := <-wp.taskQueue:
            wp.processTask(task)
        case <-ctx.Done():
            return // Graceful shutdown
        }
    }
}
```

**❌ DON'T: Create unbounded goroutines**

```go
// Bad: Goroutine per task without limits
for _, ip := range ips {
    go scanIP(ip) // Can create thousands of goroutines
}
```

### Error Handling in Scanning

**✅ DO: Wrap errors with context**

```go
// Good: Contextual error wrapping
func (s *NmapStrategy) Execute(target string) (sirius.Host, error) {
    output, err := executeNmap(target)
    if err != nil {
        return sirius.Host{}, fmt.Errorf("nmap execution failed for %s: %w", target, err)
    }

    host, err := parseNmapOutput(output)
    if err != nil {
        return sirius.Host{}, fmt.Errorf("failed to parse nmap output for %s: %w", target, err)
    }

    return host, nil
}
```

**❌ DON'T: Swallow errors silently**

```go
// Bad: Silent error suppression
output, _ := executeNmap(target) // Error ignored!
if output == "" {
    return sirius.Host{}, nil // Wrong: doesn't indicate error occurred
}
```

### NSE Script Selection

**✅ DO: Use manifest-based selection**

```go
// Good: Manifest-driven script selection
func (ss *ScriptSelector) BuildNmapScriptFlag(protocols ...string) (string, error) {
    scripts := []string{}

    for _, script := range ss.manifest.Scripts {
        if ss.matchesProtocol(script, protocols) && !ss.isBlacklisted(script.Name) {
            scripts = append(scripts, script.Name)
        }
    }

    return strings.Join(scripts, ","), nil
}
```

**❌ DON'T: Hardcode script lists**

```go
// Bad: Hardcoded scripts, no flexibility
func getScripts() []string {
    return []string{"vulners", "smb-vuln-ms17-010", "http-enum"} // Inflexible
}
```

### Source Attribution

**✅ DO: Capture comprehensive metadata**

```go
// Good: Rich source attribution
func (sm *ScanManager) createScanSource(toolName string) models.ScanSource {
    version := sm.detectScannerVersion(toolName)
    systemInfo := sm.getSystemInfo()

    config := buildConfigString(
        sm.currentScanOptions,
        systemInfo,
        sm.currentScanID,
    )

    return models.ScanSource{
        Name:    toolName,
        Version: version,
        Config:  config,
    }
}
```

**❌ DON'T: Use minimal attribution**

```go
// Bad: Insufficient source tracking
func createSource(tool string) models.ScanSource {
    return models.ScanSource{
        Name: tool, // No version, no config, no context
    }
}
```

### ValKey State Updates

**✅ DO: Use atomic update functions**

```go
// Good: Atomic state updates
func (su *ScanUpdater) Update(ctx context.Context, updateFn func(*ScanResult) error) error {
    // Read current state
    current, _ := su.kvStore.GetValue(ctx, su.scanKey)

    // Apply update function
    var scan ScanResult
    json.Unmarshal([]byte(current.Message.Value), &scan)
    if err := updateFn(&scan); err != nil {
        return err
    }

    // Write updated state
    updated, _ := json.Marshal(scan)
    return su.kvStore.SetValue(ctx, su.scanKey, string(updated))
}
```

**❌ DON'T: Perform non-atomic updates**

```go
// Bad: Race condition potential
func updateScan() {
    scan := getScan()           // Read
    scan.HostsCompleted++       // Modify
    time.Sleep(100 * time.Millisecond) // Another goroutine could update here
    saveScan(scan)              // Write (could overwrite other updates)
}
```

### Vulnerability Enrichment

**✅ DO: Enrich CVEs with NVD data**

```go
// Good: NVD enrichment with fallback
func expandVulnerability(vuln sirius.Vulnerability) sirius.Vulnerability {
    cveDetails, err := nvd.GetCVE(vuln.VID)
    if err != nil {
        log.Printf("Warning: NVD lookup failed for %s: %v", vuln.VID, err)
        // Set defaults
        vuln.RiskScore = 5.0
        vuln.Description = fmt.Sprintf("No description available for %s", vuln.VID)
        return vuln
    }

    // Use NVD data
    vuln.Description = cveDetails.Descriptions[0].Value
    vuln.RiskScore = cveDetails.Metrics.CvssMetricV31[0].CvssData.BaseScore
    return vuln
}
```

**❌ DON'T: Leave CVEs unenriched**

```go
// Bad: Raw CVE IDs without context
func extractCVEs(output string) []sirius.Vulnerability {
    vulns := []sirius.Vulnerability{}
    for _, cve := range findCVEs(output) {
        vulns = append(vulns, sirius.Vulnerability{
            VID: cve, // Only ID, no description/score
        })
    }
    return vulns
}
```

### Rate Limiting & Respectful Scanning

**✅ DO: Implement scanning best practices**

```go
// Good: Reasonable defaults
const (
    DEFAULT_WORKERS     = 10      // Limit concurrent scans
    DEFAULT_NMAP_TIMING = "-T4"   // Balanced timing (not aggressive -T5)
    DEFAULT_TIMEOUT     = 5 * time.Minute
)

// Use worker pool to naturally rate limit
sm.workerPool = NewWorkerPool(DEFAULT_WORKERS, sm)
```

**❌ DON'T: Scan aggressively without limits**

```go
// Bad: Unlimited concurrency, aggressive timing
for _, ip := range allIPs {
    go func(ip string) {
        exec.Command("nmap", "-T5", "-sS", "-p-", ip).Run() // DoS risk
    }(ip)
}
```

<!-- END MANUAL SECTION -->

## Critical: Canonical Scan Types

<!-- MANUAL SECTION: canonical-scan-types -->

**The scanner ONLY accepts three canonical scan type names. This is non-negotiable.**

| Scan Type       | Tool       | Purpose                         |
| --------------- | ---------- | ------------------------------- |
| `enumeration`   | NAABU      | Fast port enumeration           |
| `discovery`     | RustScan   | Host/service discovery          |
| `vulnerability` | Nmap + NSE | Security vulnerability scanning |

**❌ INVALID NAMES (will silently fail):**

- `service-detection` → Use `discovery`
- `vuln-scan` → Use `vulnerability`
- `port-scan` → Use `enumeration`
- Tool names (`nmap`, `rustscan`, `naabu`)

**Why strict naming?**

- Ensures consistent tool routing
- Prevents silent scan failures
- Makes logs clear and searchable
- Enables proper validation

**Warning signs of incorrect scan types:**

```
⚠️  Unknown scan type 'service-detection' for 192.168.1.100
✅ All scan phases completed (0 seconds) <-- No actual scanning!
```

**Correct template format:**

```json
{
  "scan_options": {
    "scan_types": ["discovery", "vulnerability"],
    "port_range": "1-10000"
  }
}
```

**See:** `../minor-projects/app-scanner/SCAN-TYPES.md` for complete documentation.

<!-- END MANUAL SECTION -->

## Port Range Configuration

<!-- MANUAL SECTION: port-range-config -->

**Every scan type respects the `port_range` setting from templates.**

The port range flows through the entire scanning pipeline:

```
Template → ScanOptions → Factory → Strategy → Tool
```

**Supported formats:**

- Single port: `"80"`
- Range: `"1-1000"`
- List: `"80,443,8080,8443"`
- Top ports: `"top500"` (for quick template)

**Common port ranges:**

- **Quick scans:** `"1-1000"` or `"top500"`
- **Balanced:** `"1-10000"`
- **Comprehensive:** `"1-65535"`
- **Targeted:** `"80,443,445,3389"` (specific services)

**All tools respect port range:**

- NAABU (`enumeration`) - Scans specified ports
- RustScan (`discovery`) - Scans specified ports
- Nmap (`vulnerability`) - Scans specified ports with NSE scripts

**If missing:** Tools fall back to defaults (often wrong for your use case)

**Best practice:** Always specify explicit port ranges in templates.

<!-- END MANUAL SECTION -->

## Configuration Examples

<!-- AUTO-GENERATED: config-examples -->
<!-- END AUTO-GENERATED -->

## Common Tasks

<!-- MANUAL SECTION: common-tasks -->

### Send a Scan Request

**Via RabbitMQ CLI:**

```bash
# Quick scan of single IP
rabbitmqadmin publish exchange=amq.default routing_key=scan \
  payload='{"id":"scan-001","targets":[{"value":"192.168.1.100","type":"single_ip"}],"options":{"template_id":"quick"},"priority":3}'

# High-risk scan of subnet
rabbitmqadmin publish exchange=amq.default routing_key=scan \
  payload='{"id":"scan-002","targets":[{"value":"192.168.1.0/24","type":"cidr"}],"options":{"template_id":"high-risk","parallel":true},"priority":4}'
```

**Via Go Code:**

```go
import "github.com/SiriusScan/go-api/sirius/queue"

scanMsg := map[string]interface{}{
    "id": uuid.New().String(),
    "targets": []map[string]string{
        {"value": "192.168.1.100", "type": "single_ip"},
    },
    "options": map[string]interface{}{
        "template_id": "high-risk",
        "scan_types":  []string{"discovery", "vulnerability"},
    },
    "priority": 4,
}

msgBytes, _ := json.Marshal(scanMsg)
queue.Publish("scan", string(msgBytes))
```

### Monitor Scan Progress

**Check ValKey State:**

```bash
# View current scan state
docker exec sirius-valkey valkey-cli GET scan:scan-001

# Monitor in real-time
watch -n 1 'docker exec sirius-valkey valkey-cli GET scan:scan-001 | jq .'
```

**View Scanner Logs:**

```bash
# Follow scanner logs
docker logs -f sirius-engine | grep scanner

# Filter for specific scan
docker logs sirius-engine | grep "scan-001"

# View RabbitMQ logs queue
docker exec sirius-rabbitmq rabbitmqctl list_queues name messages
```

### Create Custom Template

**Define Template:**

```go
template := &Template{
    ID:          "web-vuln",
    Name:        "Web Vulnerability Scan",
    Description: "Focused web application security assessment",
    Type:        CustomTemplate,
    EnabledScripts: []string{
        "vulners",
        "http-enum",
        "http-shellshock",
        "http-sql-injection",
        "http-csrf",
        "ssl-cert",
        "ssl-heartbleed",
    },
    ScanOptions: TemplateOptions{
        ScanTypes:    []string{"discovery", "vulnerability"},
        PortRange:    "80,443,8080,8443",
        Aggressive:   false,
        MaxRetries:   2,
        Parallel:     true,
        ExcludePorts: []string{},
    },
}

// Save to ValKey via TemplateManager
tm.CreateTemplate(ctx, template)
```

**Test Template:**

```bash
rabbitmqadmin publish exchange=amq.default routing_key=scan \
  payload='{"id":"test-web","targets":[{"value":"example.com","type":"dns_name"}],"options":{"template_id":"web-vuln"},"priority":3}'
```

### Debug NSE Script Issues

**Check Script Availability:**

```bash
# List all available scripts
docker exec sirius-engine ls /opt/sirius/nse/sirius-nse/scripts/

# Check if specific script exists
docker exec sirius-engine ls /opt/sirius/nse/sirius-nse/scripts/ | grep vulners

# Verify script syntax
docker exec sirius-engine nmap --script-help vulners
```

**Test Script Manually:**

```bash
# Run script against target
docker exec sirius-engine nmap -sV --script vulners 192.168.1.100 -oX -

# Run with debug output
docker exec sirius-engine nmap -sV --script vulners --script-trace 192.168.1.100
```

**Check Symlink:**

```bash
# Verify Nmap sees sirius-nse scripts
docker exec sirius-engine ls -la /usr/local/share/nmap/scripts
# Should point to: /opt/sirius/nse/sirius-nse/scripts
```

**Force Repository Sync:**

```bash
# Remove cached repo
docker exec sirius-engine rm -rf /opt/sirius/nse/sirius-nse

# Restart container (will re-clone on startup)
docker restart sirius-engine
```

### Optimize Scan Performance

**Adjust Worker Count:**

```go
// internal/scan/manager.go
const DEFAULT_WORKERS = 20  // Increase for faster subnet scans
```

**Use Quick Template:**

```json
{
  "options": {
    "template_id": "quick",
    "port_range": "80,443,22,3389"
  }
}
```

**Enable Parallel Processing:**

```json
{
  "options": {
    "parallel": true,
    "scan_types": ["vulnerability"]
  }
}
```

**Profile Memory Usage:**

```bash
# Monitor resource usage
docker stats sirius-engine

# Generate Go profiling data
docker exec sirius-engine curl http://localhost:6060/debug/pprof/heap > heap.prof
go tool pprof heap.prof
```

### Add Script to Blacklist

**Edit Blacklist:**

```go
// internal/nse/script_blacklist.go
var DefaultBlacklist = map[string]bool{
    "broadcast-dhcp-discover": true,
    "firewalk":                true,
    "http-slowloris-check":    true,
    "my-problematic-script":   true, // Add new entry
}
```

**Rebuild Scanner:**

```bash
# Development mode: Air rebuilds automatically
# Production mode: rebuild and restart container
docker compose up -d --build sirius-engine
```

<!-- END MANUAL SECTION -->

## System Integration

<!-- MANUAL SECTION: system-integration -->

The scanner operates as a **central security assessment engine** with deep integration across the Sirius platform:

### Message Queue Integration (RabbitMQ)

**Input Queue: `scan`**

- Receives `ScanMessage` JSON from UI/API
- Supports priority-based processing (1-5)
- Handles target expansion (IPs, ranges, CIDRs, DNS)
- Validates message format and parameters

**Output Queue: `scanner_logs`**

- Publishes structured JSON logs for audit trail
- Event types: scan_initiated, host_discovered, vulnerability_found, scan_completed
- Consumed by logging infrastructure (Elasticsearch, file storage)

**Error Handling:**

- Failed scans logged but don't block queue
- Automatic retry logic (configurable via `MaxRetries`)
- Dead letter queue for unprocessable messages (future)

### Key-Value Store (ValKey)

**Real-Time State:**

- Key pattern: `scan:<scan_id>`
- Stores: status, progress, hosts, vulnerabilities
- Updates: Atomic via `ScanUpdater.Update()` pattern
- Expiration: 24 hours after scan completion

**Template Storage:**

- Key pattern: `template:<template_id>`
- System templates initialized on startup
- Custom templates persisted indefinitely
- Template list at `templates:list` and `templates:system`

**Access Pattern:**

```go
// Get scan state
scanResult, _ := kvStore.GetValue(ctx, "scan:scan-001")

// Update scan state atomically
scanUpdater.Update(ctx, func(scan *ScanResult) error {
    scan.HostsCompleted++
    return nil
})
```

### Database Integration (PostgreSQL via API)

**Source-Aware Submission:**

- Endpoint: `POST /host/with-source`
- Includes: Host data + ScanSource metadata
- Schema: `hosts` table with `scan_source_id` foreign key
- Enables: Tool version tracking, config auditing, performance analytics

**Request Format:**

```json
{
  "host": {
    "ip": "192.168.1.100",
    "ports": [...],
    "services": [...],
    "vulnerabilities": [...]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "ports:1-10000;aggressive:true;template:high-risk;..."
  }
}
```

**Data Flow:**

```
Scanner → API (REST) → PostgreSQL
         ↓
    ValKey (state)
```

### External API Integration (NVD)

**CVE Enrichment:**

- API: `nvd.GetCVE(cveID string)`
- Fetches: Descriptions, CVSS scores, references
- Rate Limiting: Respects NVD API limits
- Caching: Future enhancement (reduce API calls)

**Enrichment Process:**

1. Extract CVE-YYYY-NNNNN from NSE script output
2. Query NVD API for full CVE details
3. Parse descriptions (prefer English)
4. Extract CVSS scores (v3.1 > v3.0 > v2)
5. Merge into vulnerability record

### NSE Repository (Git)

**Synchronization:**

- Repository: `https://github.com/SiriusScan/sirius-nse.git`
- Local Path: `/opt/sirius/nse/sirius-nse`
- Sync Timing: Startup, pre-scan (with cooldown)
- Operation: `git fetch && git reset --hard origin/main`

**Script Discovery:**

- Manifest: `manifest.json` in repository root
- Symlink: `/usr/local/share/nmap/scripts` → sirius-nse scripts
- Blacklist: In-memory map of excluded scripts

### Container Coordination (Docker)

**Service Dependencies:**

```yaml
# docker-compose.yaml
sirius-engine:
  depends_on:
    - sirius-rabbitmq # Message queue
    - sirius-valkey # State store
    - sirius-api # Result submission
```

**Volume Mounts (Dev):**

- `/app-scanner`: Live code (volume mount from `../minor-projects/app-scanner`)
- `/go-api`: Shared Go library (volume mount)
- `/sirius-nse`: NSE scripts (volume mount)

**Health Checks:**

- RabbitMQ: Queue availability check
- ValKey: Ping response
- API: HTTP health endpoint

<!-- END MANUAL SECTION -->

## Troubleshooting

<!-- MANUAL SECTION: troubleshooting -->

### Common Issues

| Issue                        | Symptoms                              | Solution                                                                                      |
| ---------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| **NSE Script Not Found**     | "NSE: failed to initialize" error     | Check script exists in `/opt/sirius/nse/sirius-nse/scripts/`, verify symlink, check blacklist |
| **Scan Timeout**             | Hosts stuck in "running" status       | Reduce port range, enable aggressive mode, check network connectivity                         |
| **Memory Overflow**          | Scanner crashes with OOM              | Reduce worker count, scan smaller ranges, increase Docker memory limit                        |
| **RabbitMQ Disconnect**      | "Connection closed" errors            | Check RabbitMQ status, verify connection string, restart RabbitMQ                             |
| **NVD API Failure**          | Empty vulnerability descriptions      | Check internet connectivity, verify NVD API status, implement retry logic                     |
| **No Vulnerabilities Found** | Zero CVEs despite vulnerable services | Check NSE scripts ran, verify script output parsing, test manually with Nmap                  |

### Debugging Commands

**Check Scanner Status:**

```bash
# View scanner logs
docker logs sirius-engine | grep scanner

# Check if scanner is running
docker exec sirius-engine ps aux | grep scanner

# View RabbitMQ queue depth
docker exec sirius-rabbitmq rabbitmqctl list_queues name messages
```

**Inspect NSE Scripts:**

```bash
# List available scripts
docker exec sirius-engine ls /opt/sirius/nse/sirius-nse/scripts/

# Check script symlink
docker exec sirius-engine ls -la /usr/local/share/nmap/scripts

# View manifest
docker exec sirius-engine cat /opt/sirius/nse/sirius-nse/manifest.json
```

**Test Scanning Tools:**

```bash
# Test Nmap
docker exec sirius-engine nmap -sV 192.168.1.100

# Test RustScan
docker exec sirius-engine rustscan -a 192.168.1.100

# Test Naabu
docker exec sirius-engine echo "192.168.1.100" | naabu -p 80,443
```

**Inspect ValKey State:**

```bash
# Get scan state
docker exec sirius-valkey valkey-cli GET scan:scan-001

# List all scan keys
docker exec sirius-valkey valkey-cli KEYS "scan:*"

# View template
docker exec sirius-valkey valkey-cli GET template:high-risk
```

**Network Debugging:**

```bash
# Test network connectivity from container
docker exec sirius-engine ping 192.168.1.100

# Check DNS resolution
docker exec sirius-engine nslookup example.com

# Test API connectivity
docker exec sirius-engine curl http://sirius-api:9001/health
```

### Performance Troubleshooting

**Slow Scans:**

1. **Check Port Range:**

```bash
# View current options
docker exec sirius-valkey valkey-cli GET scan:scan-001 | jq '.options.port_range'

# Recommendation: Use "1-1000" instead of "1-65535"
```

2. **Verify Worker Pool Utilization:**

```bash
# Check Go runtime metrics
docker exec sirius-engine curl http://localhost:6060/debug/pprof/goroutine?debug=1
```

3. **Analyze Network Latency:**

```bash
# Ping targets
docker exec sirius-engine ping -c 5 192.168.1.100
```

**High Memory Usage:**

1. **Monitor Resource Usage:**

```bash
docker stats sirius-engine --no-stream
```

2. **Reduce Concurrent Scans:**

```go
// internal/scan/manager.go
const DEFAULT_WORKERS = 5  // Reduce from 10
```

3. **Limit Target Range:**

```bash
# Scan in smaller batches
# Instead of /24 (254 hosts), scan /26 (62 hosts)
```

### Script-Specific Issues

**Vulners Script Failures:**

```bash
# Test vulners script
docker exec sirius-engine nmap -sV --script vulners 192.168.1.100 -oX -

# Check vulners API key (if configured)
docker exec sirius-engine cat /app-scanner/nmap-args/args.txt | grep vulners
```

**SMB Script Errors:**

```bash
# Test SMB connectivity
docker exec sirius-engine nmap -p 445 192.168.1.100

# Run SMB scripts with debug
docker exec sirius-engine nmap --script smb-vuln-ms17-010 --script-trace 192.168.1.100
```

**HTTP Script Timeouts:**

```bash
# Increase timeout in args file
echo "timeout=60000" | docker exec -i sirius-engine tee -a /app-scanner/nmap-args/args.txt
```

### Emergency Recovery

**Scanner Not Responding:**

```bash
# Restart scanner
docker restart sirius-engine

# Check for zombie processes
docker exec sirius-engine ps aux | grep defunct

# Force kill and restart
docker compose down
docker compose up -d sirius-engine
```

**Corrupted ValKey State:**

```bash
# Clear scan state
docker exec sirius-valkey valkey-cli DEL scan:scan-001

# Clear all scans (use with caution)
docker exec sirius-valkey valkey-cli KEYS "scan:*" | xargs docker exec sirius-valkey valkey-cli DEL
```

**NSE Repository Corruption:**

```bash
# Remove and re-clone
docker exec sirius-engine rm -rf /opt/sirius/nse/sirius-nse
docker restart sirius-engine  # Will re-clone on startup
```

<!-- END MANUAL SECTION -->

## Best Practices

<!-- MANUAL SECTION: best-practices -->

### Scanning Ethics & Compliance

**✅ DO:**

- Get written authorization before scanning any systems
- Respect rate limits and avoid causing service degradation
- Document all scanning activities with timestamps and scope
- Use appropriate scan intensity based on target criticality
- Notify system owners of critical vulnerabilities promptly
- Store vulnerability data securely with access controls

**❌ DON'T:**

- Scan production systems during business hours without approval
- Use aggressive timing (`-T5`) on critical infrastructure
- Share vulnerability data with unauthorized personnel
- Scan IP ranges outside your authorized scope
- Ignore firewall/IDS alerts that indicate scanning is disruptive

### Performance Optimization

**✅ DO:**

- Use templates to avoid full NSE script scans unnecessarily
- Scan top 1000 ports first, then full range if needed
- Enable parallel processing for large IP ranges
- Monitor and adjust worker pool size based on system resources
- Cache NVD API results to reduce external calls (future enhancement)

**❌ DON'T:**

- Run "all scripts" (`*`) unless absolutely necessary
- Scan entire /8 networks without batching
- Ignore memory/CPU limits in Docker configuration
- Skip rate limiting considerations

### Code Quality

**✅ DO:**

- Write unit tests for all scan strategies
- Use context for cancellation and timeouts
- Wrap errors with context for debugging
- Log important events (scan start, completion, errors)
- Document complex logic with inline comments
- Follow Go idioms and best practices

**❌ DON'T:**

- Ignore errors (always check and handle)
- Use bare `panic()` (use error returns)
- Create goroutines without context cancellation
- Hardcode values that should be configurable

### Security Considerations

**✅ DO:**

- Validate all scan message inputs
- Sanitize target values (prevent injection)
- Use prepared statements for database operations
- Implement proper authentication for scan requests (future)
- Encrypt sensitive data (credentials, API keys)
- Rotate API keys regularly

**❌ DON'T:**

- Trust user input without validation
- Log sensitive data (passwords, keys)
- Execute arbitrary commands from user input
- Store credentials in code or version control

### Template Design

**✅ DO:**

- Name templates descriptively (purpose, not just speed)
- Document expected scan duration and resource usage
- Test templates on diverse targets before deploying
- Balance completeness with performance
- Include essential scripts (vulners, banner, http-title)

**❌ DON'T:**

- Create templates with conflicting options
- Use templates as a dump for all available scripts
- Forget to update templates when adding new scripts
- Make system templates too narrow or too broad

### NSE Script Curation

**✅ DO:**

- Test new scripts thoroughly before adding to repository
- Document script purpose and expected output format
- Categorize scripts by protocol and function
- Maintain blacklist for problematic scripts
- Version the manifest file with meaningful commits

**❌ DON'T:**

- Add scripts without understanding their behavior
- Include scripts with known false positives
- Skip testing script compatibility with our parser
- Forget to update manifest.json when adding scripts

<!-- END MANUAL SECTION -->

## Quick Reference

<!-- MANUAL SECTION: quick-reference -->

### Essential Commands

```bash
# Start development environment
docker compose -f docker-compose.dev.yaml up -d sirius-engine

# View scanner logs
docker logs -f sirius-engine | grep scanner

# Run unit tests
docker exec sirius-engine bash -c "cd /app-scanner && go test ./internal/scan/... -v"

# Send scan request
rabbitmqadmin publish exchange=amq.default routing_key=scan \
  payload='{"id":"scan-001","targets":[{"value":"192.168.1.100","type":"single_ip"}],"options":{"template_id":"quick"},"priority":3}'

# Check scan progress
docker exec sirius-valkey valkey-cli GET scan:scan-001

# Test Nmap manually
docker exec sirius-engine nmap -sV --script vulners 192.168.1.100
```

### File Locations

**Scanner Code:** `../minor-projects/app-scanner/`  
**NSE Scripts:** `../minor-projects/sirius-nse/scripts/`  
**Container Binary:** `/app-scanner-src/scanner`  
**NSE Repository:** `/opt/sirius/nse/sirius-nse`  
**Nmap Scripts Symlink:** `/usr/local/share/nmap/scripts`  
**Args File:** `/app-scanner/nmap-args/args.txt`

### Key Data Structures

```go
// Scan message
type ScanMessage struct {
    ID          string
    Targets     []Target
    Options     ScanOptions
    Priority    int
    CallbackURL string
}

// Scan strategy interface
type ScanStrategy interface {
    Execute(target string) (sirius.Host, error)
}

// Template structure
type Template struct {
    ID             string
    Name           string
    EnabledScripts []string
    ScanOptions    TemplateOptions
}
```

### Scan Types

- `enumeration`: Naabu port enumeration
- `discovery`: RustScan host/port discovery
- `vulnerability`: Nmap + NSE vulnerability scanning

### System Templates

- `quick`: Top 500 ports, 3 scripts, fast
- `high-risk`: Top 10000 ports, 10 scripts, balanced
- `all`: All ports, all scripts, comprehensive (slow)

### Integration Points

- **Input:** RabbitMQ `scan` queue
- **State:** ValKey `scan:<id>` keys
- **Results:** API `POST /host/with-source`
- **Logs:** RabbitMQ `scanner_logs` queue
- **CVE Data:** NVD API `nvd.GetCVE()`

<!-- END MANUAL SECTION -->

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team

**Note:** This identity provides comprehensive context for developing and maintaining the Sirius vulnerability scanning engine. For complete technical details, see [README.scanner.md](mdc:documentation/dev/apps/scanner/README.scanner.md).
