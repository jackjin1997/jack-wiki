import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import { logger } from '@/shared/utils/logger'
import { BaseError } from '@/shared/errors/base.error'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
      },
    }
  },
})

// Logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  logger.info({ path, type }, 'tRPC request')

  const result = await next()

  const duration = Date.now() - start
  logger.info({ path, type, duration, success: result.ok }, 'tRPC response')

  return result
})

// Error handling middleware
const errorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof BaseError) {
      logger.error({ error: error.message, code: error.code }, 'Business error')
      throw error
    }

    logger.error({ error }, 'Unexpected error')
    throw error
  }
})

// Base procedure with middlewares
export const procedure = t.procedure.use(loggingMiddleware).use(errorMiddleware)

export const router = t.router
export const middleware = t.middleware
