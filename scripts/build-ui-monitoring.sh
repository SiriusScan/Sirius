#!/bin/bash

# Build script for UI container monitoring components
# This script builds the system monitor and app administrator for the UI container

set -e

echo "🔧 Building monitoring components for UI container..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths to the monitoring components
SYSTEM_MONITOR_DIR="$PROJECT_ROOT/../minor-projects/app-system-monitor"
ADMINISTRATOR_DIR="$PROJECT_ROOT/../minor-projects/app-administrator"

# Check if directories exist
if [ ! -d "$SYSTEM_MONITOR_DIR" ]; then
    echo "❌ System monitor directory not found: $SYSTEM_MONITOR_DIR"
    exit 1
fi

if [ ! -d "$ADMINISTRATOR_DIR" ]; then
    echo "❌ Administrator directory not found: $ADMINISTRATOR_DIR"
    exit 1
fi

# Build system monitor
echo "📊 Building system monitor..."
cd "$SYSTEM_MONITOR_DIR"
go mod download
CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o system-monitor main.go
echo "✅ System monitor built successfully"

# Build app administrator
echo "🔧 Building app administrator..."
cd "$ADMINISTRATOR_DIR"
go mod download
CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o administrator main.go
echo "✅ App administrator built successfully"

echo "🎉 All monitoring components built successfully!"
echo "📁 System monitor: $SYSTEM_MONITOR_DIR/system-monitor"
echo "📁 App administrator: $ADMINISTRATOR_DIR/administrator"
