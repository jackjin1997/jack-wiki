import type { ConversationEntity, CreateConversationData } from '../entities/conversation.entity'

export interface ConversationRepository {
  create(data: CreateConversationData): Promise<ConversationEntity>
  findById(id: string): Promise<ConversationEntity | null>
  list(params: { limit: number; offset: number }): Promise<ConversationEntity[]>
  delete(id: string): Promise<void>
  updateTitle(id: string, title: string): Promise<ConversationEntity>
}
