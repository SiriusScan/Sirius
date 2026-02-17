---
title: "Logging Conventions"
description: "Project-wide logging standards, level guidelines, and configuration"
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["development", "standards", "observability"]
tags: ["logging", "slog", "zap", "LOG_LEVEL", "structured-logging"]
related_docs:
  - "README.development.md"
  - "README.go-api-sdk.md"
  - "README.docker-architecture.md"
search_keywords:
  - "log level"
  - "LOG_LEVEL"
  - "slog"
  - "zap"
  - "structured logging"
  - "debug"
  - "verbosity"
---

# Logging Conventions

This document defines the project-wide logging standards for all Sirius services.

## Guiding Principles

1. **Structured logging only** -- all Go services use `log/slog` (SDK, sirius-api, app-scanner) or `go.uber.org/zap` (app-agent). Raw `log.Print*` and `fmt.Print*` are not used for service logging.
2. **Level-gated output** -- every service reads the `LOG_LEVEL` environment variable at startup. Only messages at or above the configured level are emitted.
3. **No sensitive data** -- connection strings, credentials, tokens, and full request/response bodies must never appear in logs.
4. **No debug dumps** -- printing entire structs (e.g., `%+v` on a host or vulnerability object) is prohibited. Log only the identifying fields needed for correlation (IP, ID, name).
5. **CLI output is separate** -- user-facing CLI tools (e.g., `template-cli`) use `fmt.Print*` for deliberate terminal output. This is distinct from service logging.

## LOG_LEVEL Configuration

### Supported Values

| Value   | Description                                              |
| ------- | -------------------------------------------------------- |
| `debug` | Everything, including per-host scan phases and cache ops |
| `info`  | Startup, significant events, scan-level progress         |
| `warn`  | Non-fatal issues, degraded behavior, retries             |
| `error` | Failures that affect results or require attention        |

Default: **`info`** (when `LOG_LEVEL` is unset or unrecognized).

### Per-Environment Defaults

| Environment                                 | `sirius-api` | `sirius-engine` (scanner) | `app-agent` |
| ------------------------------------------- | :----------: | :-----------------------: | :---------: |
| **Production** (`docker-compose.yaml`)      |   `error`    |          `info`           |   `info`    |
| **Development** (`docker-compose.dev.yaml`) |    `info`    |          `info`           |   `info`    |

To temporarily enable debug output during development, override in `docker-compose.dev.yaml` or pass as an environment variable:

```bash
LOG_LEVEL=debug docker compose -f docker-compose.dev.yaml up
```

## Shared Initialization Helpers

### SDK (slog) -- `go-api/sirius/slogger`

Used by `sirius-api` and `app-scanner`. Call once at the top of `main()`:

```go
import "github.com/SiriusScan/go-api/sirius/slogger"

func main() {
    slogger.Init()   // configures slog.SetDefault() from LOG_LEVEL
    // ...
}
```

Helper functions:

- `slogger.Level()` -- returns the current `slog.Level`
- `slogger.IsDebug()` -- returns true when debug logging is active

### app-agent (zap) -- `internal/config`

```go
import "github.com/SiriusScan/app-agent/internal/config"

func main() {
    logger := config.NewLogger()   // reads LOG_LEVEL, returns *zap.Logger
    defer logger.Sync()
    // ...
}
```

## Level Assignment Guidelines

### Debug

Use for output that is only useful when actively investigating a specific issue:

- Per-host scan phase progress (`Phase 0: Fingerprinting on 10.0.0.1`)
- Individual host submission confirmations
- Cache hit/miss details
- Queue message bodies
- HID generation, version detection
- Periodic flush counts

### Info

Use for meaningful, scan-level or service-level events:

- Service startup and configuration
- Scan started / scan completed (aggregate)
- Template resolution
- Significant state transitions

### Warn

Use when something unexpected happened but the service can continue:

- Failed to sync NSE scripts (will retry)
- Host appears to be down (skipping)
- Failed to update KV store with discovery data
- Deprecated configuration detected

### Error

Use when a requested operation failed:

- Failed to create KV store connection
- Invalid scan message (cannot be processed)
- Template not found
- Database query failures
- API submission failures

## Structured Key-Value Pairs

Always use structured fields instead of string interpolation:

```go
// Good
slog.Info("Scan completed", "scan_id", scanID, "hosts", hostCount, "vulns", vulnCount)

// Bad
slog.Info(fmt.Sprintf("Scan %s completed: %d hosts, %d vulns", scanID, hostCount, vulnCount))
```

### Common Field Names

Use consistent field names across the project:

| Field         | Description         |
| ------------- | ------------------- |
| `error`       | Error value         |
| `ip`          | Host IP address     |
| `scan_id`     | Scan identifier     |
| `host_count`  | Number of hosts     |
| `template_id` | Template identifier |
| `queue`       | Queue name          |
| `duration`    | Operation duration  |
| `port_count`  | Number of ports     |
| `script_id`   | Script identifier   |

## Anti-Patterns

### Do Not

- Use `log.Panicln` or `log.Fatalf` in HTTP handlers (return proper error responses instead)
- Log entire structs with `%+v` or `%#v`
- Log connection strings or credentials
- Use emoji in structured log messages (level already conveys severity)
- Use `fmt.Printf` for service-level logging (only for CLI user output)
- Create per-request loggers unless adding request-scoped context

### Exceptions

- `log.Fatalf` is acceptable in `main()` for unrecoverable startup errors (e.g., cannot connect to database)
- `fmt.Print*` is correct for CLI tools that produce user-facing terminal output
- Test files may use `t.Log` / `t.Logf` freely

## Migration Checklist

When working on a Go file that still uses `log.Print*` or `fmt.Printf` for logging:

1. Replace `"log"` import with `"log/slog"`
2. Convert `log.Printf("message: %s", val)` to `slog.Info("message", "key", val)`
3. Choose the correct level (see guidelines above)
4. Remove any `%+v` struct dumps
5. Remove emoji from log messages
6. Verify no sensitive data is logged
