# Multi-stage Dockerfile for sirius-engine
#
# No external GHCR base images: utility Go binaries and engine runtime tools
# (Nmap from source, RustScan, PowerShell) are built in this file.
#
# Stages: utility-go-binaries, nmap-builder, engine-runtime-base, builder,
#         development, runtime.

# ─────────────────────────────────────────────────────────────────────────────
# Utility binaries: system-monitor + administrator
# ─────────────────────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS utility-go-binaries

RUN apk add --no-cache git ca-certificates tzdata

RUN git clone https://github.com/SiriusScan/app-system-monitor.git /tmp/system-monitor && \
    cd /tmp/system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /usr/local/bin/system-monitor main.go && \
    rm -rf /tmp/system-monitor

RUN git clone https://github.com/SiriusScan/app-administrator.git /tmp/administrator && \
    cd /tmp/administrator && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /usr/local/bin/administrator main.go && \
    rm -rf /tmp/administrator

# ─────────────────────────────────────────────────────────────────────────────
# Nmap compiled from source (build stage only; not shipped in final layers)
# ─────────────────────────────────────────────────────────────────────────────
FROM ubuntu:22.04 AS nmap-builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpcap-dev \
        libssl-dev \
        libssh-dev \
        libicu-dev \
        automake \
        autoconf \
        libtool \
        perl \
        wget \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN cd /tmp && \
    wget -q https://nmap.org/dist/nmap-7.95.tar.bz2 && \
    tar xjf nmap-7.95.tar.bz2 && \
    cd nmap-7.95 && \
    touch aclocal.m4 configure Makefile.in config.h.in && \
    find . -name Makefile.in -exec touch {} \; && \
    ./configure --without-zenmap --without-nmap-update --without-ndiff && \
    make -j$(nproc) && \
    make install && \
    cd / && \
    rm -rf /tmp/nmap-7.95 /tmp/nmap-7.95.tar.bz2

