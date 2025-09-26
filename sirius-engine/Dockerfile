# Multi-stage Dockerfile for sirius-engine
# Stage 1: Build stage with all dependencies
FROM golang:1.23-bullseye AS builder

# Set working directory
WORKDIR /build

# Install build dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    git \
    ca-certificates \
    tzdata \
    build-essential \
    libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

# Build arguments for submodule commit SHAs
ARG GO_API_COMMIT_SHA=main
ARG APP_SCANNER_COMMIT_SHA=main
ARG APP_TERMINAL_COMMIT_SHA=main
ARG SIRIUS_NSE_COMMIT_SHA=main
ARG APP_AGENT_COMMIT_SHA=main

# Clone and build repositories
WORKDIR /repos

# Clone app-scanner
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd app-scanner && \
    git checkout ${APP_SCANNER_COMMIT_SHA} && \
    go mod download && \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o scanner main.go

# Clone go-api first (needed by other components)
RUN git clone https://github.com/SiriusScan/go-api.git && \
    cd go-api && \
    git checkout ${GO_API_COMMIT_SHA} && \
    go mod tidy

# Clone app-terminal
RUN git clone https://github.com/SiriusScan/app-terminal.git && \
    cd app-terminal && \
    git checkout ${APP_TERMINAL_COMMIT_SHA} && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o terminal cmd/main.go

# Clone app-agent
RUN git clone https://github.com/SiriusScan/app-agent.git && \
    cd app-agent && \
    git checkout ${APP_AGENT_COMMIT_SHA} && \
    go mod tidy && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o agent cmd/agent/main.go && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o command-receiver cmd/command-receiver/main.go && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o command-sender cmd/command-sender/main.go

# Clone sirius-nse
RUN git clone https://github.com/SiriusScan/sirius-nse.git && \
    cd sirius-nse && \
    git checkout ${SIRIUS_NSE_COMMIT_SHA}

# Stage 2: Development stage with Go compiler and tools
FROM golang:1.23-bullseye AS development

# Set working directory
WORKDIR /engine

# Install development dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    git \
    ca-certificates \
    tzdata \
    build-essential \
    libpcap-dev \
    libicu-dev \
    libssl-dev \
    curl \
    wget \
    bash \
    dos2unix \
    nmap \
    && rm -rf /var/lib/apt/lists/*

# Install air for live reloading (compatible version with Go 1.23)
RUN go install github.com/air-verse/air@v1.52.3

# Install Rust and RustScan to /usr/local/bin for system-wide access
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    . ~/.cargo/env && \
    cargo install --git https://github.com/RustScan/RustScan.git --branch master && \
    cp ~/.cargo/bin/rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan
ENV PATH="/usr/local/bin:${PATH}"

# Install PowerShell for development stage
RUN mkdir -p /opt/microsoft/powershell && \
    cd /opt/microsoft/powershell && \
    ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-arm64.tar.gz && \
    tar -xvf powershell-7.4.6-linux-arm64.tar.gz && \
    rm powershell-7.4.6-linux-arm64.tar.gz \
    ;; \
    "x86_64") \
    echo "Installing AMD64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-x64.tar.gz && \
    tar -xvf powershell-7.4.6-linux-x64.tar.gz && \
    rm powershell-7.4.6-linux-x64.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac && \
    chmod +x /opt/microsoft/powershell/pwsh && \
    ln -s /opt/microsoft/powershell/pwsh /usr/bin/pwsh

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && \
    chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse

# Copy built applications and repositories from builder stage for fallback
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/

# Copy configuration and scripts
COPY .air.toml .air.toml
COPY start.sh /start.sh
COPY start-enhanced.sh /start-enhanced.sh

# Make scripts executable and fix line endings
RUN dos2unix /start.sh /start-enhanced.sh && \
    chmod +x /start.sh /start-enhanced.sh

# Set environment variables for development
ENV GO_ENV=development
ENV PATH="/root/.cargo/bin:${PATH}"

# Expose ports
EXPOSE 5174 50051

ENTRYPOINT ["/start-enhanced.sh"]

# Stage 3: Production runtime stage with optimized tools
FROM ubuntu:22.04 AS runtime

# Set working directory
WORKDIR /engine

# Install runtime dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    libpcap-dev \
    libicu-dev \
    build-essential \
    libssl-dev \
    libssh-dev \
    nmap \
    ca-certificates \
    wget \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and RustScan to /usr/local/bin for system-wide access
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    . ~/.cargo/env && \
    cargo install --git https://github.com/RustScan/RustScan.git --branch master && \
    cp ~/.cargo/bin/rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan
ENV PATH="/usr/local/bin:${PATH}"

# Install PowerShell - Architecture specific
WORKDIR /opt/microsoft/powershell
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-arm64.tar.gz && \
    tar -xvf powershell-7.4.6-linux-arm64.tar.gz && \
    rm powershell-7.4.6-linux-arm64.tar.gz \
    ;; \
    "x86_64") \
    echo "Installing AMD64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/powershell-7.4.6-linux-x64.tar.gz && \
    tar -xvf powershell-7.4.6-linux-x64.tar.gz && \
    rm powershell-7.4.6-linux-x64.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac

RUN chmod +x /opt/microsoft/powershell/pwsh && \
    ln -s /opt/microsoft/powershell/pwsh /usr/bin/pwsh

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && \
    chmod -R 755 /opt/sirius

# Create application directories
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse

# Copy built applications and repositories from builder stage
COPY --from=builder /repos/app-scanner/scanner /app-scanner/
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal/terminal /app-terminal/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent/agent /app-agent/
COPY --from=builder /repos/app-agent/server /app-agent/
COPY --from=builder /repos/app-agent/command-receiver /app-agent/
COPY --from=builder /repos/app-agent/command-sender /app-agent/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/

# Create non-root user for security
RUN groupadd -r sirius && useradd -r -g sirius sirius

# Copy configuration and scripts
COPY .air.toml .air.toml
COPY start.sh /start.sh
COPY start-enhanced.sh /start-enhanced.sh

# Make scripts executable and fix line endings
RUN dos2unix /start.sh /start-enhanced.sh && \
    chmod +x /start.sh /start-enhanced.sh

# Change ownership for non-root execution
RUN chown -R sirius:sirius /engine /app-scanner /app-terminal /app-agent /go-api /sirius-nse /opt/sirius
USER sirius

# Expose ports
EXPOSE 5174 50051

# Set environment variables
ENV GO_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

ENTRYPOINT ["/start-enhanced.sh"]