import type {
  KnowledgeItemEntity,
  EmbeddingEntity,
  SimilarChunk,
  CreateKnowledgeItemData,
  CreateEmbeddingData,
} from '../entities/knowledge.entity'

export interface KnowledgeRepository {
  saveItem(data: CreateKnowledgeItemData): Promise<KnowledgeItemEntity>
  findItemById(id: string): Promise<KnowledgeItemEntity | null>
  listItems(params: { limit: number; offset: number }): Promise<KnowledgeItemEntity[]>
  deleteItem(id: string): Promise<void>

  saveEmbedding(data: CreateEmbeddingData): Promise<EmbeddingEntity>
  saveEmbeddingsBatch(data: CreateEmbeddingData[]): Promise<EmbeddingEntity[]>

  similaritySearch(queryVector: number[], topK: number): Promise<SimilarChunk[]>
}
