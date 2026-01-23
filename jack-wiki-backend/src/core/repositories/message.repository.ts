import type { MessageEntity, CreateMessageData } from '../entities/message.entity'

export interface MessageRepository {
  create(data: CreateMessageData): Promise<MessageEntity>
  findById(id: string): Promise<MessageEntity | null>
  findByConversation(conversationId: string, params?: { limit?: number; offset?: number }): Promise<MessageEntity[]>
  delete(id: string): Promise<void>
}
