# Custom RabbitMQ image with system monitoring
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

FROM rabbitmq:3.12-management

# Copy pre-built system-monitor binary from shared base image
COPY --from=go-binaries /usr/local/bin/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor

# Create startup script with signal handling
RUN cat <<'EOF' > /usr/local/bin/start-with-monitor.sh
#!/bin/bash
set -e

shutdown_handler() {
    echo "Received signal, forwarding to RabbitMQ..."
    if [ -n "${RABBITMQ_PID:-}" ]; then
        kill -TERM "$RABBITMQ_PID" 2>/dev/null || true
        wait "$RABBITMQ_PID" 2>/dev/null || true
    fi
    exit 0
}

trap shutdown_handler TERM INT

echo "Starting RabbitMQ..."
docker-entrypoint.sh rabbitmq-server &
RABBITMQ_PID=$!

echo "Waiting for RabbitMQ to be ready..."
sleep 10

echo "Starting system monitor..."
CONTAINER_NAME=sirius-rabbitmq /usr/local/bin/system-monitor >> /tmp/system-monitor.log 2>&1 &

echo "All services started"
wait "$RABBITMQ_PID"
EOF
RUN chmod +x /usr/local/bin/start-with-monitor.sh

ENV VALKEY_HOST=sirius-valkey
ENV VALKEY_PORT=6379
ENV CONTAINER_NAME=sirius-rabbitmq

ENTRYPOINT ["/usr/local/bin/start-with-monitor.sh"]
