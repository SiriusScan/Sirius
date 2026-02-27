# Custom PostgreSQL image with system monitoring
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

FROM postgres:15-alpine

# Copy pre-built system-monitor binary from shared base image
COPY --from=go-binaries /usr/local/bin/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor

# Create startup script with signal handling and password reconciliation
RUN cat <<'EOF' > /usr/local/bin/start-with-monitor.sh
#!/bin/sh
set -eu

shutdown_handler() {
    echo "Received signal, forwarding to PostgreSQL..."
    if [ -n "${POSTGRES_PID:-}" ]; then
        kill -TERM "$POSTGRES_PID" 2>/dev/null || true
        wait "$POSTGRES_PID" 2>/dev/null || true
    fi
    exit 0
}

trap shutdown_handler TERM INT

echo "Starting PostgreSQL..."
docker-entrypoint.sh postgres &
POSTGRES_PID=$!

PGUSER_RUNTIME="${POSTGRES_USER:-postgres}"
PGDB_RUNTIME="${POSTGRES_DB:-sirius}"

if [ -n "${POSTGRES_PASSWORD:-}" ]; then
    echo "Reconciling PostgreSQL user password from environment..."
    ATTEMPT=0
    until pg_isready -h 127.0.0.1 -U "$PGUSER_RUNTIME" >/dev/null 2>&1; do
        ATTEMPT=$((ATTEMPT + 1))
        if [ "$ATTEMPT" -ge 60 ]; then
            echo "PostgreSQL readiness timeout during password reconciliation"
            exit 1
        fi
        sleep 1
    done

    ESCAPED_POSTGRES_PASSWORD=$(printf "%s" "$POSTGRES_PASSWORD" | sed "s/'/''/g")
    if ! psql -v ON_ERROR_STOP=1 -U "$PGUSER_RUNTIME" -d "$PGDB_RUNTIME" \
        -c "ALTER ROLE \"$PGUSER_RUNTIME\" WITH PASSWORD '$ESCAPED_POSTGRES_PASSWORD';"; then
        echo "Failed to reconcile PostgreSQL password from environment"
        exit 1
    fi

    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h 127.0.0.1 \
        -U "$PGUSER_RUNTIME" -d "$PGDB_RUNTIME" -c "SELECT 1;" >/dev/null; then
        echo "Password reconciliation verification failed for PostgreSQL"
        exit 1
    fi

    echo "PostgreSQL password reconciliation verified."
fi

echo "Starting system monitor..."
CONTAINER_NAME=sirius-postgres /usr/local/bin/system-monitor >> /tmp/system-monitor.log 2>&1 &

echo "All services started"
wait "$POSTGRES_PID"
EOF
RUN sed -i 's/\r$//' /usr/local/bin/start-with-monitor.sh && \
    chmod +x /usr/local/bin/start-with-monitor.sh
RUN test -x /usr/local/bin/start-with-monitor.sh && /bin/sh -n /usr/local/bin/start-with-monitor.sh

ENV VALKEY_HOST=sirius-valkey
ENV VALKEY_PORT=6379
ENV CONTAINER_NAME=sirius-postgres

ENTRYPOINT ["/usr/local/bin/start-with-monitor.sh"]
