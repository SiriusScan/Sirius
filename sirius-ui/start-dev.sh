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

echo "🔍 Checking database connection..."

# Apply any pending migrations
echo "📁 Applying database migrations..."
(cd /app && npx prisma migrate deploy)

echo "🌱 Running database seed..."
(cd /app && npx prisma db seed) || echo "⚠️  Seed failed or already applied."

echo "🎯 Starting Next.js development server..."
exec npm run dev 