---
title: "SystemMonitor Architecture and Operations Guide"
description: "Comprehensive guide to SystemMonitor implementation, deployment, and troubleshooting"
template: "TEMPLATE.documentation-standard"
version: "2.1.0"
last_updated: "2025-10-07"
author: "Sirius Development Team"
tags:
  [
    "system-monitor",
    "monitoring",
    "containers",
    "troubleshooting",
    "architecture",
    "development",
  ]
categories: ["architecture", "operations", "monitoring"]
difficulty: "intermediate"
prerequisites: ["docker", "go", "container-monitoring", "cgroups"]
related_docs:
  - "README.architecture.md"
  - "README.container-testing.md"
  - "README.development.md"
dependencies:
  - "app-system-monitor/"
  - "sirius-engine/start-enhanced.sh"
  - "sirius-ui/start-dev.sh"
llm_context: "high"
search_keywords:
  [
    "system-monitor",
    "cpu-monitoring",
    "container-metrics",
    "troubleshooting",
    "deployment",
    "development-mode",
    "exec-format-error",
  ]
---

# SystemMonitor Architecture and Operations Guide

## Overview

The SystemMonitor is a critical component that provides real-time system resource monitoring for all Sirius containers. It collects CPU, memory, network, disk, and process metrics from within containerized environments and stores them in Valkey for centralized monitoring and alerting.

**Key Features:**

- Real-time metrics collection every 5 seconds
- Support for both development (`go run`) and production (binary) modes
- Multi-architecture support (amd64, arm64)
- CPU drift-free monitoring with time-based calculations
- Automatic fallback mechanisms for missing metrics

## Architecture

### Core Components

#### 1. **Main SystemMonitor Project**

- **Location**: `/minor-projects/app-system-monitor/`
- **Language**: Go 1.23
- **Purpose**: Single source of truth for all SystemMonitor implementations
- **Dependencies**: `github.com/SiriusScan/go-api` for Valkey connectivity

#### 2. **Deployment Modes**

**Development Mode:**

- Uses `go run main.go` to run SystemMonitor from source
- Automatically picks up code changes without rebuild
- Enabled when `GO_ENV=development` environment variable is set
- Used in sirius-engine and sirius-ui development containers

**Production Mode:**

- Uses pre-compiled binary built from GitHub source
- Compiled during Docker image build process
- Better performance and smaller runtime footprint
- Used in all production deployments

#### 3. **Container Integration**

**All Containers (PostgreSQL, RabbitMQ, Valkey, Engine, UI):**

- Build SystemMonitor from GitHub source during Docker image build
- Use multi-stage build to compile from `github.com/SiriusScan/app-system-monitor`
- Copy compiled binary to final image
- Start SystemMonitor alongside main service

**Development Mode (Engine, UI):**

- Volume-mount `../minor-projects/app-system-monitor` for live development
- Run with `go run main.go` instead of binary
- Enables rapid iteration without container rebuilds

## SystemMonitor Implementation

### CPU Monitoring (Fixed in v2.0)

The SystemMonitor uses a sophisticated CPU utilization calculation that eliminates drift:

```go
// Time-based CPU utilization calculation
cpuPercent := (float64(cpuDiff) / 1000000.0) / timeDiff / float64(sm.cpuCores) * 100.0
```

**Key Features:**

- **State Tracking**: Maintains previous CPU usage and timestamp
- **Core Detection**: Automatically detects available CPU cores from cgroups
- **Drift Prevention**: Uses time-based differences instead of cumulative values
- **Architecture Support**: Works across different CPU architectures

### Memory Monitoring

Uses cgroups v2 for accurate container memory metrics:

```go
// Read from cgroups v2
currentBytes := readCgroupFile("/sys/fs/cgroup/memory.current")
maxBytes := readCgroupFile("/sys/fs/cgroup/memory.max")
percent := float64(currentBytes) / float64(maxBytes) * 100.0
```

### Network Monitoring

Tracks network I/O from container interfaces:

