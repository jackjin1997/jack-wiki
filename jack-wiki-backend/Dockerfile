# Use official Bun image
FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=8000

COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run --bun -e "fetch('http://localhost:8000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

CMD ["bun", "run", "src/index.ts"]
