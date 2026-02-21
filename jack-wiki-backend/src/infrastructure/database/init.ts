import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jack_wiki'

async function init() {
  const sql = postgres(connectionString)

  try {
    console.log('🔧 Initializing database extensions...')

    await sql`CREATE EXTENSION IF NOT EXISTS vector`
    console.log('✓ pgvector extension enabled')

    console.log('\n✅ Database initialization completed!')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  } finally {
    await sql.end()
  }
}

init()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
