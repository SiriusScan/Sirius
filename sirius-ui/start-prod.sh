#!/bin/sh

echo "🚀 Starting Sirius UI Production Server..."

require_env() {
    VAR_NAME="$1"
    eval "VAR_VALUE=\${$VAR_NAME}"
    if [ -z "$VAR_VALUE" ]; then
        echo "❌ Missing required environment variable: $VAR_NAME"
        exit 1
    fi
}

require_readable_file() {
    VAR_NAME="$1"
    eval "FILE_PATH=\${$VAR_NAME}"
    if [ -z "$FILE_PATH" ]; then
        echo "❌ Missing required environment variable: $VAR_NAME"
        exit 1
    fi
    if [ ! -r "$FILE_PATH" ]; then
        echo "❌ Required secret file is not readable: $FILE_PATH"
        exit 1
    fi
}

require_env "NEXTAUTH_SECRET"
require_env "INITIAL_ADMIN_PASSWORD"
require_readable_file "SIRIUS_API_KEY_FILE"

SIRIUS_API_KEY="$(tr -d '\r\n' < "$SIRIUS_API_KEY_FILE")"
if [ -z "$SIRIUS_API_KEY" ]; then
    echo "❌ Internal API key file is empty: $SIRIUS_API_KEY_FILE"
    exit 1
fi
export SIRIUS_API_KEY

# Start system monitor if available
if [ -f "/system-monitor/system-monitor" ] && [ -x "/system-monitor/system-monitor" ]; then
    echo "📊 Starting system monitor..."
    cd /system-monitor
    CONTAINER_NAME=sirius-ui ./system-monitor >> /tmp/system-monitor.log 2>&1 &
    SYSTEM_MONITOR_PID=$!
    echo "✅ System monitor started with PID: $SYSTEM_MONITOR_PID"
    cd /app
else
    echo "⚠️  System monitor binary not found or not executable"
fi

# Start app administrator if available
if [ -f "/app/administrator" ] && [ -x "/app/administrator" ]; then
    echo "🔧 Starting app administrator..."
    CONTAINER_NAME=sirius-ui /app/administrator &
    ADMINISTRATOR_PID=$!
    echo "✅ App administrator started with PID: $ADMINISTRATOR_PID"
else
    echo "⚠️  App administrator binary not found or not executable"
fi

# Ensure Prisma directory exists and is writable
mkdir -p /app/prisma
chown -R nextjs:nodejs /app/prisma

# Check if SQLite database exists, if not create it
if [ ! -f "/app/prisma/dev.db" ]; then
    echo "📁 SQLite database not found, creating new database..."
    
    # Deploy migrations to create tables
    echo "📁 Applying database migrations..."
    (cd /app && npx prisma migrate deploy) || (cd /app && npx prisma db push --accept-data-loss)
    
    echo "🌱 Running database seed..."
    (cd /app && npx prisma db seed) || echo "⚠️  Seed failed or already applied."
else
    echo "✅ SQLite database found, checking migrations..."
    # Apply any pending migrations
    (cd /app && npx prisma migrate deploy) || echo "⚠️  Migration failed, database may already be up to date."
fi

echo "🎯 Starting Next.js production server..."
exec npm start 