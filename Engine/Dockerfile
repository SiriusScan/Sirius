# Go API Dockerfile

FROM golang:1.20-bullseye
WORKDIR /engine

COPY .air.toml .air.toml

# Dependencies
RUN apt-get update
RUN apt install -y build-essential
RUN apt install -y libpcap-dev ndiff libssl-dev libssh-dev

WORKDIR /tmp
RUN wget https://nmap.org/dist/nmap-7.92.tar.bz2
RUN tar xf nmap-7.92.tar.bz2

WORKDIR /tmp/nmap-7.92
RUN ./configure
RUN make
RUN make install
RUN cp nmap /usr/bin/nmap
RUN cp nmap-os-db /usr/local/bin/../share/nmap/nmap-os-db

WORKDIR /engine
#DEV Dependencies
RUN go install github.com/cosmtrek/air@latest

# Invoke air to run the server after volume mount
ENTRYPOINT [ "air" ]  

EXPOSE 5672