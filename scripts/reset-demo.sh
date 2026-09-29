#!/bin/bash
echo "Resetting demo database..."
cd "$(dirname "$0")/../core-api"

# Make sure we have the required env vars or warn
if [ -z "$DATABASE_URL" ] && [ ! -f "../.env" ]; then
    echo "Warning: No .env found and DATABASE_URL is not set. Reset might fail."
fi

npm run migrate
npm run seed
echo "Demo database reset complete."
