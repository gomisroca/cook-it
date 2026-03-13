#!/bin/sh
set -e

echo "Listing /app/dist contents:"
ls /app/dist

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/src/main.js