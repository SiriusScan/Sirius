# Multi-stage Dockerfile for sirius-engine
#
# Stage 1 (builder): Compiles all engine-specific Go services.
#   Uses golang:1.24-bullseye because app-scanner requires CGO + libpcap.
#   Pulls pre-built system-monitor and administrator from the shared base image
#   so they never need to be compiled here.
#
# Stage 2 (development): Hot-reload dev environment.
#   Based on sirius-base-engine-tools which already contains Nmap 7.95,
#   RustScan, and PowerShell -- nothing heavy needs to be installed here.
#
# Stage 3 (runtime): Production container.
#   Based on sirius-base-engine-tools for the same reason.

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM golang:1.24-bullseye AS builder

WORKDIR /build

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        git \
        ca-certificates \
        tzdata \
        build-essential \
        libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

# Build arguments for submodule commit SHAs
ARG GO_API_COMMIT_SHA=v0.0.16
ARG APP_SCANNER_COMMIT_SHA=4a47f73
ARG APP_TERMINAL_COMMIT_SHA=main
ARG SIRIUS_NSE_COMMIT_SHA=main
ARG APP_AGENT_COMMIT_SHA=50b405a
ARG PINGPP_COMMIT_SHA=master

WORKDIR /repos

# Clone go-api (needed as a dependency by other components)
RUN git clone https://github.com/SiriusScan/go-api.git && \
    cd go-api && \
    git checkout ${GO_API_COMMIT_SHA} && \
    go mod tidy

# Clone ping++ (fingerprinting engine, needed by app-scanner)
RUN git clone https://github.com/SiriusScan/pingpp.git "ping++" && \
    cd "ping++" && \
    git checkout ${PINGPP_COMMIT_SHA}

# Clone and build app-scanner (CGO_ENABLED=1, requires libpcap)
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd app-scanner && \
    git checkout ${APP_SCANNER_COMMIT_SHA} && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\            }' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\                slog.Error("Failed to mark scan as failed", "error", updateErr)' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\            }); updateErr != nil {' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\                return nil' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\                scan.EndTime = time.Now().Format(time.RFC3339)' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\                scan.Status = "failed"' internal/scan/manager.go && \
    sed -i '/sm\.logger\.LogScanError(scanMsg\.ID, "template_resolution", "template_not_found", "Failed to resolve template", err)/a\            if updateErr := sm.scanUpdater.Update(context.Background(), func(scan *store.ScanResult) error {' internal/scan/manager.go && \
    sed -i '0,/if ctx.Err() != nil {/s//if false \&\& ctx.Err() != nil {/' internal/scan/manager.go && \
    sed -i 's|return fmt.Errorf("failed to submit host data with source attribution: %w", err)|slog.Warn("Will continue scan without source-attributed persistence", "error", err)|' internal/scan/manager.go && \
    go mod download && \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o scanner main.go

# Clone and build app-terminal
RUN git clone https://github.com/SiriusScan/app-terminal.git && \
    cd app-terminal && \
    git checkout ${APP_TERMINAL_COMMIT_SHA} && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o terminal cmd/main.go

# Clone and build app-agent
RUN git clone https://github.com/SiriusScan/app-agent.git && \
    cd app-agent && \
    git checkout ${APP_AGENT_COMMIT_SHA} && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o agent cmd/agent/main.go && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go

# Clone sirius-nse (Nmap script library, no compilation needed)
RUN git clone https://github.com/SiriusScan/sirius-nse.git && \
    cd sirius-nse && \
    git checkout ${SIRIUS_NSE_COMMIT_SHA}

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Development
# Based on sirius-base-engine-tools which already contains:
#   Nmap 7.95, RustScan, PowerShell, all required system packages
# ─────────────────────────────────────────────────────────────────────────────
FROM ghcr.io/siriusscan/sirius-base-engine-tools:latest AS development

WORKDIR /engine

# Install Go 1.24 for hot-reload development (air requires Go 1.20+)
# Ubuntu 22.04's apt golang is 1.18; air's hugo dep needs 1.20+
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
        aarch64|arm64) GOARCH=arm64 ;; \
        x86_64|amd64)  GOARCH=amd64 ;; \
        *) echo "Unsupported: $ARCH" && exit 1 ;; \
    esac && \
    wget -q "https://go.dev/dl/go1.24.0.linux-${GOARCH}.tar.gz" -O /tmp/go.tar.gz && \
    rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tar.gz && \
    rm /tmp/go.tar.gz && \
    ln -sf /usr/local/go/bin/go /usr/bin/go

