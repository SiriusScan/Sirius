# Custom Valkey image with system monitoring
#
# Local fallback stage for quick-start reliability:
# build system-monitor directly so compose up works even if GHCR base images
# are temporarily unavailable.
FROM golang:1.24-alpine AS go-binaries
RUN apk add --no-cache git ca-certificates tzdata && \
    git clone https://github.com/SiriusScan/app-system-monitor.git /tmp/system-monitor && \
    cd /tmp/system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /usr/local/bin/system-monitor main.go && \
    rm -rf /tmp/system-monitor

FROM valkey/valkey:7.2-alpine

# Copy pre-built system-monitor binary from shared base image
COPY --from=go-binaries /usr/local/bin/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor

# Create startup script with signal handling
RUN cat <<'EOF' > /usr/local/bin/start-with-monitor.sh
#!/bin/sh
set -e

shutdown_handler() {
    echo "Received signal, forwarding to Valkey..."
    if [ -n "${VALKEY_PID:-}" ]; then
        kill -TERM "$VALKEY_PID" 2>/dev/null || true
        wait "$VALKEY_PID" 2>/dev/null || true
    fi
    exit 0
}

trap shutdown_handler TERM INT

echo "Starting Valkey..."
docker-entrypoint.sh valkey-server &
VALKEY_PID=$!

echo "Waiting for Valkey to be ready..."
sleep 5

echo "Starting system monitor..."
CONTAINER_NAME=sirius-valkey /usr/local/bin/system-monitor >> /tmp/system-monitor.log 2>&1 &

echo "All services started"
wait "$VALKEY_PID"
EOF
RUN chmod +x /usr/local/bin/start-with-monitor.sh

ENV VALKEY_HOST=sirius-valkey
ENV VALKEY_PORT=6379
ENV CONTAINER_NAME=sirius-valkey

ENTRYPOINT ["/usr/local/bin/start-with-monitor.sh"]
