import { createHTTPServer } from '@trpc/server/adapters/standalone'
import cors from 'cors'
import { appRouter } from './presentation/trpc/app.router'
import { createContext } from './presentation/trpc/context'
import { logger } from './shared/utils/logger'
import { env } from './shared/utils/env'

// Create tRPC HTTP server with CORS
const server = createHTTPServer({
  middleware: cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  }),
  router: appRouter,
  createContext,
})

const port = Number(env.PORT)

server.listen(port)

logger.info(
  {
    port,
    environment: env.NODE_ENV,
    tRPCEndpoint: `/trpc`,
  },
  '🚀 Jack Wiki Backend Server started'
)

logger.info('📝 Available routes:')
logger.info('  - POST /trpc - tRPC endpoint')
logger.info(`  - Server running at http://localhost:${port}`)

export { appRouter }
