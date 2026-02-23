import type { MessageRepository } from '@/core/repositories/message.repository'
import type { PersonaRepository } from '@/core/repositories/persona.repository'
import type { KnowledgeRepository } from '@/core/repositories/knowledge.repository'
import type { MessageEntity } from '@/core/entities/message.entity'
import type { AIService } from '@/infrastructure/ai/ai.service'
import type { EmbeddingService } from '@/infrastructure/ai/embeddings/embedding.service'
import { NotFoundError } from '@/shared/errors/base.error'
import { logger } from '@/shared/utils/logger'

export interface SendMessageInput {
  conversationId: string
  message: string
  model: string
  personaId?: string
  useRAG?: boolean
}

const RAG_TOP_K = 3
const RAG_MIN_SIMILARITY = 0.4

export class SendMessageUseCase {
  constructor(
    private messageRepo: MessageRepository,
    private personaRepo: PersonaRepository,
    private aiService: AIService,
    private knowledgeRepo?: KnowledgeRepository,
    private embeddingService?: EmbeddingService,
  ) {}

  async execute(input: SendMessageInput): Promise<MessageEntity> {
    // 1. Save user message
    await this.messageRepo.create({
      conversationId: input.conversationId,
      role: 'user',
      content: input.message,
    })

    // 2. Get persona system prompt if specified
    let systemPrompt: string | undefined
    if (input.personaId) {
      const persona = await this.personaRepo.findById(input.personaId)
      if (!persona) throw new NotFoundError('Persona not found')
      systemPrompt = persona.systemPrompt
    }

    // 3. RAG: retrieve relevant knowledge and inject into system prompt
    if (input.useRAG && this.knowledgeRepo && this.embeddingService) {
      const ragContext = await this.retrieveContext(input.message)
      if (ragContext) {
        systemPrompt = systemPrompt
          ? `${systemPrompt}\n\n---\n${ragContext}`
          : ragContext
      }
    }

    // 4. Get conversation history
    const history = await this.messageRepo.findByConversation(input.conversationId, {
      limit: 20,
    })

    // 5. Generate AI response
    const aiResponse = await this.aiService.generateResponse({
      model: input.model,
      systemPrompt,
      history: history.slice(0, -1), // Exclude the just-created user message
      message: input.message,
    })

    // 6. Save AI response
    return await this.messageRepo.create({
      conversationId: input.conversationId,
      role: 'assistant',
      content: aiResponse,
      model: input.model,
      personaId: input.personaId,
    })
  }

  private async retrieveContext(query: string): Promise<string | null> {
    if (!this.knowledgeRepo || !this.embeddingService) return null

    try {
      const queryVector = await this.embeddingService.embedText(query)
      const chunks = await this.knowledgeRepo.similaritySearch(queryVector, RAG_TOP_K)
      const relevant = chunks.filter(c => c.similarity >= RAG_MIN_SIMILARITY)

      if (relevant.length === 0) return null

      logger.info({ count: relevant.length }, 'RAG: injecting knowledge context')

      const contextText = relevant
        .map((c, i) => `[${i + 1}] ${c.chunkText}`)
        .join('\n\n')

      return `以下是与用户问题相关的知识库内容，请参考这些内容回答：\n\n${contextText}`
    } catch (error) {
      logger.warn({ error }, 'RAG retrieval failed, proceeding without context')
      return null
    }
  }
}
