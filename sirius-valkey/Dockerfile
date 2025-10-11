# Custom Valkey image with system monitoring and administration
FROM golang:1.23-alpine AS builder

# Install git for cloning repositories
RUN apk add --no-cache git

# Clone and build app-system-monitor from GitHub
RUN git clone https://github.com/SiriusScan/app-system-monitor.git && \
    cd app-system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go

# Note: app-administrator repository not available, skipping for now

# Final stage
FROM valkey/valkey:7.2-alpine

# Copy built binaries from builder stage
COPY --from=builder /go/app-system-monitor/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor

# Create startup script with signal handling
RUN echo '#!/bin/sh' > /usr/local/bin/start-with-monitor.sh && \
    echo 'set -e' >> /usr/local/bin/start-with-monitor.sh && \
    echo '# Function to handle shutdown' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'shutdown_handler() {' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    echo "🔄 Received signal, forwarding to Valkey..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    if [ ! -z "$VALKEY_PID" ]; then' >> /usr/local/bin/start-with-monitor.sh && \
    echo '        kill -TERM $VALKEY_PID 2>/dev/null || true' >> /usr/local/bin/start-with-monitor.sh && \
    echo '        wait $VALKEY_PID 2>/dev/null || true' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    fi' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    exit 0' >> /usr/local/bin/start-with-monitor.sh && \
    echo '}' >> /usr/local/bin/start-with-monitor.sh && \
    echo '# Set up signal handlers' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'trap shutdown_handler TERM INT' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "🔑 Starting Valkey..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'docker-entrypoint.sh valkey-server &' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'VALKEY_PID=$!' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "⏳ Waiting for Valkey to be ready..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'sleep 5' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "📊 Starting system monitor..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'CONTAINER_NAME=sirius-valkey /usr/local/bin/system-monitor >> /tmp/system-monitor.log 2>&1 &' >> /usr/local/bin/start-with-monitor.sh && \
    # echo 'echo "🔧 Starting app administrator..."' >> /usr/local/bin/start-with-monitor.sh && \
    # echo 'CONTAINER_NAME=sirius-valkey /usr/local/bin/administrator &' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "✅ All services started"' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'wait $VALKEY_PID' >> /usr/local/bin/start-with-monitor.sh && \
    chmod +x /usr/local/bin/start-with-monitor.sh

# Set environment variables for system monitor
ENV VALKEY_HOST=sirius-valkey
ENV VALKEY_PORT=6379
ENV CONTAINER_NAME=sirius-valkey

# Override the default entrypoint
ENTRYPOINT ["/usr/local/bin/start-with-monitor.sh"]