# ─────────────────────────────────────────────────────────────────────────────
# Engine runtime base: Nmap binaries + RustScan + PowerShell + runtime packages
# ─────────────────────────────────────────────────────────────────────────────
FROM ubuntu:22.04 AS engine-runtime-base

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
        tzdata \
        libpcap0.8 \
        libpcap-dev \
        postgresql-client \
        libicu70 \
        libssl3 \
        libssh-4 \
        curl \
        wget \
        bash \
        dos2unix \
        unzip \
        procps \
    && rm -rf /var/lib/apt/lists/*

COPY --from=nmap-builder /usr/local/bin/nmap /usr/local/bin/nmap
COPY --from=nmap-builder /usr/local/share/nmap /usr/local/share/nmap

RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
        "aarch64") \
            wget -q https://github.com/bee-san/RustScan/releases/latest/download/aarch64-linux-rustscan.zip && \
            unzip aarch64-linux-rustscan.zip && \
            mv rustscan /usr/local/bin/ && \
            chmod +x /usr/local/bin/rustscan && \
            rm aarch64-linux-rustscan.zip \
            ;; \
        "x86_64") \
            wget -q https://github.com/bee-san/RustScan/releases/latest/download/x86_64-linux-rustscan.tar.gz.zip && \
            unzip x86_64-linux-rustscan.tar.gz.zip && \
            tar -xzf x86_64-linux-rustscan.tar.gz && \
            mv rustscan /usr/local/bin/ && \
            chmod +x /usr/local/bin/rustscan && \
            rm x86_64-linux-rustscan.tar.gz.zip x86_64-linux-rustscan.tar.gz \
            ;; \
        *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac

RUN mkdir -p /opt/microsoft/powershell && \
    cd /opt/microsoft/powershell && \
    ARCH=$(uname -m) && \
    case "$ARCH" in \
        "aarch64") \
            wget -q https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-arm64.tar.gz && \
            tar -xf powershell-7.4.6-linux-arm64.tar.gz && \
            rm powershell-7.4.6-linux-arm64.tar.gz \
            ;; \
        "x86_64") \
            wget -q https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-x64.tar.gz && \
            tar -xf powershell-7.4.6-linux-x64.tar.gz && \
            rm powershell-7.4.6-linux-x64.tar.gz \
            ;; \
        *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac && \
    chmod +x /opt/microsoft/powershell/pwsh && \
    ln -s /opt/microsoft/powershell/pwsh /usr/bin/pwsh

ENV PATH="/usr/local/bin:${PATH}"

RUN command -v bash     >/dev/null && \
    command -v curl     >/dev/null && \
    command -v nmap     >/dev/null && \
    command -v rustscan >/dev/null && \
    command -v pwsh     >/dev/null && \
    command -v psql     >/dev/null && \
    command -v pkill    >/dev/null

# ─────────────────────────────────────────────────────────────────────────────
# Builder: engine Go services (CGO + libpcap for app-scanner)
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

# Build arguments for submodule commit SHAs.
#
# Pin policy (enforced by .github/workflows/check-pin-consistency.yml):
#   - These ARG defaults are the canonical pins. CI fallbacks in
#     .github/workflows/ci.yml (build-engine, build-api) MUST match.
#   - Floating refs (main/master) are forbidden; use a full SHA or a tag.
#   - When a minor-project is bumped, update the ARG default here, the
#     CI fallback, and SHA-AUDIT-2026-04.md (or its successor) in one PR.
#
# Audit doc: documentation/dev-notes/SHA-AUDIT-2026-04.md
ARG GO_API_COMMIT_SHA=v0.0.17
ARG APP_SCANNER_COMMIT_SHA=cd3943c71dd4d9a7419c63386780c65b559bf039
ARG APP_TERMINAL_COMMIT_SHA=5745e43ca1f2ad3936a02a51cc77bfcf33ee95c1
ARG SIRIUS_NSE_COMMIT_SHA=a58e8c5330b49bd8f4e93c27e340c43c1fa89fa9
ARG APP_AGENT_COMMIT_SHA=7a2203979152dcc2a86dc32d4d44a6fa990b11e9
ARG PINGPP_COMMIT_SHA=9508a16c40a49746feb7cab4b8c1c358246169b0

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

# Clone and build app-scanner (CGO_ENABLED=1, requires libpcap).
# All previous inline sed patches against internal/scan/manager.go have been
# upstreamed in app-scanner@ca1ef2f. See documentation/dev-notes/SHA-AUDIT-2026-04.md.
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd app-scanner && \
    git checkout ${APP_SCANNER_COMMIT_SHA} && \
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
# Development: hot-reload on engine-runtime-base
# ─────────────────────────────────────────────────────────────────────────────
FROM engine-runtime-base AS development

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

# Install a C toolchain so Air can rebuild app-scanner in-container.
# app-scanner pulls libpcap via cgo (CGO_ENABLED=1 in app-scanner/.air.toml);
# the runtime stage only ships libpcap.so, but the dev stage needs the
# full compiler + headers so `go build` succeeds on every save. Keeping
# this in the dev stage only avoids bloating the production runtime.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

# Install air for live reloading. go install drops the binary in
# $GOPATH/bin (default /root/go/bin) which is not on PATH unless we add
# it explicitly. Without this, start-enhanced.sh's `air &` invocations
# silently fall back to broken behavior in dev mode.
RUN go install github.com/air-verse/air@v1.52.3
ENV PATH="/root/go/bin:${PATH}"

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

COPY --from=utility-go-binaries /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=utility-go-binaries /usr/local/bin/administrator /app-administrator/administrator
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

# Copy startup scripts. Per-service .air.toml lives inside each minor-
# project (app-agent, app-terminal, app-scanner) and is consumed via the
# dev-mode bind mount; the engine no longer ships its own orphan copy.
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
# Runtime (production)
# ─────────────────────────────────────────────────────────────────────────────
FROM engine-runtime-base AS runtime

WORKDIR /engine

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

COPY --from=utility-go-binaries /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=utility-go-binaries /usr/local/bin/administrator /app-administrator/administrator
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

# Copy startup scripts. The runtime image does not ship a top-level
# .air.toml; production builds run pre-compiled binaries (see
# start-enhanced.sh), and dev-mode hot reload uses the per-service
# .air.toml provided by each bind-mounted minor-project.
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
