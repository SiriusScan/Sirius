#!/bin/sh

echo "🚀 Starting Sirius UI Development Server..."

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

# Keep container node_modules in sync with package manifests.
# Dev uses a persistent named volume for /app/node_modules, which can drift when deps change.
if [ -f "/app/package.json" ] && [ -f "/app/package-lock.json" ]; then
    CURRENT_DEPS_HASH=$(cat /app/package.json /app/package-lock.json | sha256sum | awk '{print $1}')
    STORED_DEPS_HASH=""
    if [ -f "/app/node_modules/.deps-hash" ]; then
        STORED_DEPS_HASH=$(cat /app/node_modules/.deps-hash)
    fi

    if [ "$CURRENT_DEPS_HASH" != "$STORED_DEPS_HASH" ]; then
        echo "📦 Dependency manifest changed; running npm install..."
        npm install || exit 1
        mkdir -p /app/node_modules
        echo "$CURRENT_DEPS_HASH" > /app/node_modules/.deps-hash
    else
        echo "✅ Dependencies are up to date"
    fi
fi

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
(cd /app && npx prisma db seed) || echo "⚠️  Seed failed or already applied."

echo "🎯 Starting Next.js development server..."
exec npm run dev 