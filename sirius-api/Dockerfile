# Multi-stage Dockerfile for sirius-api

# Development stage - for local development with volume mounts
FROM golang:1.24-alpine AS development

# Install runtime dependencies
RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# Set working directory
WORKDIR /api

# Change ownership
RUN chown -R appuser:appgroup /api

# Copy startup script
COPY start-dev.sh /start-dev.sh
RUN sed -i 's/\r$//' /start-dev.sh && chmod +x /start-dev.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 9001

# For development, use startup script to safely handle optional services
CMD ["/start-dev.sh"]

# Stage 1: Builder stage
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

# Copy source code first
COPY . .

# Use production go.mod and go.sum (without replace directive)
RUN cp go.mod.prod go.mod && cp go.sum.prod go.sum

# Download dependencies using the published go-api module
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o sirius-api main.go

# Clone and build system monitor from separate repository
RUN git clone https://github.com/SiriusScan/app-system-monitor.git /tmp/app-system-monitor && \
    cd /tmp/app-system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go

# Clone and build app administrator from separate repository
RUN git clone https://github.com/SiriusScan/app-administrator.git /tmp/app-administrator && \
    cd /tmp/app-administrator && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o administrator main.go

# Stage 2: Runtime stage
FROM alpine:latest AS runner

# Install runtime dependencies
RUN apk --no-cache add \
    ca-certificates \
    tzdata

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# Set working directory
WORKDIR /app

# Create directories for services
RUN mkdir -p /system-monitor

# Copy binaries from builder stage
COPY --from=builder /app/sirius-api /app/sirius-api
COPY --from=builder /tmp/app-system-monitor/system-monitor /system-monitor/system-monitor
COPY --from=builder /tmp/app-administrator/administrator /app/administrator

# Note: go-api dependency is now included in the binary, no need to copy separately

# Set permissions
RUN chmod +x /system-monitor/system-monitor /app/administrator /app/sirius-api

# Change ownership
RUN chown -R appuser:appgroup /app /system-monitor

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 9001

# Run the application with system monitor and administrator
CMD ["sh", "-c", "CONTAINER_NAME=sirius-api /system-monitor/system-monitor >> /tmp/system-monitor.log 2>&1 & CONTAINER_NAME=sirius-api /app/administrator >> /tmp/administrator.log 2>&1 & /app/sirius-api"]