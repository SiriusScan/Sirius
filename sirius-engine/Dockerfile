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

# Clone go-api first (needed by other components)
RUN git clone https://github.com/SiriusScan/go-api.git && \
    cd go-api && \
    git checkout ${GO_API_COMMIT_SHA} && \
    go mod tidy

# Clone app-scanner
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd app-scanner && \
    git checkout ${APP_SCANNER_COMMIT_SHA} && \
    # Fix Port struct compilation errors: Port struct uses Number, not ID
    # Replace ID: in Port struct literals and port.ID field accesses
    sed -i '/sirius\.Port{/,/}/s/ID:\s*\([^,}]*\)/Number: \1/g' modules/rustscan/rustscan.go && \
    sed -i '/sirius\.Port{/,/}/s/ID:\s*\([^,}]*\)/Number: \1/g' modules/nmap/nmap.go && \
    sed -i '/sirius\.Port{/,/}/s/ID:\s*\([^,}]*\)/Number: \1/g' modules/naabu/naabu.go && \
    sed -i 's/port\.ID/port.Number/g' internal/scan/manager.go && \
    go mod download && \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o scanner main.go

# Clone and build app-terminal from GitHub
RUN git clone https://github.com/SiriusScan/app-terminal.git && \
    cd app-terminal && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o terminal cmd/main.go

# Clone and build app-agent from GitHub
RUN git clone https://github.com/SiriusScan/app-agent.git && \
    cd app-agent && \
    git checkout ${APP_AGENT_COMMIT_SHA} && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o agent cmd/agent/main.go && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go

# Clone sirius-nse
RUN git clone https://github.com/SiriusScan/sirius-nse.git && \
    cd sirius-nse && \
    git checkout ${SIRIUS_NSE_COMMIT_SHA}

# Clone and build app-system-monitor from GitHub
RUN git clone https://github.com/SiriusScan/app-system-monitor.git && \
    cd app-system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go

