import type { DbClient } from '../database/client'
import type { ConversationRepository } from '@/core/repositories/conversation.repository'
import type { ConversationEntity, CreateConversationData } from '@/core/entities/conversation.entity'
import { conversations } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export class DrizzleConversationRepository implements ConversationRepository {
  constructor(private db: DbClient) {}

  async create(data: CreateConversationData): Promise<ConversationEntity> {
    const [conversation] = await this.db
      .insert(conversations)
      .values({
        title: data.title || 'New Conversation',
      })
      .returning()

    return this.mapToEntity(conversation)
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    const [conversation] = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)

    return conversation ? this.mapToEntity(conversation) : null
  }

  async list(params: { limit: number; offset: number }): Promise<ConversationEntity[]> {
    const results = await this.db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .limit(params.limit)
      .offset(params.offset)

    return results.map(c => this.mapToEntity(c))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(conversations).where(eq(conversations.id, id))
  }

  async updateTitle(id: string, title: string): Promise<ConversationEntity> {
    const [updated] = await this.db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning()

    return this.mapToEntity(updated)
  }

  private mapToEntity(row: any): ConversationEntity {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