```go
// Network statistics
rxBytes := readCgroupFile("/sys/class/net/eth0/statistics/rx_bytes")
txBytes := readCgroupFile("/sys/class/net/eth0/statistics/tx_bytes")
```

### Disk Monitoring

Calculates container filesystem usage:

```go
// Walk container filesystem (excluding mounted volumes)
filepath.WalkDir("/", func(path string, d os.DirEntry, err error) error {
    // Skip mounted volumes and system directories
    if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/proc") {
        return filepath.SkipDir
    }
    // Calculate total size
})
```

## Deployment Architecture

### Build Process

#### Production Builds (All Containers)

All containers use a multi-stage Docker build to compile SystemMonitor from source:

```dockerfile
# Builder stage - Clone and build SystemMonitor
FROM golang:1.23-alpine AS builder
RUN apk add --no-cache git
RUN git clone https://github.com/SiriusScan/app-system-monitor.git && \
    cd app-system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go

# Runtime stage - Copy binary
FROM <base-image>
COPY --from=builder /go/app-system-monitor/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor
```

**Benefits:**

- Always builds from latest source code
- No pre-compiled binary distribution needed
- Architecture-specific compilation
- Smaller final image size

#### Development Mode (Engine & UI)

Development containers use `go run` for live development:

```yaml
# docker-compose.dev.yaml
volumes:
  - ../minor-projects/app-system-monitor:/system-monitor
environment:
  - GO_ENV=development
```

**Startup logic checks environment:**

```bash
if [ "$GO_ENV" = "development" ] && [ -f "/system-monitor/main.go" ]; then
    CONTAINER_NAME=sirius-engine go run main.go &
elif [ -f "/system-monitor/system-monitor" ] && [ -x "/system-monitor/system-monitor" ]; then
    CONTAINER_NAME=sirius-engine ./system-monitor &
fi
```

### Container Startup Integration

#### PostgreSQL/RabbitMQ/Valkey Pattern (Production Only)

```bash
# In start-with-monitor.sh
echo "📊 Starting system monitor..."
cd /usr/local/bin
CONTAINER_NAME=sirius-postgres ./system-monitor &
```

These containers always use the compiled binary from the Docker build.

#### Engine Pattern (Development & Production)

```bash
# In start-enhanced.sh
if [ -d "/system-monitor" ]; then
    echo "Starting system monitor..."
    cd /system-monitor
    if [ "$GO_ENV" = "development" ] && [ -f "main.go" ]; then
        echo "Running system monitor with go run (development mode)"
        CONTAINER_NAME=sirius-engine go run main.go &
    elif [ -f "./system-monitor" ] && [ -x "./system-monitor" ]; then
        echo "Running system monitor binary (production mode)"
        CONTAINER_NAME=sirius-engine ./system-monitor &
    else
        echo "Error: System monitor not found (neither main.go nor binary)"
        exit 1
    fi
    SYSTEM_MONITOR_PID=$!
    sleep 2
    check_service "System Monitor" $SYSTEM_MONITOR_PID
fi
```

**Key Features:**

- Checks `GO_ENV` environment variable
- Prefers `go run` in development mode
- Falls back to binary in production
- Provides clear error messages if neither is available

#### UI Pattern (Development & Production)

```bash
# In start-dev.sh
if [ -d "/system-monitor" ] && [ -f "/system-monitor/main.go" ]; then
    echo "📊 Starting System Monitor..."
    cd /system-monitor
    CONTAINER_NAME=sirius-ui go run main.go &
    SYSTEM_MONITOR_PID=$!
    echo "✅ System Monitor started with PID: $SYSTEM_MONITOR_PID"
    cd /app
fi
```

```bash
# In start-prod.sh
if [ -f "/system-monitor/system-monitor" ] && [ -x "/system-monitor/system-monitor" ]; then
    echo "📊 Starting system monitor..."
    cd /system-monitor
    CONTAINER_NAME=sirius-ui ./system-monitor &
    SYSTEM_MONITOR_PID=$!
    echo "✅ System monitor started with PID: $SYSTEM_MONITOR_PID"
    cd /app
fi
```

