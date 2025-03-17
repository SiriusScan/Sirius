# sirius-engine Dockerfile

FROM golang:latest
WORKDIR /engine

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

# App Repos
WORKDIR /
RUN git clone https://github.com/SiriusScan/app-scanner.git
RUN git clone https://github.com/SiriusScan/app-terminal.git
RUN git clone https://github.com/SiriusScan/go-api.git

WORKDIR /app-scanner
#DEV Dependencies
RUN go install github.com/air-verse/air@latest

# Add startup script and make it the entrypoint
RUN apt install dos2unix
COPY start.sh /
RUN dos2unix /start.sh
RUN chmod +x /start.sh

# Remove specific workdir and cmd
ENTRYPOINT ["/start.sh"]