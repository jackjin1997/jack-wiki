import { db } from '@/infrastructure/database/client'
import { DrizzleConversationRepository } from '@/infrastructure/repositories/drizzle-conversation.repository'
import { DrizzleMessageRepository } from '@/infrastructure/repositories/drizzle-message.repository'
import { DrizzlePersonaRepository } from '@/infrastructure/repositories/drizzle-persona.repository'
import { LangChainAIService } from '@/infrastructure/ai/langchain-ai.service'

export interface Context {
  db: typeof db
  conversationRepo: DrizzleConversationRepository
  messageRepo: DrizzleMessageRepository
  personaRepo: DrizzlePersonaRepository
  aiService: LangChainAIService
}

export const createContext = (): Context => {
  return {
    db,
    conversationRepo: new DrizzleConversationRepository(db),
    messageRepo: new DrizzleMessageRepository(db),
    personaRepo: new DrizzlePersonaRepository(db),
    aiService: new LangChainAIService(),
  }
}
