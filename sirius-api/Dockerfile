# Multi-stage Dockerfile for sirius-api
#
# Pre-built system-monitor and administrator are sourced from the shared
# sirius-base-go-builder image so the builder stage only needs to compile
# the API binary itself.

# ─────────────────────────────────────────────────────────────────────────────
# Development stage: for local development with volume mounts
# ─────────────────────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS development

RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

WORKDIR /api

RUN chown -R appuser:appgroup /api

COPY start-dev.sh /start-dev.sh
RUN sed -i 's/\r$//' /start-dev.sh && chmod +x /start-dev.sh

USER appuser

EXPOSE 9001

CMD ["/start-dev.sh"]

# ─────────────────────────────────────────────────────────────────────────────
# Builder stage: compile the API binary
# ─────────────────────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata

# Copy source code
COPY . .

# Use production go.mod and go.sum (without local replace directive)
RUN cp go.mod.prod go.mod && cp go.sum.prod go.sum

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o sirius-api main.go

# ─────────────────────────────────────────────────────────────────────────────
# Runtime stage
# system-monitor and administrator are copied from the shared base image,
# so this stage does not need to clone or compile any external Go repos.
# ─────────────────────────────────────────────────────────────────────────────
FROM alpine:latest AS runner

RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    curl

RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

WORKDIR /app

RUN mkdir -p /system-monitor

# Copy API binary from builder stage
COPY --from=builder /app/sirius-api /app/sirius-api

# Copy pre-built binaries from shared base image (no extra git clones needed)
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/administrator /app/administrator

RUN chmod +x /system-monitor/system-monitor /app/administrator /app/sirius-api

RUN chown -R appuser:appgroup /app /system-monitor

USER appuser

EXPOSE 9001

CMD ["sh", "-c", "CONTAINER_NAME=sirius-api /system-monitor/system-monitor >> /tmp/system-monitor.log 2>&1 & CONTAINER_NAME=sirius-api /app/administrator >> /tmp/administrator.log 2>&1 & /app/sirius-api"]
