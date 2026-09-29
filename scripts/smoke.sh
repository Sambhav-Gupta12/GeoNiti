#!/bin/bash
set -e
echo "Starting final smoke test..."

echo "1. Checking Frontend Build..."
cd "$(dirname "$0")/../frontend"
npm run build || { echo "Frontend build failed"; exit 1; }

echo "2. Checking Core API Build..."
cd ../core-api
npm run build || { echo "Core API build failed"; exit 1; }

echo "3. Smoke test successful. Tagging release..."
cd ..
git tag -a v1.0-demo -m "Demo Version 1.0" || echo "Tag v1.0-demo already exists."
echo "Done."
