#!/bin/sh
set -e

echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"
echo "Listing /app contents:"
ls /app

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma

echo "Starting server..."
exec node dist/main.js