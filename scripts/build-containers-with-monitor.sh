#!/bin/bash

# Build containers with updated SystemMonitor from main project
# This script copies the SystemMonitor source to each container directory and builds

set -e

echo "🔨 Building containers with updated SystemMonitor..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths to the monitoring components
SYSTEM_MONITOR_DIR="$PROJECT_ROOT/../minor-projects/app-system-monitor"

# Check if main system monitor directory exists
if [ ! -d "$SYSTEM_MONITOR_DIR" ]; then
    echo "❌ System monitor directory not found: $SYSTEM_MONITOR_DIR"
    exit 1
fi

# Function to copy system monitor to container directory
copy_system_monitor() {
    local container_dir="$1"
    local container_name="$2"
    
    echo "📊 Copying SystemMonitor to $container_name..."
    
    if [ -d "$container_dir" ]; then
        # Remove any existing app-system-monitor directory
        rm -rf "$container_dir/app-system-monitor"
        
        # Copy the main system monitor
        cp -r "$SYSTEM_MONITOR_DIR" "$container_dir/"
        
        echo "✅ SystemMonitor copied to $container_name"
    else
        echo "⚠️  Container directory not found: $container_dir"
    fi
}

# Copy system monitor to each container directory
copy_system_monitor "$PROJECT_ROOT/sirius-postgres" "sirius-postgres"
copy_system_monitor "$PROJECT_ROOT/sirius-rabbitmq" "sirius-rabbitmq"
copy_system_monitor "$PROJECT_ROOT/sirius-valkey" "sirius-valkey"

# Update Dockerfiles to use local copy instead of relative path
echo "🔧 Updating Dockerfiles to use local SystemMonitor copy..."

# Update PostgreSQL Dockerfile
sed -i.bak 's|COPY ../../minor-projects/app-system-monitor|COPY app-system-monitor|g' "$PROJECT_ROOT/sirius-postgres/Dockerfile"

# Update RabbitMQ Dockerfile
sed -i.bak 's|COPY ../../minor-projects/app-system-monitor|COPY app-system-monitor|g' "$PROJECT_ROOT/sirius-rabbitmq/Dockerfile"

# Update Valkey Dockerfile
sed -i.bak 's|COPY ../../minor-projects/app-system-monitor|COPY app-system-monitor|g' "$PROJECT_ROOT/sirius-valkey/Dockerfile"

# Build the containers
echo "🚀 Building containers..."
docker-compose build sirius-postgres sirius-rabbitmq sirius-valkey

# Restore original Dockerfiles
echo "🔄 Restoring original Dockerfiles..."
mv "$PROJECT_ROOT/sirius-postgres/Dockerfile.bak" "$PROJECT_ROOT/sirius-postgres/Dockerfile"
mv "$PROJECT_ROOT/sirius-rabbitmq/Dockerfile.bak" "$PROJECT_ROOT/sirius-rabbitmq/Dockerfile"
mv "$PROJECT_ROOT/sirius-valkey/Dockerfile.bak" "$PROJECT_ROOT/sirius-valkey/Dockerfile"

# Clean up copied directories
echo "🧹 Cleaning up temporary SystemMonitor copies..."
rm -rf "$PROJECT_ROOT/sirius-postgres/app-system-monitor"
rm -rf "$PROJECT_ROOT/sirius-rabbitmq/app-system-monitor"
rm -rf "$PROJECT_ROOT/sirius-valkey/app-system-monitor"

echo "✅ Container build completed successfully!"
echo "🎉 All containers now have the updated SystemMonitor with CPU drift fix!"
