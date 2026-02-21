import { eq, desc, sql, type SQL } from 'drizzle-orm'
import type { DbClient } from '../database/client'
import type { KnowledgeRepository } from '@/core/repositories/knowledge.repository'
import type {
  KnowledgeItemEntity,
  EmbeddingEntity,
  SimilarChunk,
  CreateKnowledgeItemData,
  CreateEmbeddingData,
} from '@/core/entities/knowledge.entity'
import { knowledgeItems, embeddings } from '../database/schema'

export class DrizzleKnowledgeRepository implements KnowledgeRepository {
  constructor(private db: DbClient) {}

  async saveItem(data: CreateKnowledgeItemData): Promise<KnowledgeItemEntity> {
    const [item] = await this.db
      .insert(knowledgeItems)
      .values({
        title: data.title,
        content: data.content,
        fileUrl: data.fileUrl,
        sourceType: data.sourceType,
        metadata: data.metadata,
      })
      .returning()

    return this.mapItemToEntity(item)
  }

  async findItemById(id: string): Promise<KnowledgeItemEntity | null> {
    const [item] = await this.db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .limit(1)

    return item ? this.mapItemToEntity(item) : null
  }

  async listItems(params: { limit: number; offset: number }): Promise<KnowledgeItemEntity[]> {
    const results = await this.db
      .select()
      .from(knowledgeItems)
      .orderBy(desc(knowledgeItems.createdAt))
      .limit(params.limit)
      .offset(params.offset)

    return results.map(item => this.mapItemToEntity(item))
  }

  async deleteItem(id: string): Promise<void> {
    await this.db.delete(knowledgeItems).where(eq(knowledgeItems.id, id))
  }

  async saveEmbedding(data: CreateEmbeddingData): Promise<EmbeddingEntity> {
    const [embedding] = await this.db
      .insert(embeddings)
      .values({
        knowledgeItemId: data.knowledgeItemId,
        embedding: this.toVectorSql(data.embedding) as unknown as number[],
        chunkText: data.chunkText,
        chunkIndex: data.chunkIndex?.toString(),
        metadata: data.metadata,
      })
      .returning()

    return this.mapEmbeddingToEntity(embedding)
  }

  async saveEmbeddingsBatch(data: CreateEmbeddingData[]): Promise<EmbeddingEntity[]> {
    if (data.length === 0) return []

    const rows = await this.db
      .insert(embeddings)
      .values(
        data.map(d => ({
          knowledgeItemId: d.knowledgeItemId,
          embedding: this.toVectorSql(d.embedding) as unknown as number[],
          chunkText: d.chunkText,
          chunkIndex: d.chunkIndex?.toString(),
          metadata: d.metadata,
        }))
      )
      .returning()

    return rows.map(row => this.mapEmbeddingToEntity(row))
  }

  async similaritySearch(queryVector: number[], topK: number): Promise<SimilarChunk[]> {
    // pgvector cosine distance operator: <=>
    // similarity = 1 - cosine_distance (range: 0~1, higher = more similar)
    const vectorLiteral = `[${queryVector.join(',')}]`

    const results = await this.db
      .select({
        knowledgeItemId: embeddings.knowledgeItemId,
        chunkText: embeddings.chunkText,
        chunkIndex: embeddings.chunkIndex,
        metadata: embeddings.metadata,
        similarity: sql<number>`1 - (${embeddings.embedding} <=> ${vectorLiteral}::vector)`,
      })
      .from(embeddings)
      .orderBy(sql`${embeddings.embedding} <=> ${vectorLiteral}::vector`)
      .limit(topK)

    return results.map(row => ({
      knowledgeItemId: row.knowledgeItemId,
      chunkText: row.chunkText,
      chunkIndex: row.chunkIndex !== null ? Number(row.chunkIndex) : undefined,
      similarity: row.similarity,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    }))
  }

  private mapItemToEntity(row: typeof knowledgeItems.$inferSelect): KnowledgeItemEntity {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      fileUrl: row.fileUrl ?? undefined,
      sourceType: row.sourceType as KnowledgeItemEntity['sourceType'],
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  private mapEmbeddingToEntity(row: typeof embeddings.$inferSelect): EmbeddingEntity {
    return {
      id: row.id,
      knowledgeItemId: row.knowledgeItemId,
      embedding: (row.embedding as number[]) ?? [],
      chunkText: row.chunkText,
      chunkIndex: row.chunkIndex !== null ? Number(row.chunkIndex) : undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
      createdAt: row.createdAt,
    }
  }

  // postgres.js doesn't auto-serialize number[] to pgvector format.
  // Must pass as `[x1,x2,...]::vector` SQL expression.
  private toVectorSql(vector: number[]): SQL {
    return sql`${`[${vector.join(',')}]`}::vector`
  }
}
