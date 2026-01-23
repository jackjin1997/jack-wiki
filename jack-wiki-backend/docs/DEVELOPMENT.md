# Jack Wiki - Development Guide

## Getting Started

### Prerequisites

1. **Bun** (推荐):
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Node.js 20+** and **pnpm** (替代方案):
```bash
npm install -g pnpm
```

3. **Docker** and **Docker Compose**:
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

4. **PostgreSQL Client** (optional, for database management):
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client
```

### Clone and Setup

```bash
# Clone the repository
cd /path/to/jack-wiki

# Setup backend
cd jack-wiki-backend
bun install  # or pnpm install
cp .env.example .env
# Edit .env with your API keys

# Setup frontend
cd ../jack-wiki-frontend
bun install  # or pnpm install
cp .env.example .env
```

### Start Infrastructure

```bash
# From project root
docker-compose up -d

# Check services are healthy
docker-compose ps
```

### Initialize Database

```bash
cd jack-wiki-backend

# Push schema to database
bun run db:push

# Seed with AI personas
bun run db:seed
```

### Start Development Servers

```bash
# Terminal 1: Backend
cd jack-wiki-backend
bun run dev
# Server runs on http://localhost:8000

# Terminal 2: Frontend
cd jack-wiki-frontend
bun run dev
# App runs on http://localhost:3000
```

---

## Project Structure

### Backend

```
jack-wiki-backend/
├── src/
│   ├── core/               # Business logic (framework-independent)
│   │   ├── entities/       # Domain entities
│   │   ├── repositories/   # Repository interfaces
│   │   └── use-cases/      # Business use cases
│   ├── infrastructure/     # Technical implementations
│   │   ├── database/       # Drizzle ORM + schema
│   │   ├── repositories/   # Repository implementations
│   │   └── ai/             # LangChain integration
│   ├── presentation/       # API layer
│   │   └── trpc/           # tRPC routers
│   └── shared/             # Shared utilities
│       ├── schemas/        # Zod validation
│       ├── errors/         # Error classes
│       └── utils/          # Helper functions
├── docs/                   # Documentation
├── tests/                  # Test files
└── package.json
```

### Frontend

```
jack-wiki-frontend/
├── app/                    # Next.js App Router
│   ├── chat/               # Chat page
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # tRPC + React Query setup
├── components/
│   ├── chat/               # Chat-related components
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── message-input.tsx
│   │   ├── model-selector.tsx
│   │   └── persona-selector.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── trpc.ts             # tRPC client setup
│   └── utils.ts            # Utility functions
└── package.json
```

---

## Development Workflow

### 1. Create a New Feature

#### Backend

**Example: Add a new Use Case**

```typescript
// 1. Define entity (if needed)
// src/core/entities/feature.entity.ts
export interface FeatureEntity {
  id: string
  name: string
}

// 2. Define repository interface
// src/core/repositories/feature.repository.ts
export interface FeatureRepository {
  findById(id: string): Promise<FeatureEntity | null>
}

// 3. Create use case
// src/core/use-cases/feature/get-feature.use-case.ts
export class GetFeatureUseCase {
  constructor(private featureRepo: FeatureRepository) {}
  
  async execute(id: string): Promise<FeatureEntity> {
    const feature = await this.featureRepo.findById(id)
    if (!feature) throw new NotFoundError('Feature not found')
    return feature
  }
}

// 4. Implement repository
// src/infrastructure/repositories/drizzle-feature.repository.ts
export class DrizzleFeatureRepository implements FeatureRepository {
  // Implementation
}

// 5. Create tRPC router
// src/presentation/trpc/routers/feature.router.ts
export const featureRouter = router({
  get: procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const useCase = new GetFeatureUseCase(ctx.featureRepo)
      return await useCase.execute(input.id)
    })
})

// 6. Add to main router
// src/presentation/trpc/app.router.ts
export const appRouter = router({
  // ... existing routers
  feature: featureRouter,
})
```

#### Frontend

**Example: Add a new component**

```typescript
// components/feature/feature-display.tsx
'use client'

import { trpc } from '@/lib/trpc'

export function FeatureDisplay({ id }: { id: string }) {
  const { data, isLoading } = trpc.feature.get.useQuery({ id })
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{data?.name}</div>
}
```

### 2. Database Changes

```bash
# 1. Modify schema
# Edit: src/infrastructure/database/schema.ts

