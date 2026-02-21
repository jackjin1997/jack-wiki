import { db } from '@/infrastructure/database/client'
import { DrizzleConversationRepository } from '@/infrastructure/repositories/drizzle-conversation.repository'
import { DrizzleMessageRepository } from '@/infrastructure/repositories/drizzle-message.repository'
import { DrizzlePersonaRepository } from '@/infrastructure/repositories/drizzle-persona.repository'
import { DrizzleKnowledgeRepository } from '@/infrastructure/repositories/drizzle-knowledge.repository'
import { LangChainAIService } from '@/infrastructure/ai/langchain-ai.service'
import { EmbeddingService } from '@/infrastructure/ai/embeddings/embedding.service'

export interface Context {
  db: typeof db
  conversationRepo: DrizzleConversationRepository
  messageRepo: DrizzleMessageRepository
  personaRepo: DrizzlePersonaRepository
  knowledgeRepo: DrizzleKnowledgeRepository
  aiService: LangChainAIService
  embeddingService: EmbeddingService
}

export const createContext = (): Context => {
  return {
    db,
    conversationRepo: new DrizzleConversationRepository(db),
    messageRepo: new DrizzleMessageRepository(db),
    personaRepo: new DrizzlePersonaRepository(db),
    knowledgeRepo: new DrizzleKnowledgeRepository(db),
    aiService: new LangChainAIService(),
    embeddingService: new EmbeddingService(),
  }
}
