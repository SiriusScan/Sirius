#!/bin/bash

# Enhanced startup script for sirius-engine v2.0 - Updated 2025-06-08T03:30:00Z
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

# Function to check if binary exists in directory
has_binary() {
    local service_path=$1
    local binary_name=$2
    [ -f "$service_path/$binary_name" ] && [ -x "$service_path/$binary_name" ]
}

# Function to determine the correct path for a service
get_service_path() {
    local service_name=$1
    local mount_path="/app-$service_name"
    local src_path="/app-$service_name-src"
    local built_path="/$service_name"
    
    # Check if volume mount exists and has Go files (development mode with volume mount)
    if [ -d "$mount_path" ] && [ -f "$mount_path/go.mod" ]; then
        echo "$mount_path"
    # Check if source directory exists (development mode without volume mount)
    elif [ -d "$src_path" ] && [ -f "$src_path/go.mod" ]; then
        echo "$src_path"
    # Check if production binary exists
    elif [ -d "$mount_path" ] && has_binary "$mount_path" "$service_name"; then
        echo "$mount_path"
    # Otherwise use built-in repository (development fallback)
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
AGENT_PATH=$(get_service_path "agent")

echo "Service paths determined:"
echo "  Scanner: $SCANNER_PATH"
echo "  Terminal: $TERMINAL_PATH"
echo "  Agent: $AGENT_PATH"

# Start scanner service if path is available
if [ -n "$SCANNER_PATH" ]; then
    cd "$SCANNER_PATH"
    echo "Starting scanner service from $SCANNER_PATH..."
    if [ "$GO_ENV" = "development" ]; then
        echo "Running scanner with go run (development mode)"
        go run main.go &
    elif has_binary "$SCANNER_PATH" "scanner"; then
        echo "Running production scanner binary"
        ./scanner &
    else
        echo "Running scanner with go run (fallback)"
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
        echo "Running terminal with go run (development mode)"
        go run cmd/main.go &
    elif has_binary "$TERMINAL_PATH" "terminal"; then
        echo "Running production terminal binary"
        ./terminal &
    else
        echo "Running terminal with go run (fallback)"
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
    echo "Starting agent server from $AGENT_PATH..."
    if [ "$GO_ENV" = "development" ]; then
        echo "Starting agent server (development mode)..."
        go run cmd/server/main.go &
        AGENT_SERVER_PID=$!
    else
        # Production mode - start server binary
        if has_binary "$AGENT_PATH" "server"; then
            echo "Running production agent server binary"
            ./server &
            AGENT_SERVER_PID=$!
        else
            echo "Running agent server with go run (fallback)"
            go run cmd/server/main.go &
            AGENT_SERVER_PID=$!
        fi
    fi
    sleep 2
    check_service "Agent Server" $AGENT_SERVER_PID
elif [ -d "$AGENT_PATH" ] && has_binary "$AGENT_PATH" "server"; then
    cd "$AGENT_PATH"
    echo "Starting agent server from $AGENT_PATH (binary only)..."
    echo "Running production agent server binary"
    ./server &
    AGENT_SERVER_PID=$!
    sleep 2
    check_service "Agent Server" $AGENT_SERVER_PID
else
    echo "Warning: Agent server path not found or invalid"
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
    if [ -n "$AGENT_SERVER_PID" ]; then
        check_service "Agent Server" $AGENT_SERVER_PID
    fi
    sleep 5
done 