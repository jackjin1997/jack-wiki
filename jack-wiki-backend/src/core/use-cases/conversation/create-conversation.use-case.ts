import type { ConversationRepository } from '@/core/repositories/conversation.repository'
import type { ConversationEntity } from '@/core/entities/conversation.entity'

export class CreateConversationUseCase {
  constructor(private conversationRepo: ConversationRepository) {}

  async execute(input: { title?: string }): Promise<ConversationEntity> {
    return await this.conversationRepo.create({
      title: input.title || 'New Conversation',
    })
  }
}
