import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

export default {
  schema: './src/infrastructure/database/schema.ts',
  out: './src/infrastructure/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jack_wiki',
  },
  verbose: true,
  strict: true,
} satisfies Config