ENV PATH="/usr/local/go/bin:${PATH}"

# Install air for live reloading
RUN go install github.com/air-verse/air@v1.52.3

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

# Copy pre-built system-monitor and administrator from shared base
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/administrator /app-administrator/administrator
RUN chmod +x /system-monitor/system-monitor /app-administrator/administrator

# Copy built applications and repositories from builder stage (used as fallback sources)
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/

# Ensure sirius-nse is readable
RUN chmod -R 755 /sirius-nse

# Remove default Nmap scripts and symlink to sirius-nse
RUN rm -rf /usr/local/share/nmap/scripts && \
    ln -sf /sirius-nse/scripts /usr/local/share/nmap/scripts

# Copy configuration and startup scripts
COPY .air.toml .air.toml
COPY start.sh /start.sh
COPY start-enhanced.sh /start-enhanced.sh

# Fix line endings and validate startup scripts
RUN dos2unix /start.sh /start-enhanced.sh && \
    chmod +x /start.sh /start-enhanced.sh && \
    /bin/bash -n /start-enhanced.sh

ENV GO_ENV=development
ENV PATH="/root/.cargo/bin:/usr/local/bin:${PATH}"

EXPOSE 5174 50051

ENTRYPOINT ["/start-enhanced.sh"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Runtime (production)
# Based on sirius-base-engine-tools which already contains:
#   Nmap 7.95, RustScan, PowerShell, all required system packages
# ─────────────────────────────────────────────────────────────────────────────
FROM ghcr.io/siriusscan/sirius-base-engine-tools:latest AS runtime

WORKDIR /engine

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

# Copy pre-built system-monitor and administrator from shared base
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/administrator /app-administrator/administrator
RUN chmod +x /system-monitor/system-monitor /app-administrator/administrator

# Copy compiled binaries from builder stage
COPY --from=builder /repos/app-scanner/scanner /app-scanner/
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal/terminal /app-terminal/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent/agent /app-agent/
COPY --from=builder /repos/app-agent/server /app-agent/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/

# Ensure sirius-nse is readable
RUN chmod -R 755 /sirius-nse

# Remove default Nmap scripts and symlink to sirius-nse
RUN rm -rf /usr/local/share/nmap/scripts && \
    ln -sf /sirius-nse/scripts /usr/local/share/nmap/scripts

# Enforce runtime startup contract
RUN command -v bash    >/dev/null && \
    command -v curl    >/dev/null && \
    command -v psql    >/dev/null && \
    command -v pkill   >/dev/null && \
    command -v nmap    >/dev/null && \
    command -v rustscan >/dev/null && \
    command -v pwsh    >/dev/null

# Copy configuration and startup scripts
COPY .air.toml .air.toml
COPY start.sh /start.sh
COPY start-enhanced.sh /start-enhanced.sh

# Fix line endings and validate startup scripts
RUN dos2unix /start.sh /start-enhanced.sh && \
    chmod +x /start.sh /start-enhanced.sh && \
    /bin/bash -n /start-enhanced.sh

# Non-root user for security
RUN groupadd -r sirius && useradd -r -g sirius sirius

# Change ownership for non-root execution
RUN chown -R sirius:sirius \
    /engine /app-scanner /app-terminal /app-agent /go-api \
    /sirius-nse /opt/sirius /system-monitor /app-administrator

USER sirius

EXPOSE 5174 50051

ENV GO_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

ENTRYPOINT ["/start-enhanced.sh"]
