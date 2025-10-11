# Fix: system-monitor and app-administrator startup failures in production and development modes

## Problem Statement

The recently added `system-monitor` and `app-administrator` services are not starting correctly in production mode across all three containers (`sirius-api`, `sirius-engine`, `sirius-ui`). Additionally, development mode has issues with `app-administrator` not starting at all.

## Current Behavior

### Production Mode Issues

**sirius-api:**

- ❌ System monitor: Wrong binary path - tries to `cd /system-monitor` but binary is at `/app/system-monitor`
- ❌ App administrator: Not built or copied to container at all
- ❌ Startup CMD has incorrect paths

**sirius-engine:**

- ✅ System monitor: Built and copied correctly
- ❌ App administrator: Not built in Dockerfile
- ❌ Startup script expects binary that doesn't exist

**sirius-ui:**

- ✅ System monitor: Built and copied correctly
- ❌ App administrator: Not built in Dockerfile
- ❌ Startup script expects binary that doesn't exist

### Development Mode Issues

**sirius-api:**

- ✅ System monitor: Starts correctly with `go run`
- ❌ App administrator: Not started in CMD at all

**sirius-engine:**

- ✅ System monitor: Starts correctly with `go run`
- ❌ App administrator: Startup script only checks for binary, not source code

**sirius-ui:**

- ✅ System monitor: Starts correctly with `go run`
- ❌ App administrator: Not started in startup script at all

## Expected Behavior

Both `system-monitor` and `app-administrator` should start automatically in all three containers in both development and production modes:

- **Production mode**: Use compiled binaries from GitHub repositories
- **Development mode**: Use `go run` with volume-mounted source code

## Root Cause Analysis

### Production Mode

1. **app-administrator** is not included in any Dockerfile build stage
2. **sirius-api** has incorrect paths for system-monitor binary
3. GitHub repository exists at: https://github.com/SiriusScan/app-administrator

### Development Mode

1. **sirius-api** CMD doesn't include administrator startup
2. **sirius-engine** startup script only checks for binary, not source
3. **sirius-ui** startup script doesn't include administrator at all

## Implementation Plan

### Phase 1: Production Mode Fixes ✅ PLANNED

#### sirius-api Dockerfile

- [ ] **Fix system-monitor paths**: Change clone destination and copy paths
- [ ] **Add app-administrator build**: Clone and build from GitHub
- [ ] **Copy administrator binary**: Add to runner stage
- [ ] **Fix CMD**: Correct all binary paths
- [ ] **Update permissions**: Add administrator to chmod and chown

#### sirius-engine Dockerfile

- [ ] **Add app-administrator build**: Clone and build in builder stage
- [ ] **Copy to development stage**: Add binary to development image
- [ ] **Copy to runtime stage**: Add binary to production image
- [ ] **Create directories**: Add /app-administrator to mkdir commands
- [ ] **Update ownership**: Include in chown commands

#### sirius-ui Dockerfile

- [ ] **Add app-administrator build**: Clone and build in production stage
- [ ] **Copy administrator binary**: Place in /app/ directory
- [ ] **Update ownership**: Include in chown (already covered by /app)

### Phase 2: Development Mode Fixes ✅ PLANNED

#### sirius-api Dockerfile

- [ ] **Update CMD**: Add administrator startup with `go run`

#### sirius-engine start-enhanced.sh

- [ ] **Update administrator logic**: Check for source code (`main.go`) in development mode
- [ ] **Add go run fallback**: Use `go run main.go` when GO_ENV=development

#### sirius-ui start-dev.sh

- [ ] **Add administrator startup**: New section to start administrator with `go run`

### Phase 3: Testing ✅ PLANNED

#### Production Mode Testing

- [ ] Build all containers: `docker compose build`
- [ ] Start services: `docker compose up -d`
- [ ] Verify binaries exist in containers
- [ ] Check process status with `ps aux`
- [ ] Review logs in `/tmp/system-monitor.log` and `/tmp/administrator.log`

#### Development Mode Testing

- [ ] Build dev containers: `docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build`
- [ ] Start dev services: `docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d`
- [ ] Verify source code mounted correctly
- [ ] Check process status with `ps aux`
- [ ] Review logs for both services

### Phase 4: Deployment ✅ PLANNED

- [ ] Merge fixes to main branch
- [ ] Verify production deployment
- [ ] Document changes in CHANGELOG
- [ ] Close this issue with test results

## Affected Components

- `sirius-api/Dockerfile` (production: development, runner stages)
- `sirius-engine/Dockerfile` (production: builder, development, runtime stages)
- `sirius-engine/start-enhanced.sh` (administrator startup logic)
- `sirius-ui/Dockerfile` (production: production stage)
- `sirius-ui/start-dev.sh` (add administrator startup)

## Testing Strategy

### Manual Verification Commands

```bash
# Check binaries exist (production)
docker exec sirius-api ls -lh /system-monitor/system-monitor /app/administrator
docker exec sirius-engine ls -lh /system-monitor/system-monitor /app-administrator/administrator
docker exec sirius-ui ls -lh /system-monitor/system-monitor /app/administrator

# Check processes running
docker exec sirius-api ps aux | grep -E "system-monitor|administrator"
docker exec sirius-engine ps aux | grep -E "system-monitor|administrator"
docker exec sirius-ui ps aux | grep -E "system-monitor|administrator"

# Check logs
docker exec sirius-api cat /tmp/system-monitor.log
docker exec sirius-api cat /tmp/administrator.log
docker exec sirius-engine cat /tmp/system-monitor.log
docker exec sirius-ui cat /tmp/system-monitor.log
```

### Expected Results

**Production Mode:**

- Both binaries exist and are executable
- Both processes show in `ps aux` output
- Logs show successful startup without errors
- Services respond to RabbitMQ messages

**Development Mode:**

- Source code visible at volume mount paths
- Both processes running via `go run`
- Logs show successful startup
- Hot reload works for code changes

## Additional Context

### Repository Links

- System Monitor: https://github.com/SiriusScan/app-system-monitor
- App Administrator: https://github.com/SiriusScan/app-administrator

### Related Documentation

- Development workflow: `documentation/dev/README.development.md`
- Container testing: `documentation/dev/test/README.container-testing.md`
- Git operations: `documentation/dev/operations/README.git-operations.md`

### Dependencies

- Both services require RabbitMQ connection
- System monitor sends metrics via RabbitMQ
- Administrator listens for commands via RabbitMQ

### Priority

**HIGH** - These services are critical for:

- Container health monitoring
- Remote container administration
- System observability
- Operational management
