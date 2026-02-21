export type KnowledgeSourceType = 'pdf' | 'markdown' | 'text' | 'url'

export interface KnowledgeItemEntity {
  id: string
  title: string
  content: string
  fileUrl?: string
  sourceType: KnowledgeSourceType
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface CreateKnowledgeItemData {
  title: string
  content: string
  fileUrl?: string
  sourceType: KnowledgeSourceType
  metadata?: Record<string, unknown>
}

export interface EmbeddingEntity {
  id: string
  knowledgeItemId: string
  embedding: number[]
  chunkText: string
  chunkIndex?: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface CreateEmbeddingData {
  knowledgeItemId: string
  embedding: number[]
  chunkText: string
  chunkIndex?: number
  metadata?: Record<string, unknown>
}

export interface SimilarChunk {
  knowledgeItemId: string
  chunkText: string
  chunkIndex?: number
  similarity: number
  metadata?: Record<string, unknown>
}
