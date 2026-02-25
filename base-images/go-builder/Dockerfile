# sirius-base-go-builder
#
# Alpine-based Go 1.24 image with pre-compiled common Sirius binaries.
# Published to: ghcr.io/siriusscan/sirius-base-go-builder:latest
#
# Consumers:
#   sirius-api, sirius-engine, sirius-ui,
#   sirius-postgres, sirius-rabbitmq, sirius-valkey
#
# Downstream Dockerfiles use:
#   COPY --from=ghcr.io/siriusscan/sirius-base-go-builder /usr/local/bin/system-monitor ...
#   COPY --from=ghcr.io/siriusscan/sirius-base-go-builder /usr/local/bin/administrator ...

FROM golang:1.24-alpine

RUN apk add --no-cache git ca-certificates tzdata

# Build app-system-monitor (used in 6 containers)
RUN git clone https://github.com/SiriusScan/app-system-monitor.git /tmp/system-monitor && \
    cd /tmp/system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /usr/local/bin/system-monitor main.go && \
    rm -rf /tmp/system-monitor

# Build app-administrator (used in 3 containers)
RUN git clone https://github.com/SiriusScan/app-administrator.git /tmp/administrator && \
    cd /tmp/administrator && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /usr/local/bin/administrator main.go && \
    rm -rf /tmp/administrator
