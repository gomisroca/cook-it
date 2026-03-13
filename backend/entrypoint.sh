#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma --url "$DATABASE_URL"

echo "Starting server..."
exec node dist/main.js