## Configuration

### Environment Variables

| Variable         | Purpose                | Default         | Example           |
| ---------------- | ---------------------- | --------------- | ----------------- |
| `CONTAINER_NAME` | Container identifier   | `unknown`       | `sirius-postgres` |
| `VALKEY_HOST`    | Valkey server hostname | `sirius-valkey` | `localhost`       |
| `VALKEY_PORT`    | Valkey server port     | `6379`          | `6379`            |

### Metrics Storage

**Valkey Keys:**

- `system:metrics:{container_name}` - Latest metrics
- `system:logs:{container_name}:{timestamp}` - Log entries

**Metrics Structure:**

```json
{
  "container_name": "sirius-postgres",
  "timestamp": "2025-01-07T12:00:00Z",
  "cpu_percent": 15.2,
  "memory_usage_bytes": 67108864,
  "memory_percent": 1.8,
  "network_rx_bytes": 1048576,
  "network_tx_bytes": 524288,
  "disk_usage_bytes": 134217728,
  "disk_percent": 1.3,
  "process_count": 12,
  "file_descriptors": 45,
  "load_average_1m": 0.15,
  "load_average_5m": 0.12,
  "load_average_15m": 0.1,
  "uptime_seconds": 3600,
  "status": "running"
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. **SystemMonitor Not Starting / Exec Format Error**

**Symptoms:**

- Container starts but no metrics appear in monitoring dashboard
- Logs show "System Monitor failed to start or crashed"
- **"cannot execute binary file: Exec format error"** (most common in development mode)
- Container stuck in crash loop restarting every few seconds

**Most Likely Causes:**

1. **Development Mode Binary Mismatch** (95% of cases):

   - Volume-mounted `/system-monitor` contains pre-compiled binary for wrong architecture
   - Development container trying to execute x86_64 binary on ARM64 (or vice versa)
   - Solution: Use `go run` instead of pre-compiled binary

2. **Missing Binary**: SystemMonitor binary not present in container
3. **Permission Issues**: Binary not executable
4. **Go Not Available**: Development mode but Go not installed in container

**Diagnostic Steps:**

```bash
# Check if binary exists and architecture
docker exec <container> ls -la /system-monitor/
docker exec <container> file /system-monitor/system-monitor

# Check container architecture
docker exec <container> uname -m

# Check if Go is available (for development mode)
docker exec <container> which go
docker exec <container> go version

# Check environment mode
docker exec <container> env | grep GO_ENV

# Check container logs for startup mode
docker logs <container> | grep -i "system monitor\|go run\|development"
```

**Solutions:**

**For Development Mode (Engine/UI):**

1. **Verify startup script uses `go run`**:

   ```bash
   # Check if start-enhanced.sh or start-dev.sh has:
   if [ "$GO_ENV" = "development" ] && [ -f "main.go" ]; then
       go run main.go &
   fi
   ```

2. **Rebuild container to pick up updated startup script**:

   ```bash
   docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml build <service>
   docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d <service>
   ```

3. **Verify development environment is set**:
   ```bash
   # In docker-compose.dev.yaml
   environment:
     - GO_ENV=development
   ```

**For Production Mode:**

1. **Rebuild container** (rebuilds SystemMonitor from source):

   ```bash
   docker-compose build <service>
   docker-compose up -d <service>
   ```

2. **Verify Dockerfile has multi-stage build**:
   ```dockerfile
   FROM golang:1.23-alpine AS builder
   RUN git clone https://github.com/SiriusScan/app-system-monitor.git
   # ... build steps ...
   ```

#### 2. **CPU Utilization Drift**

**Symptoms:**

- CPU usage gradually increases over time
- Metrics don't match Docker's performance data
- CPU percentages exceed 100%

**Root Cause:**

- Old SystemMonitor versions used cumulative CPU time incorrectly
- Missing time-based calculation logic

**Solution:**

- Ensure using SystemMonitor v2.0+ with proper CPU calculation
- Verify `lastCPUUsage` and `lastCPUTime` state tracking

#### 3. **Valkey Connection Issues**

**Symptoms:**

- SystemMonitor starts but metrics not stored
- "Error storing metrics" in logs
- Empty metrics in monitoring dashboard

**Diagnostic Steps:**

```bash
# Check Valkey connectivity
docker exec <container> nc -zv sirius-valkey 6379

