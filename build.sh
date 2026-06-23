#!/bin/bash
set -e

echo "Installing frontend dependencies..."
cd frontend
npm ci

echo "Building frontend..."
npm run build

echo "Copying build to backend..."
rm -rf ../frontend-build
cp -r dist ../frontend-build

echo "Installing backend dependencies..."
cd ../backend
npm ci

echo "Build complete!"
