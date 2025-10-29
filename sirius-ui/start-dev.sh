#!/bin/sh

echo "🚀 Starting Sirius UI Development Server..."

# Start System Monitor if available
if [ -d "/system-monitor" ] && [ -f "/system-monitor/main.go" ]; then
    echo "📊 Starting System Monitor..."
    cd /system-monitor
    CONTAINER_NAME=sirius-ui go run main.go >> /tmp/system-monitor.log 2>&1 &
    SYSTEM_MONITOR_PID=$!
    echo "✅ System Monitor started with PID: $SYSTEM_MONITOR_PID"
    cd /app
else
    echo "⚠️  System Monitor not found, skipping..."
fi

# Start App Administrator if available
if [ -d "/app-administrator" ] && [ -f "/app-administrator/main.go" ]; then
    echo "🔧 Starting App Administrator..."
    cd /app-administrator
    CONTAINER_NAME=sirius-ui go run main.go >> /tmp/administrator.log 2>&1 &
    ADMINISTRATOR_PID=$!
    echo "✅ App Administrator started with PID: $ADMINISTRATOR_PID"
    cd /app
else
    echo "⚠️  App Administrator not found, skipping..."
fi

echo "🔍 Checking database connection..."

# Apply any pending migrations
echo "📁 Applying database migrations..."
(cd /app && npx prisma migrate deploy)

echo "🌱 Running database seed..."
# Temporarily disabled - causing startup delays
# (cd /app && npx prisma db seed) || echo "⚠️  Seed failed or already applied."
echo "⚠️  Seed skipped (admin/password credentials already set)"

echo "🎯 Starting Next.js development server..."
exec npm run dev 