#!/bin/sh

echo "🚀 Starting Sirius UI Development Server..."
echo "🔍 Checking database connection..."

# Apply any pending migrations
echo "📁 Applying database migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed..."
npx prisma db seed || echo "⚠️  Seed failed or already applied."

echo "🎯 Starting Next.js development server..."
exec npm run dev 