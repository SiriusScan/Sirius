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

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 9001

# For development, we'll run go directly with volume-mounted source
# Start the API, system monitor, and administrator
CMD ["sh", "-c", "cd /system-monitor && CONTAINER_NAME=sirius-api go run main.go >> /tmp/system-monitor.log 2>&1 & cd /api && go mod tidy && go run main.go"]

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

# Use production go.mod (without replace directive)
RUN cp go.mod.prod go.mod

# Download dependencies using the published go-api module
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o sirius-api main.go

# Clone and build system monitor from separate repository
RUN git clone https://github.com/SiriusScan/app-system-monitor.git /tmp/system-monitor && \
    cd /tmp/system-monitor && \
    go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go

# Clone and build app administrator from separate repository
# Note: app-administrator repository not available, skipping for now

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

# Copy binaries from builder stage
COPY --from=builder /app/sirius-api /app/sirius-api
COPY --from=builder /tmp/system-monitor/system-monitor /app/system-monitor
# COPY --from=builder /tmp/app-administrator/administrator /app/administrator

# Note: go-api dependency is now included in the binary, no need to copy separately

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 9001

# Run the application with system monitor and administrator
CMD ["sh", "-c", "cd /system-monitor && CONTAINER_NAME=sirius-api ./system-monitor >> /tmp/system-monitor.log 2>&1 & cd /app && CONTAINER_NAME=sirius-api ./administrator >> /tmp/administrator.log 2>&1 & ./sirius-api"]