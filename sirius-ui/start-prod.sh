#!/bin/sh

echo "🚀 Starting Sirius UI Production Server..."

# Ensure Prisma directory exists and is writable
mkdir -p /app/prisma
chown -R nextjs:nodejs /app/prisma

# Check if SQLite database exists, if not create it
if [ ! -f "/app/prisma/dev.db" ]; then
    echo "📁 SQLite database not found, creating new database..."
    
    # Deploy migrations to create tables
    echo "📁 Applying database migrations..."
    npx prisma migrate deploy || npx prisma db push --accept-data-loss
    
    echo "🌱 Running database seed..."
    npx prisma db seed || echo "⚠️  Seed failed or already applied."
else
    echo "✅ SQLite database found, checking migrations..."
    # Apply any pending migrations
    npx prisma migrate deploy || echo "⚠️  Migration failed, database may already be up to date."
fi

echo "🎯 Starting Next.js production server..."
exec npm start 