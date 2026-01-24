.PHONY: help setup dev dev-backend dev-frontend install db-init db-reset clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## First-time setup (install deps, start DB, init schema)
	@echo "🎯 Running first-time setup..."
	@if [ ! -f jack-wiki-backend/.env ]; then \
		cp jack-wiki-backend/.env.example jack-wiki-backend/.env; \
		echo "⚠️  Please edit jack-wiki-backend/.env and add your API keys!"; \
		read -p "Press Enter after adding keys..."; \
	fi
	@if [ ! -f jack-wiki-frontend/.env ]; then \
		cp jack-wiki-frontend/.env.example jack-wiki-frontend/.env; \
	fi
	@docker-compose up -d
	@echo "⏳ Waiting for databases..."
	@sleep 15
	@cd jack-wiki-backend && bun install
	@cd jack-wiki-frontend && bun install
	@cd jack-wiki-backend && bun run db:push && bun run db:seed
	@echo "✅ Setup complete! Run 'make dev' to start."

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@cd jack-wiki-backend && bun install
	@cd jack-wiki-frontend && bun install

dev: ## Start both frontend and backend
	@echo "🚀 Starting development servers..."
	@docker-compose up -d 2>/dev/null || true
	@sleep 2
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Start backend only
	@cd jack-wiki-backend && bun run dev

dev-frontend: ## Start frontend only
	@cd jack-wiki-frontend && bun run dev

db-init: ## Initialize database schema and seed data
	@echo "🗄️  Initializing database..."
	@cd jack-wiki-backend && bun run db:push && bun run db:seed

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  Resetting database..."
	@docker-compose down -v
	@docker-compose up -d
	@sleep 15
	@cd jack-wiki-backend && bun run db:push && bun run db:seed
	@echo "✅ Database reset complete"

clean: ## Stop all containers
	@echo "🧹 Cleaning up..."
	@docker-compose down

start-db: ## Start database containers only
	@docker-compose up -d
	@echo "⏳ Waiting for databases..."
	@sleep 10