# Check Valkey logs
docker logs sirius-valkey

# Test Valkey connection from container
docker exec <container> redis-cli -h sirius-valkey ping
```

**Solutions:**

1. **Network Issues**: Check Docker network connectivity
2. **Valkey Down**: Restart Valkey container
3. **Firewall**: Check port 6379 accessibility

#### 4. **Service Crash Loop Due to Scanner/Other Service Failures**

**Symptoms:**

- SystemMonitor starts successfully but then container restarts
- Logs show "Scanner failed to start or crashed"
- Container repeatedly cycles through startup sequence
- SystemMonitor unable to maintain connection

**Root Cause:**

- In early implementations, any service failure (like scanner) would trigger `cleanup` function
- This shutdown ALL services including SystemMonitor
- Created unnecessary crash loops when only one service had issues

**Solution (Implemented in v2.1):**

The scanner and other non-critical services are now non-fatal:

```bash
# In start-enhanced.sh
if [ -n "$SCANNER_PATH" ]; then
    cd "$SCANNER_PATH"
    echo "Starting scanner service..."
    go run main.go &
    SCANNER_PID=$!
    sleep 2
    # Check if scanner started, but don't fail if it didn't
    if ! kill -0 $SCANNER_PID 2>/dev/null; then
        echo "Warning: Scanner failed to start, but continuing with other services"
        SCANNER_PID=""
    fi
fi
```

**Key Changes:**

- Scanner failure no longer calls `cleanup` function
- Other services (SystemMonitor, Terminal, Agent) continue running
- Warning logged but container remains operational
- Allows investigation of scanner issues without affecting monitoring

#### 5. **Memory Metrics Inaccurate**

**Symptoms:**

- Memory usage doesn't match container limits
- Memory percentage calculations seem wrong

**Diagnostic Steps:**

```bash
# Check cgroups v2 files
docker exec <container> cat /sys/fs/cgroup/memory.current
docker exec <container> cat /sys/fs/cgroup/memory.max

# Compare with Docker stats
docker stats <container> --no-stream
```

**Solutions:**

1. **Cgroups v2**: Ensure container supports cgroups v2
2. **Fallback Values**: Check if using fallback memory estimates
3. **Container Limits**: Verify memory limits are set correctly

### Performance Issues

#### High CPU Usage from SystemMonitor

**Symptoms:**

- SystemMonitor itself consuming significant CPU
- Container performance degraded

**Causes:**

1. **Frequent Polling**: Metrics collection interval too short
2. **Inefficient Calculations**: Complex disk usage calculations
3. **Memory Leaks**: Go runtime issues

**Solutions:**

1. **Adjust Polling**: Increase collection interval (default: 5 seconds)
2. **Optimize Disk Scanning**: Limit filesystem traversal
3. **Memory Profiling**: Use Go profiling tools

#### Memory Leaks

**Symptoms:**

- SystemMonitor memory usage grows over time
- Container memory limits exceeded

**Diagnostic Steps:**

```bash
# Monitor SystemMonitor memory usage
docker exec <container> ps aux | grep system-monitor

# Check for goroutine leaks
docker exec <container> curl http://localhost:6060/debug/pprof/goroutine
```

### Log Analysis

#### SystemMonitor Logs

**Location**: Container stdout/stderr
**Format**: Standard Go log format

**Key Log Messages:**

- `"Starting system monitor for container: {name}"` - Successful startup
- `"Error reading cpu.stat: {error}"` - CPU monitoring issues
- `"Error storing metrics: {error}"` - Valkey connectivity problems
- `"Warning: metrics channel full, dropping metrics"` - Performance issues

#### Log Patterns for Issues

```bash
# CPU monitoring problems
grep -i "cpu.stat\|cpu.max" <container_logs>

