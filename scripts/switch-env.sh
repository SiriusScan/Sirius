#!/bin/bash

# Sirius Environment Switching Script
# Usage: ./scripts/switch-env.sh [dev|prod|base]

set -e

ENV=${1:-"base"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Switching Sirius environment to: $ENV"

# Function to clean up containers and images
cleanup() {
    echo "🧹 Cleaning up existing containers and images..."
    docker compose down 2>/dev/null || true
    docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down 2>/dev/null || true
    docker compose -f docker-compose.yaml -f docker-compose.prod.yaml down 2>/dev/null || true
    
    # Remove old UI images to force rebuild
    docker rmi sirius-sirius-ui:latest 2>/dev/null || true
    docker rmi sirius-sirius-ui:dev 2>/dev/null || true
    docker rmi sirius-sirius-ui:prod 2>/dev/null || true
}

# Function to start development environment
start_dev() {
    echo "🚀 Starting development environment..."
    docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build --no-cache sirius-ui
    docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
    echo "✅ Development environment started!"
    echo "🌐 UI: http://localhost:3000 (with hot reloading)"
    echo "🔧 API: http://localhost:9001"
}

# Function to start production environment
start_prod() {
    echo "🚀 Starting production environment..."
    docker compose -f docker-compose.yaml -f docker-compose.prod.yaml build --no-cache sirius-ui
    docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
    echo "✅ Production environment started!"
    echo "🌐 UI: http://localhost:3000 (optimized build)"
    echo "🔧 API: http://localhost:9001"
}

# Function to start base environment
start_base() {
    echo "🚀 Starting base environment..."
    docker compose build --no-cache sirius-ui
    docker compose up -d
    echo "✅ Base environment started!"
    echo "🌐 UI: http://localhost:3000"
    echo "🔧 API: http://localhost:9001"
}

# Main logic
cd "$PROJECT_ROOT"

case $ENV in
    "dev"|"development")
        cleanup
        start_dev
        ;;
    "prod"|"production")
        cleanup
        start_prod
        ;;
    "base"|"default")
        cleanup
        start_base
        ;;
    *)
        echo "❌ Invalid environment: $ENV"
        echo "Usage: $0 [dev|prod|base]"
        echo ""
        echo "Environments:"
        echo "  dev     - Development with hot reloading and volume mounts"
        echo "  prod    - Production with optimized builds"
        echo "  base    - Base configuration (default)"
        exit 1
        ;;
esac

echo ""
echo "📊 Container status:"
docker compose ps
