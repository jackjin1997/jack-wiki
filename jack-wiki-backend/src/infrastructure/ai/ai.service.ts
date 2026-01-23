import type { MessageEntity } from '@/core/entities/message.entity'

export interface GenerateResponseInput {
  model: string
  systemPrompt?: string
  history: MessageEntity[]
  message: string
}

export interface AIService {
  generateResponse(input: GenerateResponseInput): Promise<string>
  streamResponse(input: GenerateResponseInput): AsyncGenerator<string, void, unknown>
}
