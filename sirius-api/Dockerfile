# Multi-stage Dockerfile for sirius-api

# Development stage - for local development with volume mounts
FROM golang:1.23-alpine AS development

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
CMD ["sh", "-c", "cd /api && go mod tidy && go run main.go"]

# Stage 1: Builder stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

# Copy source code first
COPY . .

# Clone the latest go-api dependency to the expected relative location
RUN rm -rf ../go-api && \
    git clone https://github.com/SiriusScan/go-api.git ../go-api && \
    cd ../go-api && \
    git pull origin main && \
    echo "Using go-api commit: $(git rev-parse HEAD)"

# Download dependencies with the cloned go-api
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o sirius-api main.go

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

# Copy binary from builder stage
COPY --from=builder /app/sirius-api /app/sirius-api

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 9001

# Run the application
CMD ["./sirius-api"]