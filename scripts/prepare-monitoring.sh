#!/bin/bash

# Script to prepare monitoring components for container builds
# This script validates that the main SystemMonitor project is available

set -e

echo "🔧 Preparing monitoring components for container builds..."

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

# Validate that the main system monitor has the required files
echo "📊 Validating main system monitor project..."

if [ ! -f "$SYSTEM_MONITOR_DIR/main.go" ]; then
    echo "❌ System monitor main.go not found"
    exit 1
fi

if [ ! -f "$SYSTEM_MONITOR_DIR/go.mod" ]; then
    echo "❌ System monitor go.mod not found"
    exit 1
fi

# Test build the system monitor to ensure it compiles
echo "🔨 Testing system monitor build..."
cd "$SYSTEM_MONITOR_DIR"
if go build -o /tmp/test-system-monitor .; then
    echo "✅ System monitor builds successfully"
    rm -f /tmp/test-system-monitor
else
    echo "❌ System monitor build failed"
    exit 1
fi

echo "✅ Main system monitor project is ready for container builds!"
echo "📝 Note: Containers will now build SystemMonitor from the main project instead of local copies"
