import type { KnowledgeRepository } from '@/core/repositories/knowledge.repository'
import type { SimilarChunk } from '@/core/entities/knowledge.entity'
import type { EmbeddingService } from '@/infrastructure/ai/embeddings/embedding.service'
import { logger } from '@/shared/utils/logger'

export interface SearchKnowledgeInput {
  query: string
  topK?: number
}

export class SearchKnowledgeUseCase {
  constructor(
    private knowledgeRepo: KnowledgeRepository,
    private embeddingService: EmbeddingService,
  ) {}

  async execute(input: SearchKnowledgeInput): Promise<SimilarChunk[]> {
    const topK = input.topK ?? 5

    logger.info({ query: input.query, topK }, 'Searching knowledge base')

    // 1. Embed the query with the same model used during ingestion
    const queryVector = await this.embeddingService.embedText(input.query)

    // 2. Find semantically similar chunks via pgvector cosine distance
    const results = await this.knowledgeRepo.similaritySearch(queryVector, topK)

    logger.info({ resultCount: results.length }, 'Knowledge search completed')

    return results
  }
}
