# sirius-engine Dockerfile

FROM golang:latest
WORKDIR /engine

# Build arguments for submodule commit SHAs
ARG GO_API_COMMIT_SHA=main
ARG APP_SCANNER_COMMIT_SHA=main
ARG APP_TERMINAL_COMMIT_SHA=main
ARG SIRIUS_NSE_COMMIT_SHA=main
ARG APP_AGENT_COMMIT_SHA=main

COPY .air.toml .air.toml

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y libpcap-dev libicu-dev

# Dependencies
# NMAP
RUN apt-get upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential libpcap-dev ndiff libssl-dev libssh-dev

# WORKDIR /tmp
# RUN wget https://nmap.org/dist/nmap-7.92.tar.bz2
# RUN tar xf nmap-7.92.tar.bz2

# WORKDIR /tmp/nmap-7.92
# RUN ./configure
# RUN make
# RUN make install
# RUN cp nmap /usr/bin/nmap
# RUN cp nmap-os-db /usr/local/bin/../share/nmap/nmap-os-db

# NMAP
RUN apt-get install -y nmap

# Rust Scan
WORKDIR /tmp
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN cargo install --git https://github.com/RustScan/RustScan.git --branch master

# PowerShell Installation - Architecture specific
WORKDIR /opt/microsoft/powershell

# Detect architecture and download appropriate PowerShell package
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.5.0/powershell-7.5.0-linux-arm64.tar.gz && \
    tar -xvf powershell-7.5.0-linux-arm64.tar.gz \
    ;; \
    "x86_64") \
    echo "Installing AMD64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.5.0/powershell-7.5.0-linux-x64.tar.gz && \
    tar -xvf powershell-7.5.0-linux-x64.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac

RUN chmod +x /opt/microsoft/powershell/pwsh
RUN ln -s /opt/microsoft/powershell/pwsh /usr/bin/pwsh

# Set up NSE directory structure
RUN mkdir -p /opt/sirius/nse && \
    chown -R 1000:1000 /opt/sirius && \
    chmod -R 755 /opt/sirius

# App Repos - Clone with specific commit SHAs for production use
WORKDIR /
RUN git clone https://github.com/SiriusScan/app-scanner.git && \
    cd /app-scanner && \
    git checkout ${APP_SCANNER_COMMIT_SHA}

RUN git clone https://github.com/SiriusScan/app-terminal.git && \
    cd /app-terminal && \
    git checkout ${APP_TERMINAL_COMMIT_SHA}

RUN git clone https://github.com/SiriusScan/go-api.git && \
    cd /go-api && \
    git checkout ${GO_API_COMMIT_SHA}

RUN git clone https://github.com/SiriusScan/app-agent.git && \
    cd /app-agent && \
    git checkout ${APP_AGENT_COMMIT_SHA}

# Optionally clone sirius-nse if needed
RUN git clone https://github.com/SiriusScan/sirius-nse.git && \
    cd /sirius-nse && \
    git checkout ${SIRIUS_NSE_COMMIT_SHA}

# Install Go dependencies for cloned repositories
WORKDIR /app-scanner
RUN go mod download

WORKDIR /app-terminal  
RUN go mod download

WORKDIR /go-api
RUN go mod download

WORKDIR /app-agent
RUN go mod download

# Go back to main workdir
WORKDIR /engine

# DEV Dependencies
RUN go install github.com/air-verse/air@latest

# Add startup script and make it the entrypoint
RUN apt install dos2unix
COPY start.sh /
RUN dos2unix /start.sh
RUN chmod +x /start.sh

# Create an enhanced startup script that handles both development and production modes
COPY start-enhanced.sh /
RUN dos2unix /start-enhanced.sh
RUN chmod +x /start-enhanced.sh

ENTRYPOINT ["/start-enhanced.sh"]