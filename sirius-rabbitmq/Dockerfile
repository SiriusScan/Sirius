# Custom RabbitMQ image with system monitoring
#
# system-monitor is sourced from the shared sirius-base-go-builder image,
# eliminating the need for a Go build stage in this container.

FROM ghcr.io/siriusscan/sirius-base-go-builder:latest AS go-binaries

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
