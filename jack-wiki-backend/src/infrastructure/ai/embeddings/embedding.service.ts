import { OpenAIEmbeddings } from '@langchain/openai'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { env } from '@/shared/utils/env'
import { ExternalServiceError } from '@/shared/errors/base.error'
import { logger } from '@/shared/utils/logger'

// Chunk size tuned for text-embedding-ada-002 (max 8191 tokens)
// 512 chars ≈ ~128 tokens, leaves plenty of headroom with overlap
const DEFAULT_CHUNK_SIZE = 512
const DEFAULT_CHUNK_OVERLAP = 64

export class EmbeddingService {
  private splitter: RecursiveCharacterTextSplitter

  constructor(
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
  ) {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    })
  }

  async splitText(text: string): Promise<string[]> {
    const chunks = await this.splitter.splitText(text)
    logger.debug({ chunkCount: chunks.length }, 'Text split into chunks')
    return chunks
  }

  async embedText(text: string): Promise<number[]> {
    const model = this.createEmbeddingModel()
    try {
      const vector = await model.embedQuery(text)
      return vector
    } catch (error) {
      logger.error({ error }, 'Error embedding text')
      throw new ExternalServiceError(
        error instanceof Error ? error.message : 'Embedding failed',
        'EmbeddingService',
      )
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return []
    const model = this.createEmbeddingModel()
    try {
      logger.info({ count: texts.length }, 'Embedding batch of texts')
      const vectors = await model.embedDocuments(texts)
      return vectors
    } catch (error) {
      logger.error({ error }, 'Error embedding batch')
      throw new ExternalServiceError(
        error instanceof Error ? error.message : 'Batch embedding failed',
        'EmbeddingService',
      )
    }
  }

  // Split then embed in one call — the main entry point for ingestion
  async splitAndEmbed(text: string): Promise<{ chunks: string[]; vectors: number[][] }> {
    const chunks = await this.splitText(text)
    const vectors = await this.embedBatch(chunks)
    return { chunks, vectors }
  }

  private createEmbeddingModel() {
    // Prefer Google (768-dim, matches DB schema)
    if (env.GOOGLE_API_KEY) {
      return new GoogleGenerativeAIEmbeddings({
        modelName: 'gemini-embedding-001',
        apiKey: env.GOOGLE_API_KEY,
      })
    }

    // Fallback: OpenAI (1536-dim — requires schema change if switching)
    if (env.OPENAI_API_KEY) {
      logger.warn(
        'Using OpenAI embeddings (1536-dim). DB schema expects 768-dim. ' +
        'Update embeddings table dimension if switching permanently.',
      )
      return new OpenAIEmbeddings({
        modelName: 'text-embedding-ada-002',
        apiKey: env.OPENAI_API_KEY,
      })
    }

    throw new ExternalServiceError(
      'No embedding API key configured. Set GOOGLE_API_KEY or OPENAI_API_KEY.',
      'EmbeddingService',
    )
  }
}
