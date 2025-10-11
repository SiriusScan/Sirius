# Custom RabbitMQ image with system monitoring and administration
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
FROM rabbitmq:3.12-management

# Copy built binaries from builder stage
COPY --from=builder /go/app-system-monitor/system-monitor /usr/local/bin/system-monitor
RUN chmod +x /usr/local/bin/system-monitor

# Create startup script with signal handling
RUN echo '#!/bin/bash' > /usr/local/bin/start-with-monitor.sh && \
    echo 'set -e' >> /usr/local/bin/start-with-monitor.sh && \
    echo '# Function to handle shutdown' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'shutdown_handler() {' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    echo "🔄 Received signal, forwarding to RabbitMQ..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    if [ ! -z "$RABBITMQ_PID" ]; then' >> /usr/local/bin/start-with-monitor.sh && \
    echo '        kill -TERM $RABBITMQ_PID 2>/dev/null || true' >> /usr/local/bin/start-with-monitor.sh && \
    echo '        wait $RABBITMQ_PID 2>/dev/null || true' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    fi' >> /usr/local/bin/start-with-monitor.sh && \
    echo '    exit 0' >> /usr/local/bin/start-with-monitor.sh && \
    echo '}' >> /usr/local/bin/start-with-monitor.sh && \
    echo '# Set up signal handlers' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'trap shutdown_handler TERM INT' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "🐰 Starting RabbitMQ..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'docker-entrypoint.sh rabbitmq-server &' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'RABBITMQ_PID=$!' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "⏳ Waiting for RabbitMQ to be ready..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'sleep 10' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "📊 Starting system monitor..."' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'CONTAINER_NAME=sirius-rabbitmq /usr/local/bin/system-monitor >> /tmp/system-monitor.log 2>&1 &' >> /usr/local/bin/start-with-monitor.sh && \
    # echo 'echo "🔧 Starting app administrator..."' >> /usr/local/bin/start-with-monitor.sh && \
    # echo 'CONTAINER_NAME=sirius-rabbitmq /usr/local/bin/administrator &' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'echo "✅ All services started"' >> /usr/local/bin/start-with-monitor.sh && \
    echo 'wait $RABBITMQ_PID' >> /usr/local/bin/start-with-monitor.sh && \
    chmod +x /usr/local/bin/start-with-monitor.sh

# Set environment variables for system monitor
ENV VALKEY_HOST=sirius-valkey
ENV VALKEY_PORT=6379
ENV CONTAINER_NAME=sirius-rabbitmq

# Override the default entrypoint
ENTRYPOINT ["/usr/local/bin/start-with-monitor.sh"]
