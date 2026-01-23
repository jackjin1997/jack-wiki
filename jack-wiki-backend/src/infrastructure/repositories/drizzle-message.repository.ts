import type { DbClient } from '../database/client'
import type { MessageRepository } from '@/core/repositories/message.repository'
import type { MessageEntity, CreateMessageData } from '@/core/entities/message.entity'
import { messages } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export class DrizzleMessageRepository implements MessageRepository {
  constructor(private db: DbClient) {}

  async create(data: CreateMessageData): Promise<MessageEntity> {
    const [message] = await this.db
      .insert(messages)
      .values({
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        model: data.model,
        personaId: data.personaId,
        metadata: data.metadata,
      })
      .returning()

    return this.mapToEntity(message)
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const [message] = await this.db.select().from(messages).where(eq(messages.id, id)).limit(1)

    return message ? this.mapToEntity(message) : null
  }

  async findByConversation(
    conversationId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<MessageEntity[]> {
    const query = this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))

    if (params?.limit) {
      query.limit(params.limit)
    }
    if (params?.offset) {
      query.offset(params.offset)
    }

    const results = await query

    // Return in chronological order (oldest first)
    return results.reverse().map(m => this.mapToEntity(m))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(messages).where(eq(messages.id, id))
  }

  private mapToEntity(row: any): MessageEntity {
    return {
      id: row.id,
      conversationId: row.conversationId,
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      model: row.model,
      personaId: row.personaId,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }
  }
}
