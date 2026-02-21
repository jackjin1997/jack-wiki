import type { ConversationRepository } from '@/core/repositories/conversation.repository'
import type { MessageRepository } from '@/core/repositories/message.repository'
import type { AIService } from '@/infrastructure/ai/ai.service'
import { createContextGenerator, type ContextProtocol, type LLMProvider } from 'cxp'
import { NotFoundError } from '@/shared/errors/base.error'

export interface GenerateCXPInput {
  conversationId: string
  model?: string
}

export interface GenerateCXPOutput {
  cxp: ContextProtocol
  processingTime?: number
}

export class GenerateCXPUseCase {
  constructor(
    private conversationRepo: ConversationRepository,
    private messageRepo: MessageRepository,
    private aiService: AIService
  ) {}

  async execute(input: GenerateCXPInput): Promise<GenerateCXPOutput> {
    // 1. Get conversation
    const conversation = await this.conversationRepo.findById(input.conversationId)
    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }

    // 2. Get all messages
    const messages = await this.messageRepo.findByConversation(input.conversationId, {
      limit: 100,
    })

    if (messages.length === 0) {
      throw new NotFoundError('No messages in conversation')
    }

    // 3. Create LLM provider adapter
    const llmProvider: LLMProvider = {
      generate: async (prompt: string) => {
        return await this.aiService.generateResponse({
          model: input.model || 'gemini-2.5-flash',
          message: prompt,
          history: [],
        })
      },
    }

    // 4. Create generator and generate CXP
    const generator = createContextGenerator({
      llm: llmProvider,
      defaultAgent: 'jack-wiki',
    })

    const result = await generator.fromConversation(
      input.conversationId,
      messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        title: conversation.title,
        agent: 'jack-wiki',
      }
    )

    return {
      cxp: result.context,
      processingTime: result.processingTime,
    }
  }
}
