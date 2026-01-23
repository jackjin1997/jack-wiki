import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../jack-wiki-backend/src/presentation/trpc/app.router'

export const trpc = createTRPCReact<AppRouter>()
