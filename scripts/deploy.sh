#!/bin/bash
set -e

echo "🚀 Deploying Mission Control..."

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed"
  exit 1
fi

# Load environment
if [ -f .env.production ]; then
  export $(cat .env.production | xargs)
fi

# Build images
echo "📦 Building Docker images..."
docker-compose build

# Start services
echo "🎯 Starting services..."
docker-compose up -d

# Wait for health
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check status
echo "✅ Services started:"
docker-compose ps

echo "🌐 Frontend: http://localhost:5173"
echo "📡 Backend: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
