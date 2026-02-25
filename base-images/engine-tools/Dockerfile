# sirius-base-engine-tools
#
# Ubuntu 22.04 base image with all heavy scanning tools pre-installed
# for the sirius-engine service. Nmap 7.95 is compiled from source once
# here so the engine Dockerfile never has to do it again.
#
# Published to: ghcr.io/siriusscan/sirius-base-engine-tools:latest
# Consumers: sirius-engine (development and runtime stages)
#
# Contents:
#   - Nmap 7.95 (compiled from source)
#   - RustScan (architecture-specific pre-built binary)
#   - PowerShell 7.4.6 (architecture-specific pre-built binary)
#   - All required runtime system packages

FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install all runtime system packages needed by sirius-engine
RUN apt-get update && \
    apt-get install -y \
        git \
        ca-certificates \
        tzdata \
        build-essential \
        libpcap-dev \
        postgresql-client \
        libicu-dev \
        libssl-dev \
        libssh-dev \
        curl \
        wget \
        bash \
        dos2unix \
        unzip \
        automake \
        autoconf \
        libtool \
        perl \
        procps \
    && rm -rf /var/lib/apt/lists/*

# Build and install Nmap 7.95 from source
# Done once here so application Dockerfiles never need to repeat it
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
RUN command -v bash    >/dev/null && \
    command -v curl    >/dev/null && \
    command -v nmap    >/dev/null && \
    command -v rustscan >/dev/null && \
    command -v pwsh    >/dev/null && \
    command -v psql    >/dev/null && \
    command -v pkill   >/dev/null