# Clone and build app-administrator from GitHub
RUN git clone https://github.com/SiriusScan/app-administrator.git && \
    cd app-administrator && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o administrator main.go

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
    unzip \
    automake \
    autoconf \
    libtool \
    perl \
    && rm -rf /var/lib/apt/lists/*

# Build and install Nmap 7.95 from source for compatibility with sirius-nse scripts
RUN cd /tmp && \
    wget https://nmap.org/dist/nmap-7.95.tar.bz2 && \
    tar xjf nmap-7.95.tar.bz2 && \
    cd nmap-7.95 && \
    touch aclocal.m4 configure Makefile.in config.h.in && \
    find . -name Makefile.in -exec touch {} \; && \
    ./configure --without-zenmap --without-nmap-update --without-ndiff && \
    make && \
    make install && \
    cd / && \
    rm -rf /tmp/nmap-7.95 /tmp/nmap-7.95.tar.bz2

# Remove default Nmap scripts - will symlink to sirius-nse after it's copied
RUN rm -rf /usr/local/share/nmap/scripts

# Install air for live reloading (compatible version with Go 1.23)
RUN go install github.com/air-verse/air@v1.52.3

# Install RustScan pre-built binary (much faster than compiling from source)
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 RustScan" && \
    wget https://github.com/bee-san/RustScan/releases/latest/download/aarch64-linux-rustscan.zip && \
    unzip aarch64-linux-rustscan.zip && \
    mv rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan && \
    rm aarch64-linux-rustscan.zip \
    ;; \
    "x86_64") \
    echo "Installing AMD64 RustScan" && \
    wget https://github.com/bee-san/RustScan/releases/latest/download/x86_64-linux-rustscan.tar.gz.zip && \
    unzip x86_64-linux-rustscan.tar.gz.zip && \
    tar -xzf x86_64-linux-rustscan.tar.gz && \
    mv rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan && \
    rm x86_64-linux-rustscan.tar.gz.zip x86_64-linux-rustscan.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac
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
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

# Copy built applications and repositories from builder stage for fallback
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/
COPY --from=builder /repos/app-system-monitor/system-monitor /system-monitor/
COPY --from=builder /repos/app-administrator/administrator /app-administrator/
RUN chmod +x /system-monitor/system-monitor /app-administrator/administrator

# Copy NSE scripts and manifest to the expected location
RUN mkdir -p /opt/sirius/nse/sirius-nse && \
    cp -r /sirius-nse/* /opt/sirius/nse/sirius-nse/ 2>/dev/null || echo "No sirius-nse files to copy" && \
    chmod -R 755 /opt/sirius/nse

# Symlink Nmap scripts directory to sirius-nse (ensures ONLY sirius-nse scripts are used)
RUN ln -sf /opt/sirius/nse/sirius-nse/scripts /usr/local/share/nmap/scripts && \
    echo "Symlinked Nmap scripts to sirius-nse"

# Copy configuration and scripts
COPY .air.toml .air.toml
COPY start.sh /start.sh
COPY start-enhanced.sh /start-enhanced.sh

# Copy local apps directory (includes manifest.json) to provide fallback
COPY apps/ /engine/apps/

# Ensure the NSE manifest is available from local apps as fallback
RUN if [ -f /engine/apps/app-scanner/manifest.json ]; then \
        mkdir -p /opt/sirius/nse/sirius-nse && \
        cp /engine/apps/app-scanner/manifest.json /opt/sirius/nse/sirius-nse/ && \
        echo "✅ Copied local manifest.json to /opt/sirius/nse/sirius-nse/"; \
    fi

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
    git \
    libpcap-dev \
    libicu-dev \
    build-essential \
    libssl-dev \
    libssh-dev \
    ca-certificates \
    wget \
    curl \
    dos2unix \
    unzip \
    automake \
    autoconf \
    libtool \
    perl \
    && rm -rf /var/lib/apt/lists/*

# Build and install Nmap 7.95 from source for compatibility with sirius-nse scripts
RUN cd /tmp && \
    wget https://nmap.org/dist/nmap-7.95.tar.bz2 && \
    tar xjf nmap-7.95.tar.bz2 && \
    cd nmap-7.95 && \
    touch aclocal.m4 configure Makefile.in config.h.in && \
    find . -name Makefile.in -exec touch {} \; && \
    ./configure --without-zenmap --without-nmap-update --without-ndiff && \
    make && \
    make install && \
    cd / && \
    rm -rf /tmp/nmap-7.95 /tmp/nmap-7.95.tar.bz2

# Remove default Nmap scripts - will symlink to sirius-nse after it's copied
RUN rm -rf /usr/local/share/nmap/scripts

# Install RustScan pre-built binary (much faster than compiling from source)
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 RustScan" && \
    wget https://github.com/bee-san/RustScan/releases/latest/download/aarch64-linux-rustscan.zip && \
    unzip aarch64-linux-rustscan.zip && \
    mv rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan && \
    rm aarch64-linux-rustscan.zip \
    ;; \
    "x86_64") \
    echo "Installing AMD64 RustScan" && \
    wget https://github.com/bee-san/RustScan/releases/latest/download/x86_64-linux-rustscan.tar.gz.zip && \
    unzip x86_64-linux-rustscan.tar.gz.zip && \
    tar -xzf x86_64-linux-rustscan.tar.gz && \
    mv rustscan /usr/local/bin/ && \
    chmod +x /usr/local/bin/rustscan && \
    rm x86_64-linux-rustscan.tar.gz.zip x86_64-linux-rustscan.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac
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
RUN mkdir -p /app-scanner /app-terminal /app-agent /go-api /sirius-nse /system-monitor /app-administrator

# Copy built applications and repositories from builder stage
COPY --from=builder /repos/app-scanner/scanner /app-scanner/
COPY --from=builder /repos/app-scanner /app-scanner-src/
COPY --from=builder /repos/app-terminal/terminal /app-terminal/
COPY --from=builder /repos/app-terminal /app-terminal-src/
COPY --from=builder /repos/app-agent/agent /app-agent/
COPY --from=builder /repos/app-agent/server /app-agent/
COPY --from=builder /repos/app-agent /app-agent-src/
COPY --from=builder /repos/go-api /go-api/
COPY --from=builder /repos/sirius-nse /sirius-nse/
COPY --from=builder /repos/app-system-monitor/system-monitor /system-monitor/
COPY --from=builder /repos/app-administrator/administrator /app-administrator/
RUN chmod +x /system-monitor/system-monitor /app-administrator/administrator

# Copy NSE scripts and manifest to the expected location for production
RUN mkdir -p /opt/sirius/nse/sirius-nse && \
    cp -r /sirius-nse/* /opt/sirius/nse/sirius-nse/ 2>/dev/null || echo "No sirius-nse files to copy" && \
    chmod -R 755 /opt/sirius/nse

# Symlink Nmap scripts directory to sirius-nse (ensures ONLY sirius-nse scripts are used)
RUN ln -sf /opt/sirius/nse/sirius-nse/scripts /usr/local/share/nmap/scripts && \
    echo "Symlinked Nmap scripts to sirius-nse"

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
RUN chown -R sirius:sirius /engine /app-scanner /app-terminal /app-agent /go-api /sirius-nse /opt/sirius /system-monitor /app-administrator
USER sirius

# Expose ports
EXPOSE 5174 50051

# Set environment variables
ENV GO_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

ENTRYPOINT ["/start-enhanced.sh"]