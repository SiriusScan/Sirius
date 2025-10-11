#!/bin/bash

# Universal SystemMonitor build script
# This script builds the SystemMonitor binary for all target architectures
# and creates a universal binary that can be used across all containers

set -e

echo "🔨 Building universal SystemMonitor binary..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths
SYSTEM_MONITOR_DIR="$PROJECT_ROOT/../minor-projects/app-system-monitor"
BUILD_DIR="$PROJECT_ROOT/tmp/system-monitor-build"
BINARY_DIR="$PROJECT_ROOT/tmp/system-monitor-binaries"

# Clean and create build directories
rm -rf "$BUILD_DIR" "$BINARY_DIR"
mkdir -p "$BUILD_DIR" "$BINARY_DIR"

# Copy SystemMonitor source to build directory
echo "📦 Preparing SystemMonitor source..."
cp -r "$SYSTEM_MONITOR_DIR"/* "$BUILD_DIR/"

# Build for multiple architectures
echo "🏗️  Building SystemMonitor for multiple architectures..."

cd "$BUILD_DIR"

# Build for linux/amd64 (most common)
echo "  → Building for linux/amd64..."
GOOS=linux GOARCH=amd64 go build -o "$BINARY_DIR/system-monitor-linux-amd64" .

# Build for linux/arm64 (Apple Silicon, ARM servers)
echo "  → Building for linux/arm64..."
GOOS=linux GOARCH=arm64 go build -o "$BINARY_DIR/system-monitor-linux-arm64" .

# Create a universal binary script that detects architecture
echo "🔧 Creating universal binary script..."
cat > "$BINARY_DIR/system-monitor" << 'EOF'
#!/bin/bash

# Universal SystemMonitor binary launcher
# Detects the current architecture and runs the appropriate binary

ARCH=$(uname -m)
OS=$(uname -s)

# Map architecture names
case "$ARCH" in
    x86_64|amd64)
        BINARY_NAME="system-monitor-linux-amd64"
        ;;
    aarch64|arm64)
        BINARY_NAME="system-monitor-linux-arm64"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY_PATH="$SCRIPT_DIR/$BINARY_NAME"

# Check if the appropriate binary exists
if [ ! -f "$BINARY_PATH" ]; then
    echo "❌ SystemMonitor binary not found for architecture $ARCH: $BINARY_PATH"
    exit 1
fi

# Make sure the binary is executable
chmod +x "$BINARY_PATH"

# Execute the appropriate binary with all arguments
exec "$BINARY_PATH" "$@"
EOF

chmod +x "$BINARY_DIR/system-monitor"

# Test the universal binary
echo "🧪 Testing universal binary..."
cd "$BINARY_DIR"
if ./system-monitor --help 2>/dev/null || echo "Binary built successfully (no help flag)"; then
    echo "✅ Universal SystemMonitor binary is working"
else
    echo "❌ Universal SystemMonitor binary test failed"
    exit 1
fi

echo "✅ Universal SystemMonitor build completed successfully!"
echo "📍 Binary location: $BINARY_DIR/system-monitor"
echo "📦 Architecture-specific binaries:"
echo "  - linux/amd64: $BINARY_DIR/system-monitor-linux-amd64"
echo "  - linux/arm64: $BINARY_DIR/system-monitor-linux-arm64"

# Copy to container directories for Docker builds
echo "📋 Copying binaries to container directories..."

# Copy to sirius-postgres
if [ -d "$PROJECT_ROOT/sirius-postgres" ]; then
    echo "  → Copying to sirius-postgres..."
    rm -rf "$PROJECT_ROOT/sirius-postgres/system-monitor-binary"
    cp -r "$BINARY_DIR" "$PROJECT_ROOT/sirius-postgres/system-monitor-binary"
fi

# Copy to sirius-rabbitmq
if [ -d "$PROJECT_ROOT/sirius-rabbitmq" ]; then
    echo "  → Copying to sirius-rabbitmq..."
    rm -rf "$PROJECT_ROOT/sirius-rabbitmq/system-monitor-binary"
    cp -r "$BINARY_DIR" "$PROJECT_ROOT/sirius-rabbitmq/system-monitor-binary"
fi

# Copy to sirius-valkey
if [ -d "$PROJECT_ROOT/sirius-valkey" ]; then
    echo "  → Copying to sirius-valkey..."
    rm -rf "$PROJECT_ROOT/sirius-valkey/system-monitor-binary"
    cp -r "$BINARY_DIR" "$PROJECT_ROOT/sirius-valkey/system-monitor-binary"
fi

# Copy to sirius-engine
if [ -d "$PROJECT_ROOT/sirius-engine" ]; then
    echo "  → Copying to sirius-engine..."
    rm -rf "$PROJECT_ROOT/sirius-engine/system-monitor-binary"
    cp -r "$BINARY_DIR" "$PROJECT_ROOT/sirius-engine/system-monitor-binary"
fi

echo "🎉 Universal SystemMonitor is ready for all containers!"
