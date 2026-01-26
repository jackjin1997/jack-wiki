#!/bin/bash

# Jack Wiki First-time Setup Script
# Usage: ./setup.sh

set -e

echo "🎯 Jack Wiki - First Time Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "jack-wiki-backend/.env" ]; then
    echo "${YELLOW}⚙️  Creating backend .env file...${NC}"
    cp jack-wiki-backend/.env.example jack-wiki-backend/.env
    echo "${RED}⚠️  IMPORTANT: Please edit jack-wiki-backend/.env and add your AI API keys!${NC}"
    echo ""
    read -p "Press Enter after you've added at least one API key..."
fi

if [ ! -f "jack-wiki-frontend/.env" ]; then
    echo "${YELLOW}⚙️  Creating frontend .env file...${NC}"
    cp jack-wiki-frontend/.env.example jack-wiki-frontend/.env
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start databases
echo "${BLUE}📦 Starting PostgreSQL and Redis...${NC}"
docker-compose up -d

echo "⏳ Waiting for databases to be ready..."
sleep 15

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

# Install backend dependencies
echo "${BLUE}📦 Installing backend dependencies...${NC}"
cd jack-wiki-backend
$PKG_MANAGER install

# Initialize database
echo "${BLUE}🗄️  Initializing database...${NC}"
$PKG_MANAGER run db:push
$PKG_MANAGER run db:seed

cd ..

# Install frontend dependencies
echo "${BLUE}📦 Installing frontend dependencies...${NC}"
cd jack-wiki-frontend
$PKG_MANAGER install

cd ..

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the development servers, run:"
echo "  ${BLUE}./dev.sh${NC}"
echo ""
echo "Or use npm scripts:"
echo "  ${BLUE}npm run dev${NC}"
echo ""
