import { router } from './procedures'
import { conversationRouter } from './routers/conversation.router'
import { messageRouter } from './routers/message.router'
import { personaRouter } from './routers/persona.router'
import { modelRouter } from './routers/model.router'
import { knowledgeRouter } from './routers/knowledge.router'

export const appRouter = router({
  conversation: conversationRouter,
  message: messageRouter,
  persona: personaRouter,
  model: modelRouter,
  knowledge: knowledgeRouter,
})

export type AppRouter = typeof appRouter
