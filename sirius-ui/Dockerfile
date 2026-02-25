# Multi-stage Dockerfile for sirius-ui with development and production stages

# ─────────────────────────────────────────────────────────────────────────────
# Base stage: common Node.js dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS base

# Install system and native build dependencies for all architectures.
# bcrypt may fall back to node-gyp compilation (notably on arm64/musl), which
# requires Python + make + g++ at install time.
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Replace bun commands with npm/npx equivalents for compatibility
COPY package.json package.json.bak
RUN sed -i 's/bunx prisma generate/npx prisma generate/g' package.json && \
    sed -i 's/bun next/npx next/g' package.json && \
    sed -i 's/bun run/npm run/g' package.json

# Clone sirius-nse repository for NSE scripts (needed by scanner profile management)
ARG SIRIUS_NSE_COMMIT_SHA=main
RUN mkdir -p /sirius-nse && \
    git clone https://github.com/SiriusScan/sirius-nse.git /sirius-nse && \
    cd /sirius-nse && \
    git checkout ${SIRIUS_NSE_COMMIT_SHA} && \
    echo "Cloned sirius-nse ($(git rev-parse --short HEAD))"

# ─────────────────────────────────────────────────────────────────────────────
# Development stage
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY start-dev.sh /app/start-dev.sh
RUN sed -i 's/\r$//' /app/start-dev.sh && chmod +x /app/start-dev.sh

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

CMD ["/bin/sh", "/app/start-dev.sh"]

# ─────────────────────────────────────────────────────────────────────────────
# Builder stage: compile Next.js application
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS builder

ARG NEXT_PUBLIC_CLIENTVAR

COPY . .

# Remove .env files that interfere with Docker environment variables
RUN rm -f .env .env.local .env.development .env.production

# Install dependencies (production + dev for building)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CLIENTVAR=${NEXT_PUBLIC_CLIENTVAR}
ENV SKIP_ENV_VALIDATION=1
ENV SIRIUS_BUILD_STAGE=docker-build

# Inject ignoreBuildErrors flags for Docker build so TS/ESLint errors don't block
RUN cp next.config.mjs next.config.mjs.bak && \
    node -e "const fs=require('fs');const p='next.config.mjs';let c=fs.readFileSync(p,'utf8');c=c.replace('  swcMinify: true,','  swcMinify: true,\n  typescript: { ignoreBuildErrors: true },\n  eslint: { ignoreDuringBuilds: true },');fs.writeFileSync(p,c);" && \
    npx next build

# ─────────────────────────────────────────────────────────────────────────────
# Production runtime stage
# Pre-built system-monitor and administrator are pulled from the shared
# sirius-base-go-builder image, eliminating the need to install Go here.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS production

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Create system-monitor directory
RUN mkdir -p /system-monitor

# Copy pre-built binaries from shared base image (no Go compiler needed here)
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/system-monitor /system-monitor/system-monitor
COPY --from=ghcr.io/siriusscan/sirius-base-go-builder:latest /usr/local/bin/administrator /app/administrator
RUN chmod +x /system-monitor/system-monitor /app/administrator

# Copy built Next.js application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

COPY start-prod.sh /app/start-prod.sh
RUN sed -i 's/\r$//' /app/start-prod.sh && chmod +x /app/start-prod.sh

RUN chown -R nextjs:nodejs /app /system-monitor

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["/app/start-prod.sh"]
