#!/bin/bash

# Sirius Development Setup Helper
# This script helps set up local development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOCAL_COMPOSE="$PROJECT_ROOT/docker-compose.local.yaml"
EXAMPLE_COMPOSE="$PROJECT_ROOT/docker-compose.local.example.yaml"

echo "🚀 Sirius Development Setup"
echo "================================"

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  init              Create local docker-compose.local.yaml from template"
    echo "  start             Start development environment"
    echo "  start-extended    Start with local repository mounts (requires setup)"
    echo "  stop              Stop development environment" 
    echo "  clean             Clean development environment and volumes"
    echo "  status            Show container status"
    echo "  logs [service]    Show logs for all services or specific service"
    echo "  shell <service>   Open shell in service container"
    echo ""
    echo "Examples:"
    echo "  $0 init                    # Set up local development files"
    echo "  $0 start                   # Standard development mode"
    echo "  $0 start-extended          # Extended development with local repos"
    echo "  $0 logs sirius-engine      # Show engine logs"
    echo "  $0 shell sirius-ui         # Open shell in UI container"
}

# Function to check if local compose file exists
check_local_compose() {
    if [ ! -f "$LOCAL_COMPOSE" ]; then
        echo "⚠️  Local compose file not found: $LOCAL_COMPOSE"
        echo "💡 Run '$0 init' to create it from template"
        return 1
    fi
    return 0
}

# Function to initialize local development setup
init_dev() {
    echo "📋 Setting up local development environment..."
    
    if [ -f "$LOCAL_COMPOSE" ]; then
        echo "⚠️  $LOCAL_COMPOSE already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "ℹ️  Keeping existing file"
            return 0
        fi
    fi
    
    if [ ! -f "$EXAMPLE_COMPOSE" ]; then
        echo "❌ Template file not found: $EXAMPLE_COMPOSE"
        return 1
    fi
    
    cp "$EXAMPLE_COMPOSE" "$LOCAL_COMPOSE"
    echo "✅ Created $LOCAL_COMPOSE"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit $LOCAL_COMPOSE to uncomment the repositories you want to develop"
    echo "2. Make sure you have the corresponding repositories in ../minor-projects/"
    echo "3. Run '$0 start-extended' to start with local repository mounts"
    echo ""
    echo "🔧 For standard development (no local repos needed): '$0 start'"
}

# Function to start development environment
start_dev() {
    local mode=$1
    
    cd "$PROJECT_ROOT"
    
    if [ "$mode" = "extended" ]; then
        echo "🔧 Starting extended development environment..."
        if ! check_local_compose; then
            return 1
        fi
        echo "📁 Using local repository mounts from docker-compose.local.yaml"
        docker-compose -f docker-compose.yaml -f docker-compose.override.yaml -f docker-compose.local.yaml up -d
    else
        echo "🔧 Starting standard development environment..."
        docker-compose up -d
    fi
    
    echo ""
    echo "✅ Development environment started!"
    echo "🌐 UI: http://localhost:3000"
    echo "🔧 API: http://localhost:9001"
    echo "📊 RabbitMQ Management: http://localhost:15672 (guest/guest)"
    
    if command -v docker-compose &> /dev/null; then
        echo ""
        echo "📋 Container Status:"
        docker-compose ps
    fi
}

# Function to stop development environment
stop_dev() {
    echo "🛑 Stopping development environment..."
    cd "$PROJECT_ROOT"
    docker-compose down
    echo "✅ Development environment stopped"
}

# Function to clean development environment
clean_dev() {
    echo "🧹 Cleaning development environment..."
    cd "$PROJECT_ROOT"
    
    read -p "This will remove all containers and volumes. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "ℹ️  Cleanup cancelled"
        return 0
    fi
    
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo "✅ Development environment cleaned"
}

# Function to show container status
show_status() {
    echo "📋 Container Status:"
    cd "$PROJECT_ROOT"
    docker-compose ps
}

# Function to show logs
show_logs() {
    local service=$1
    cd "$PROJECT_ROOT"
    
    if [ -n "$service" ]; then
        echo "📜 Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        echo "📜 Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to open shell in container
open_shell() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo "❌ Service name required"
        echo "Available services: sirius-ui, sirius-api, sirius-engine, sirius-postgres, sirius-rabbitmq, sirius-valkey"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
    echo "🐚 Opening shell in $service..."
    docker-compose exec "$service" /bin/bash || docker-compose exec "$service" /bin/sh
}

# Main command handling
case "$1" in
    "init")
        init_dev
        ;;
    "start")
        start_dev
        ;;
    "start-extended")
        start_dev extended
        ;;
    "stop")
        stop_dev
        ;;
    "clean")
        clean_dev
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "shell")
        open_shell "$2"
        ;;
    *)
        show_usage
        ;;
esac 