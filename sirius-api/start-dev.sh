#!/bin/sh

echo "🚀 Starting Sirius API Development Server..."

# Start system monitor if available
if [ -d "/system-monitor" ] && [ -f "/system-monitor/main.go" ]; then
    echo "📊 Starting System Monitor..."
    cd /system-monitor
    CONTAINER_NAME=sirius-api go run main.go >> /tmp/system-monitor.log 2>&1 &
    SYSTEM_MONITOR_PID=$!
    echo "✅ System Monitor started with PID: $SYSTEM_MONITOR_PID"
else
    echo "⚠️  System Monitor not found at /system-monitor, skipping..."
fi

# Start app administrator if available
if [ -d "/app-administrator" ] && [ -f "/app-administrator/main.go" ]; then
    echo "🔧 Starting App Administrator..."
    cd /app-administrator
    CONTAINER_NAME=sirius-api go run main.go >> /tmp/administrator.log 2>&1 &
    ADMINISTRATOR_PID=$!
    echo "✅ App Administrator started with PID: $ADMINISTRATOR_PID"
else
    echo "⚠️  App Administrator not found at /app-administrator, skipping..."
fi

# Start the main API
echo "🎯 Starting Sirius API..."
cd /api || { echo "❌ Failed to change to /api directory"; exit 1; }
if [ ! -f "go.mod" ]; then
    echo "❌ go.mod not found in /api, waiting for volume mount..."
    sleep 2
    if [ ! -f "go.mod" ]; then
        echo "❌ go.mod still not found after wait, aborting"
        exit 1
    fi
fi
if [ ! -f "main.go" ]; then
    echo "❌ main.go not found in /api, waiting for volume mount..."
    sleep 2
    if [ ! -f "main.go" ]; then
        echo "❌ main.go still not found after wait, aborting"
        exit 1
    fi
fi
go mod tidy
exec go run main.go

