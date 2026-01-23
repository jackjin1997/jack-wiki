import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { AIService, GenerateResponseInput } from './ai.service'
import { AIModelFactory } from './langchain/model-factory'
import { logger } from '@/shared/utils/logger'
import { ExternalServiceError } from '@/shared/errors/base.error'

export class LangChainAIService implements AIService {
  async generateResponse(input: GenerateResponseInput): Promise<string> {
    try {
      const model = AIModelFactory.create(input.model)
      const messages = this.buildMessages(input)

      logger.info({ model: input.model }, 'Generating AI response')

      const response = await model.invoke(messages)
      return response.content.toString()
    } catch (error) {
      logger.error({ error, model: input.model }, 'Error generating AI response')
      throw new ExternalServiceError(
        error instanceof Error ? error.message : 'Unknown error',
        input.model
      )
    }
  }

  async *streamResponse(input: GenerateResponseInput): AsyncGenerator<string, void, unknown> {
    try {
      const model = AIModelFactory.create(input.model)
      const messages = this.buildMessages(input)

      logger.info({ model: input.model }, 'Streaming AI response')

      const stream = await model.stream(messages)

      for await (const chunk of stream) {
        const content = chunk.content.toString()
        if (content) {
          yield content
        }
      }
    } catch (error) {
      logger.error({ error, model: input.model }, 'Error streaming AI response')
      throw new ExternalServiceError(
        error instanceof Error ? error.message : 'Unknown error',
        input.model
      )
    }
  }

  private buildMessages(input: GenerateResponseInput) {
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = []

    // Add system prompt if provided
    if (input.systemPrompt) {
      messages.push(new SystemMessage(input.systemPrompt))
    }

    // Add conversation history
    for (const msg of input.history) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content))
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content))
      } else if (msg.role === 'system') {
        messages.push(new SystemMessage(msg.content))
      }
    }

    // Add current user message
    messages.push(new HumanMessage(input.message))

    return messages
  }
}
