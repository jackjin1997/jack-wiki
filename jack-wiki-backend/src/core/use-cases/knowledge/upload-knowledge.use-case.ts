import type { KnowledgeRepository } from '@/core/repositories/knowledge.repository'
import type { KnowledgeItemEntity, KnowledgeSourceType } from '@/core/entities/knowledge.entity'
import type { EmbeddingService } from '@/infrastructure/ai/embeddings/embedding.service'
import { logger } from '@/shared/utils/logger'

export interface UploadKnowledgeInput {
  title: string
  content: string
  sourceType: KnowledgeSourceType
  fileUrl?: string
  metadata?: Record<string, unknown>
}

export class UploadKnowledgeUseCase {
  constructor(
    private knowledgeRepo: KnowledgeRepository,
    private embeddingService: EmbeddingService,
  ) {}

  async execute(input: UploadKnowledgeInput): Promise<KnowledgeItemEntity> {
    // 1. Save the knowledge item (full content stored for reference)
    const item = await this.knowledgeRepo.saveItem({
      title: input.title,
      content: input.content,
      sourceType: input.sourceType,
      fileUrl: input.fileUrl,
      metadata: input.metadata,
    })

    logger.info({ id: item.id, title: item.title }, 'Knowledge item saved, starting embedding')

    // 2. Split content into chunks and embed them in one call
    const { chunks, vectors } = await this.embeddingService.splitAndEmbed(input.content)

    // 3. Persist all embeddings in a single batch insert
    await this.knowledgeRepo.saveEmbeddingsBatch(
      chunks.map((chunkText, index) => ({
        knowledgeItemId: item.id,
        embedding: vectors[index],
        chunkText,
        chunkIndex: index,
      })),
    )

    logger.info({ id: item.id, chunkCount: chunks.length }, 'Embeddings saved')

    return item
  }
}
