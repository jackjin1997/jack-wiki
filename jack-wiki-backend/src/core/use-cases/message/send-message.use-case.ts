import type { MessageRepository } from '@/core/repositories/message.repository'
import type { PersonaRepository } from '@/core/repositories/persona.repository'
import type { MessageEntity } from '@/core/entities/message.entity'
import type { AIService } from '@/infrastructure/ai/ai.service'
import { NotFoundError } from '@/shared/errors/base.error'

export interface SendMessageInput {
  conversationId: string
  message: string
  model: string
  personaId?: string
}

export class SendMessageUseCase {
  constructor(
    private messageRepo: MessageRepository,
    private personaRepo: PersonaRepository,
    private aiService: AIService
  ) {}

  async execute(input: SendMessageInput): Promise<MessageEntity> {
    // 1. Save user message
    const userMessage = await this.messageRepo.create({
      conversationId: input.conversationId,
      role: 'user',
      content: input.message,
    })

    // 2. Get persona if specified
    let systemPrompt: string | undefined
    if (input.personaId) {
      const persona = await this.personaRepo.findById(input.personaId)
      if (!persona) {
        throw new NotFoundError('Persona not found')
      }
      systemPrompt = persona.systemPrompt
    }

    // 3. Get conversation history
    const history = await this.messageRepo.findByConversation(input.conversationId, {
      limit: 20, // Last 20 messages for context
    })

    // 4. Generate AI response
    const aiResponse = await this.aiService.generateResponse({
      model: input.model,
      systemPrompt,
      history: history.slice(0, -1), // Exclude the just-created user message
      message: input.message,
    })

    // 5. Save AI response
    const assistantMessage = await this.messageRepo.create({
      conversationId: input.conversationId,
      role: 'assistant',
      content: aiResponse,
      model: input.model,
      personaId: input.personaId,
    })

    return assistantMessage
  }
}
