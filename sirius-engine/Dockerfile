# sirius-engine Dockerfile

FROM golang:latest
WORKDIR /engine

COPY .air.toml .air.toml

# Dependencies
# NMAP
RUN apt-get update -y && \
    apt-get upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential libpcap-dev ndiff libssl-dev libssh-dev

WORKDIR /tmp
RUN wget https://nmap.org/dist/nmap-7.92.tar.bz2
RUN tar xf nmap-7.92.tar.bz2

WORKDIR /tmp/nmap-7.92
RUN ./configure
RUN make
RUN make install
RUN cp nmap /usr/bin/nmap
RUN cp nmap-os-db /usr/local/bin/../share/nmap/nmap-os-db

# Rust Scan
WORKDIR /tmp
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN wget https://github.com/RustScan/RustScan/releases/download/2.3.0/rustscan-2.3.0-x86_64-linux.tar.xz

WORKDIR /
RUN git clone https://github.com/SiriusScan/app-scanner.git
RUN git clone https://github.com/SiriusScan/go-api.git
WORKDIR /app-scanner
RUN go build -o /engine/apps/bin/scanner main.go

WORKDIR /app-scanner
#DEV Dependencies
RUN go install github.com/air-verse/air@latest

# Invoke air to run the server after volume mount
CMD ["air", "-c", ".air.toml"]

EXPOSE 5672