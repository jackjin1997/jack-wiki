import { Elysia } from 'elysia'
import { trpc } from '@elysiajs/trpc'
import { cors } from '@elysiajs/cors'
import { appRouter } from './presentation/trpc/app.router'
import { createContext } from './presentation/trpc/context'
import { logger } from './shared/utils/logger'
import { env } from './shared/utils/env'

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: env.ALLOWED_ORIGINS.split(','),
      credentials: true,
    })
  )
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }))
  // tRPC integration
  .use(
    trpc(appRouter, {
      endpoint: '/trpc',
      createContext,
    })
  )
  // Global error handler
  .onError(({ code, error, set }) => {
    logger.error({ code, error: error.message, stack: error.stack }, 'Application error')

    if (code === 'VALIDATION') {
      set.status = 400
      return { success: false, error: 'Validation error', details: error.message }
    }

    if (code === 'NOT_FOUND') {
      set.status = 404
      return { success: false, error: 'Not found' }
    }

    set.status = 500
    return { success: false, error: 'Internal server error' }
  })
  // Start server
  .listen(Number(env.PORT))

logger.info(
  {
    port: env.PORT,
    environment: env.NODE_ENV,
    tRPCEndpoint: `/trpc`,
  },
  '🚀 Jack Wiki Backend Server started'
)

logger.info('📝 Available routes:')
logger.info('  - GET  /health - Health check')
logger.info('  - POST /trpc - tRPC endpoint')

export type App = typeof app
