import type { ConversationRepository } from '@/core/repositories/conversation.repository'
import type { ConversationEntity } from '@/core/entities/conversation.entity'

export class ListConversationsUseCase {
  constructor(private conversationRepo: ConversationRepository) {}

  async execute(input: { limit: number; offset: number }): Promise<ConversationEntity[]> {
    return await this.conversationRepo.list(input)
  }
}
