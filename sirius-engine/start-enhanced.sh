#!/bin/bash

# Enhanced startup script for sirius-engine
# Handles both development (with volume mounts) and production (using built-in repos)

# Function to cleanup child processes
cleanup() {
    echo "Shutting down services..."
    pkill -P $$
    exit 0
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local pid=$2
    if ! kill -0 $pid 2>/dev/null; then
        echo "$service_name failed to start or crashed"
        cleanup
    fi
}

# Function to determine the correct path for a service
get_service_path() {
    local service_name=$1
    local mount_path="/app-$service_name"
    local built_path="/$service_name"
    
    # Check if volume mount exists and has Go files (development mode)
    if [ -d "$mount_path" ] && [ -f "$mount_path/go.mod" ]; then
        echo "$mount_path"
    # Otherwise use built-in repository (production mode)
    elif [ -d "$built_path" ] && [ -f "$built_path/go.mod" ]; then
        echo "$built_path"
    else
        echo ""
    fi
}

# Trap SIGTERM and SIGINT
trap cleanup SIGTERM SIGINT

echo "Starting Sirius Engine services..."
echo "Environment: ${GO_ENV:-production}"

# Determine service paths
SCANNER_PATH=$(get_service_path "scanner")
TERMINAL_PATH=$(get_service_path "terminal")
AGENT_PATH="/app-agent"

# Check if we have a mounted app-agent directory (development mode)
if [ ! -d "$AGENT_PATH" ] || [ ! -f "$AGENT_PATH/go.mod" ]; then
    AGENT_PATH="/app-agent"
    echo "Using built-in app-agent repository"
else
    echo "Using mounted app-agent directory"
fi

echo "Service paths determined:"
echo "  Scanner: $SCANNER_PATH"
echo "  Terminal: $TERMINAL_PATH"
echo "  Agent: $AGENT_PATH"

# Start scanner service if path is available
if [ -n "$SCANNER_PATH" ]; then
    cd "$SCANNER_PATH"
    echo "Starting scanner service from $SCANNER_PATH..."
    if [ "$GO_ENV" = "development" ]; then
        air &
    else
        go run main.go &
    fi
    SCANNER_PID=$!
    sleep 2
    check_service "Scanner" $SCANNER_PID
else
    echo "Warning: Scanner service path not found"
fi

# Start terminal service if path is available  
if [ -n "$TERMINAL_PATH" ]; then
    cd "$TERMINAL_PATH"
    echo "Starting terminal service from $TERMINAL_PATH..."
    if [ "$GO_ENV" = "development" ]; then
        air &
    else
        go run cmd/main.go &
    fi
    TERMINAL_PID=$!
    sleep 2
    check_service "Terminal" $TERMINAL_PID
else
    echo "Warning: Terminal service path not found"
fi

# Start agent service if path is available
if [ -d "$AGENT_PATH" ] && [ -f "$AGENT_PATH/go.mod" ]; then
    cd "$AGENT_PATH"
    echo "Starting agent service from $AGENT_PATH..."
    if [ "$GO_ENV" = "development" ]; then
        air &
    else
        go run cmd/agent/main.go &
    fi
    AGENT_PID=$!
    sleep 2
    check_service "Agent" $AGENT_PID
else
    echo "Warning: Agent service path not found or invalid"
fi

echo "Services started successfully. Monitoring..."

# Monitor services
while true; do
    if [ -n "$SCANNER_PID" ]; then
        check_service "Scanner" $SCANNER_PID
    fi
    if [ -n "$TERMINAL_PID" ]; then
        check_service "Terminal" $TERMINAL_PID
    fi
    if [ -n "$AGENT_PID" ]; then
        check_service "Agent" $AGENT_PID
    fi
    sleep 5
done 