# 2. Generate migration
bun run db:generate

# 3. Apply migration
bun run db:push

# 4. Update seed if needed
# Edit: src/infrastructure/database/seed.ts
bun run db:seed
```

### 3. Add AI Persona

```typescript
// Add to seed.ts
const newPersona = {
  name: '新角色',
  nameEn: 'New Persona',
  description: '角色描述',
  systemPrompt: '你是...',
  category: 'category',
  isActive: true,
}

// Run seed
bun run db:seed
```

---

## Testing

### Unit Tests

```bash
# Backend
cd jack-wiki-backend
bun test

# Frontend
cd jack-wiki-frontend
bun test
```

### Integration Tests

```bash
# Backend integration tests
bun test:integration
```

### Manual Testing

1. **Test Conversation Flow**:
   - Create new conversation
   - Send message
   - Verify AI response
   - Check message history

2. **Test Model Switching**:
   - Switch between Gemini/Claude/GPT
   - Verify each model responds correctly

3. **Test Persona Integration**:
   - Select different personas
   - Verify response style matches persona

---

## Code Quality

### Linting

```bash
# Backend
cd jack-wiki-backend
bun run lint

# Frontend
cd jack-wiki-frontend
bun run lint
```

### Formatting

```bash
# Backend
bun run format

# Frontend
bun run format
```

### Type Checking

TypeScript will check types automatically during development. For manual check:

```bash
tsc --noEmit
```

---

## Environment Variables

### Backend Required Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jack_wiki"
```

At least one AI API key:
```env
GOOGLE_API_KEY="your_key"
ANTHROPIC_API_KEY="your_key"
OPENAI_API_KEY="your_key"
```

### Backend Optional Variables

```env
UPSTASH_REDIS_REST_URL="your_url"
UPSTASH_REDIS_REST_TOKEN="your_token"

R2_ACCOUNT_ID="your_account"
R2_ACCESS_KEY_ID="your_key"
R2_SECRET_ACCESS_KEY="your_secret"
R2_BUCKET_NAME="jack-wiki"

PORT=8000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000"
```

### Frontend Variables

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

---

## Debugging

### Backend Debugging

```bash
# Enable verbose logging
export LOG_LEVEL=debug
bun run dev

# Check tRPC endpoint
curl http://localhost:8000/health
```

### Frontend Debugging

```typescript
// Add to components for debugging
console.log('tRPC data:', data)
console.log('tRPC error:', error)
```

### Database Debugging

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/jack_wiki

# View tables
\dt

# Query conversations
SELECT * FROM conversations;

# Query messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

### Drizzle Studio

```bash
cd jack-wiki-backend
bun run db:studio
# Opens web UI on http://localhost:4983
```

---

## Common Issues

### Issue: Bun not found

**Solution**:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Restart terminal
```

### Issue: Database connection failed

**Solution**:
```bash
# Check Docker containers
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check DATABASE_URL in .env
```

### Issue: AI API key error

**Solution**:
- Verify API key is correct in `.env`
- Check key has sufficient quota
- Ensure at least one model API key is configured

### Issue: tRPC type errors in frontend

**Solution**:
```bash
# Ensure backend is running
cd jack-wiki-backend
bun run dev

# Restart frontend dev server
cd jack-wiki-frontend
bun run dev
```

### Issue: Port already in use

**Solution**:
```bash
# Find process using port
lsof -i :8000  # or :3000

# Kill process
kill -9 <PID>
```

---

## Performance Tips

### 1. Use Bun for Development

Bun is significantly faster than Node.js for development:
- Faster startup
- Faster hot reload
- Faster package installation

### 2. Database Query Optimization

- Use Drizzle's select only needed fields
- Add indexes for frequently queried columns
- Limit query results with pagination

### 3. Frontend Optimization

- Use React Query caching
- Implement virtual scrolling for long message lists
- Lazy load components

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

---

## Contributing

### Code Style

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write descriptive commit messages
- Add JSDoc comments for public APIs

### Pull Request Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Run linting and tests
4. Update documentation
5. Create pull request

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://docs.langchain.com)

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0 (MVP1)
