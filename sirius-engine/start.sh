#!/bin/bash

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

# Trap SIGTERM and SIGINT
trap cleanup SIGTERM SIGINT

echo "Starting Sirius services..."

# Start scanner service
cd /app-scanner
echo "Starting scanner service..."
go run main.go &
SCANNER_PID=$!

# Give scanner a moment to initialize
sleep 2
check_service "Scanner" $SCANNER_PID

# Start terminal service
cd /app-terminal
echo "Starting terminal service..."
go run cmd/main.go &
TERMINAL_PID=$!

# Give terminal a moment to initialize
sleep 2
check_service "Terminal" $TERMINAL_PID

echo "All services started. Monitoring..."

# Monitor services
while true; do
    check_service "Scanner" $SCANNER_PID
    check_service "Terminal" $TERMINAL_PID
    sleep 5
done