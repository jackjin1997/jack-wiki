#!/bin/bash

# Jack Wiki Development Startup Script
# Usage: ./dev.sh

set -e

echo "🚀 Starting Jack Wiki Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start databases if not running
echo "${BLUE}📦 Checking databases...${NC}"
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "${YELLOW}Starting PostgreSQL and Redis...${NC}"
    docker-compose up -d
    echo "⏳ Waiting for databases to be ready..."
    sleep 10
else
    echo "${GREEN}✓ Databases already running${NC}"
fi

# Detect package manager
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    echo "${GREEN}✓ Using Bun${NC}"
elif command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo "${YELLOW}⚠ Bun not found, using pnpm${NC}"
else
    echo "${RED}❌ Neither Bun nor pnpm found. Please install one of them.${NC}"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "jack-wiki-backend/node_modules" ]; then
    echo "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd jack-wiki-backend
    $PKG_MANAGER install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "jack-wiki-frontend/node_modules" ]; then
    echo "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd jack-wiki-frontend
    $PKG_MANAGER install
    cd ..
fi

# Check if database is initialized
if ! docker exec jack-wiki-postgres psql -U postgres -d jack_wiki -c "SELECT 1 FROM personas LIMIT 1" > /dev/null 2>&1; then
    echo "${YELLOW}🗄️  Initializing database...${NC}"
    cd jack-wiki-backend
    bun run db:push
    bun run db:seed
    cd ..
    echo "${GREEN}✓ Database initialized${NC}"
else
    echo "${GREEN}✓ Database already initialized${NC}"
fi

echo ""
echo "${GREEN}🎉 Starting development servers...${NC}"
echo ""
echo "Backend will run on: ${BLUE}http://localhost:8000${NC}"
echo "Frontend will run on: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "${YELLOW}Shutting down...${NC}"
    kill 0
}

trap cleanup EXIT

# Start backend in background
cd jack-wiki-backend
$PKG_MANAGER run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../jack-wiki-frontend
$PKG_MANAGER run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