# Memory monitoring issues
grep -i "memory.current\|memory.max" <container_logs>

# Network connectivity
grep -i "valkey\|redis" <container_logs>

# Performance warnings
grep -i "channel full\|dropping" <container_logs>
```

## Maintenance and Updates

### Updating SystemMonitor

#### For Development Mode (Local Changes)

1. **Modify Source Code**:

   ```bash
   cd /minor-projects/app-system-monitor/
   # Make changes to main.go
   ```

2. **Test Changes** (no rebuild needed in development mode):

   ```bash
   # Restart container to pick up changes
   docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml restart sirius-engine
   # SystemMonitor will recompile with go run on startup
   ```

3. **Verify Changes**:

   ```bash
   # Check logs for SystemMonitor startup
   docker logs sirius-engine | grep -i "system monitor"

   # Verify metrics in Valkey
   docker exec sirius-valkey redis-cli get "system:metrics:sirius-engine"
   ```

#### For Production Deployment

1. **Push Changes to GitHub**:

   ```bash
   cd /minor-projects/app-system-monitor/
   git add .
   git commit -m "feat(monitoring): update SystemMonitor metrics"
   git push origin main
   ```

2. **Rebuild All Containers** (they fetch latest from GitHub):

   ```bash
   # Full rebuild with no cache to get latest source
   docker-compose build --no-cache sirius-postgres sirius-rabbitmq sirius-valkey sirius-engine sirius-ui
   ```

3. **Deploy Updates**:
   ```bash
   docker-compose up -d
   ```

#### Testing in Development Before Production

1. **Make changes locally** in `/minor-projects/app-system-monitor/`
2. **Test in development mode** with `docker-compose.dev.yaml`
3. **Verify metrics** are collecting correctly
4. **Commit and push** to GitHub
5. **Rebuild production images** to fetch from GitHub
6. **Deploy to production**

### Monitoring SystemMonitor Health

#### Health Check Endpoints

**Valkey Metrics Check**:

```bash
# Check if metrics are being stored
redis-cli -h sirius-valkey get "system:metrics:sirius-postgres"
```

**Container Process Check**:

```bash
# Verify SystemMonitor is running
docker exec <container> ps aux | grep system-monitor
```

#### Automated Monitoring

**Metrics Collection Frequency**: Every 5 seconds
**Log Generation**: Every 30 seconds
**Health Check**: Monitor Valkey key updates

### Development Guidelines

#### Adding New Metrics

1. **Update SystemMetrics struct**:

   ```go
   type SystemMetrics struct {
       // ... existing fields ...
       NewMetric float64 `json:"new_metric"`
   }
   ```

2. **Implement Collection Logic**:

   ```go
   func (sm *SystemMonitor) readNewMetric() float64 {
       // Implementation
   }
   ```

3. **Update gatherSystemMetrics**:
   ```go
   return SystemMetrics{
       // ... existing fields ...
       NewMetric: sm.readNewMetric(),
   }
   ```

#### Testing Changes

1. **Local Testing**:

   ```bash
   cd /minor-projects/app-system-monitor/
   go run main.go
   ```

2. **Container Testing**:

   ```bash
   # Build and test in container
   docker run --rm -it <container_image> /usr/local/bin/system-monitor
   ```

3. **Integration Testing**:
   ```bash
   # Deploy to development environment
   docker-compose -f docker-compose.dev.yaml up -d
   ```

## Security Considerations

### Container Security

- **Non-root Execution**: SystemMonitor runs with container user permissions
- **Read-only Access**: Only reads system files, no write access
- **Network Isolation**: Communicates only with Valkey service

### Data Privacy

- **No Sensitive Data**: Only collects system resource metrics
- **Local Processing**: All calculations performed within container
- **Encrypted Transport**: Valkey connections should use TLS in production

## Performance Tuning

### Optimization Settings

**Collection Intervals**:

- **Metrics**: 5 seconds (configurable)
- **Logs**: 30 seconds (configurable)

**Resource Limits**:

- **CPU**: Minimal impact (< 0.1% typical)
- **Memory**: ~10-20MB per container
- **Network**: Minimal bandwidth usage

### Scaling Considerations

- **Container Count**: Linear scaling with container count
- **Valkey Load**: Minimal impact on Valkey performance
- **Network Overhead**: Negligible for typical deployments

## Support and Escalation

### First-Level Support

1. **Check Container Status**: `docker ps`
2. **Review Logs**: `docker logs <container>`
3. **Verify Network**: Test Valkey connectivity
4. **Check Metrics**: Verify Valkey key updates

### Escalation Path

1. **Development Team**: For SystemMonitor code issues
2. **Infrastructure Team**: For container/Docker issues
3. **Database Team**: For Valkey connectivity problems

### Emergency Procedures

**SystemMonitor Down**:

1. Check container health
2. Restart affected containers
3. Verify Valkey connectivity
4. Check for resource constraints

**Metrics Not Updating**:

1. Verify SystemMonitor process running
2. Check Valkey connectivity
3. Review container logs
4. Test manual metric collection

---

## Quick Reference

### Essential Commands

```bash
# Development Mode - Restart to pick up changes
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml restart sirius-engine sirius-ui

