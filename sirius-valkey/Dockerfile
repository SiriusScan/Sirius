# Custom Valkey image with system monitoring
#
# system-monitor is sourced from the shared sirius-base-go-builder image,
# eliminating the need for a Go build stage in this container.

FROM ghcr.io/siriusscan/sirius-base-go-builder:latest AS go-binaries

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
