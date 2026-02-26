# sirius-base-engine-tools
#
# Ubuntu 22.04 base image with all heavy scanning tools pre-installed
# for the sirius-engine service. Nmap 7.95 is compiled from source once
# here so the engine Dockerfile never has to do it again.
#
# Multi-stage build: Nmap is compiled in a separate stage so
# build-essential and other compile-only packages are not present in
# the final image. This also greatly reduces the committed layer size
# and avoids filling the BuildKit overlay disk on CI runners.
#
# Published to: ghcr.io/siriusscan/sirius-base-engine-tools:latest
# Consumers: sirius-engine (development and runtime stages)
#
# Contents:
#   - Nmap 7.95 (compiled from source, only binaries copied to final)
#   - RustScan (architecture-specific pre-built binary)
#   - PowerShell 7.4.6 (architecture-specific pre-built binary)
#   - All required runtime system packages

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build Nmap from source
# Kept separate so build-essential / dev headers never land in the final image.
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

# Compile Nmap. make -j$(nproc) parallelism is fine here – the builder
# stage is discarded after COPY so its large intermediate files never
# commit to a registry layer. Do NOT override CFLAGS/CXXFLAGS on the
# make command line; doing so replaces the configure-generated flags
# (including required -D defines) and breaks the compilation.
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
# Stage 2: Final runtime image
# Only copies the nmap binary; no build tools included.
# ─────────────────────────────────────────────────────────────────────────────
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime packages only (no build-essential)
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

# Copy compiled nmap binary and data files from builder stage
COPY --from=nmap-builder /usr/local/bin/nmap /usr/local/bin/nmap
COPY --from=nmap-builder /usr/local/share/nmap /usr/local/share/nmap

# Install RustScan pre-built binary (architecture-specific)
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

# Install PowerShell 7.4.6 (architecture-specific)
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

# Verify all required tools are present
RUN command -v bash     >/dev/null && \
    command -v curl     >/dev/null && \
    command -v nmap     >/dev/null && \
    command -v rustscan >/dev/null && \
    command -v pwsh     >/dev/null && \
    command -v psql     >/dev/null && \
    command -v pkill    >/dev/null