# Production Mode - Rebuild from GitHub source
docker-compose build --no-cache sirius-postgres sirius-rabbitmq sirius-valkey sirius-engine sirius-ui

# Check SystemMonitor status
docker exec <container> ps aux | grep -E "system-monitor|go run main.go"

# View metrics in Valkey
docker exec sirius-valkey redis-cli get "system:metrics:<container_name>"

# Check container logs for startup mode
docker logs <container> | grep -i "system monitor\|development\|go run"

# Verify development environment
docker exec <container> env | grep GO_ENV

# Check for exec format errors
docker logs <container> | grep -i "exec format error"
```

### Key Files

**Source Code:**

- **SystemMonitor**: `/minor-projects/app-system-monitor/main.go`
- **GitHub Repo**: `https://github.com/SiriusScan/app-system-monitor`

**Container Integration:**

- **Engine Startup**: `/sirius-engine/start-enhanced.sh`
- **UI Dev Startup**: `/sirius-ui/start-dev.sh`
- **UI Prod Startup**: `/sirius-ui/start-prod.sh`
- **Other Services**: `/<service>/start-with-monitor.sh`

**Dockerfiles:**

- **Engine**: `/sirius-engine/Dockerfile` (multi-stage build from GitHub)
- **UI**: `/sirius-ui/Dockerfile` (multi-stage build from GitHub)
- **PostgreSQL**: `/sirius-postgres/Dockerfile` (multi-stage build from GitHub)
- **RabbitMQ**: `/sirius-rabbitmq/Dockerfile` (multi-stage build from GitHub)
- **Valkey**: `/sirius-valkey/Dockerfile` (multi-stage build from GitHub)

### Monitoring Endpoints

- **Valkey**: `sirius-valkey:6379`
- **Metrics Key**: `system:metrics:{container_name}`
- **Logs Key**: `system:logs:{container_name}:{timestamp}`

### Development Mode Indicators

**Logs showing development mode:**

```
Running system monitor with go run (development mode)
go: downloading github.com/SiriusScan/go-api...
System Monitor started with PID: 7
```

**Logs showing production mode:**

```
Running system monitor binary (production mode)
System monitor started with PID: 8
```

### Common Issues Quick Fix

| Issue                             | Quick Fix                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Exec format error                 | Rebuild with `docker-compose build <service>`                                 |
| SystemMonitor not running         | Check `docker logs <container>` for startup errors                            |
| Metrics not updating              | Verify Valkey connection: `docker exec <container> nc -zv sirius-valkey 6379` |
| Container crash loop              | Check if scanner failure is bringing down other services                      |
| Development changes not appearing | Restart container: `docker-compose restart <service>`                         |

---

_This documentation covers SystemMonitor v2.1+ with development mode support, CPU drift fixes, and multi-stage Docker builds. For older versions, refer to historical documentation or upgrade to the latest version._
