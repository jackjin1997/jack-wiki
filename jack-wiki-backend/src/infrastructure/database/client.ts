import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Connection string from environment
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jack_wiki'

// Create postgres client
const queryClient = postgres(connectionString)

// Create drizzle instance with schema
export const db = drizzle(queryClient, { schema })

// Export for use in the application
export type DbClient = typeof db
