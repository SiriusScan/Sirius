#!/bin/bash

# Function to cleanup child processes
cleanup() {
    echo "Shutting down services..."
    pkill -P $$
    exit 0
}

# Trap SIGTERM and SIGINT
trap cleanup SIGTERM SIGINT

# Start services
cd /app-scanner
echo "Starting scanner service..."
go run main.go &

cd /app-terminal
echo "Starting terminal service..."
go run cmd/main.go &

# Wait for all background processes
wait
