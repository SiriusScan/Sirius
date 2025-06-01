#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
until bunx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
bunx prisma generate

# Push schema to database
echo "Pushing schema to database..."
bunx prisma db push --accept-data-loss

# Seed the database with initial data
echo "Seeding database..."
bunx prisma db seed || echo "Seeding failed or no seed script found"

echo "Starting development server..."
# Start the development server
exec bun run dev 