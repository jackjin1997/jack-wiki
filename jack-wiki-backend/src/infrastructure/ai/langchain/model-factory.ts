import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { env } from '@/shared/utils/env'
import { ExternalServiceError } from '@/shared/errors/base.error'

export class AIModelFactory {
  static create(modelName: string): BaseChatModel {
    switch (modelName) {
      case 'gemini-pro':
        if (!env.GOOGLE_API_KEY) {
          throw new ExternalServiceError('Google API key not configured', 'Gemini')
        }
        return new ChatGoogleGenerativeAI({
          modelName: 'gemini-pro',
          apiKey: env.GOOGLE_API_KEY,
          streaming: true,
          temperature: 0.7,
        })

      case 'claude-3-sonnet':
        if (!env.ANTHROPIC_API_KEY) {
          throw new ExternalServiceError('Anthropic API key not configured', 'Claude')
        }
        return new ChatAnthropic({
          modelName: 'claude-3-5-sonnet-20241022',
          apiKey: env.ANTHROPIC_API_KEY,
          streaming: true,
          temperature: 0.7,
        })

      case 'gpt-4-turbo':
      case 'gpt-4o':
        if (!env.OPENAI_API_KEY) {
          throw new ExternalServiceError('OpenAI API key not configured', 'OpenAI')
        }
        return new ChatOpenAI({
          modelName: modelName === 'gpt-4o' ? 'gpt-4o' : 'gpt-4-turbo-preview',
          apiKey: env.OPENAI_API_KEY,
          streaming: true,
          temperature: 0.7,
        })

      default:
        throw new ExternalServiceError(`Unsupported model: ${modelName}`)
    }
  }

  static getSupportedModels(): string[] {
    return ['gemini-pro', 'claude-3-sonnet', 'gpt-4-turbo', 'gpt-4o']
  }
}
