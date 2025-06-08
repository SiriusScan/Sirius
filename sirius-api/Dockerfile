# Multi-stage Dockerfile for sirius-api
# Stage 1: Builder stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

# First, clone the go-api dependency to a temporary location
WORKDIR /tmp
RUN git clone https://github.com/SiriusScan/go-api.git

# Now set up the main app
WORKDIR /app
COPY go.mod go.sum ./

# Create a temporary go.mod with replace directive
RUN echo "module github.com/SiriusScan/sirius-api" > go.mod.tmp && \
    echo "" >> go.mod.tmp && \
    echo "go 1.22.0" >> go.mod.tmp && \
    echo "" >> go.mod.tmp && \
    echo "replace github.com/SiriusScan/go-api => /tmp/go-api" >> go.mod.tmp && \
    cat go.mod | grep -v "^module\|^go " >> go.mod.tmp && \
    mv go.mod.tmp go.mod

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

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