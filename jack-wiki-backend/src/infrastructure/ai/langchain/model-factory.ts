import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { env } from '@/shared/utils/env'
import { ExternalServiceError } from '@/shared/errors/base.error'

export class AIModelFactory {
  private static readonly ANTHROPIC_MODEL_MAP: Record<string, string> = {
    'claude-opus-4-6': 'claude-opus-4-6-20260205',
    'claude-sonnet-4-6': 'claude-sonnet-4-6-20260217',
  }

  private static readonly OPENAI_MODEL_MAP: Record<string, string> = {
    'gpt-4o': 'gpt-4o',
    'o3-mini': 'o3-mini',
  }

  private static readonly GOOGLE_MODEL_MAP: Record<string, string> = {
    'gemini-3.1-pro': 'gemini-3.1-pro',
    'gemini-3.0-pro': 'gemini-3.0-pro',
    'gemini-2.5-flash': 'gemini-2.5-flash',
  }

  static create(modelName: string): BaseChatModel {
    // Anthropic Models
    if (modelName in this.ANTHROPIC_MODEL_MAP) {
      if (!env.ANTHROPIC_API_KEY) {
        throw new ExternalServiceError('Anthropic API key not configured', 'Claude')
      }
      return new ChatAnthropic({
        modelName: this.ANTHROPIC_MODEL_MAP[modelName],
        apiKey: env.ANTHROPIC_API_KEY,
        streaming: true,
        temperature: 0.7,
      })
    }

    // Google Models
    if (modelName in this.GOOGLE_MODEL_MAP) {
      if (!env.GOOGLE_API_KEY) {
        throw new ExternalServiceError('Google API key not configured', 'Gemini')
      }
      return new ChatGoogleGenerativeAI({
        modelName: this.GOOGLE_MODEL_MAP[modelName],
        apiKey: env.GOOGLE_API_KEY,
        streaming: true,
        temperature: 0.7,
      })
    }

    // OpenAI Models
    if (modelName in this.OPENAI_MODEL_MAP) {
      if (!env.OPENAI_API_KEY) {
        throw new ExternalServiceError('OpenAI API key not configured', 'OpenAI')
      }
      return new ChatOpenAI({
        modelName: this.OPENAI_MODEL_MAP[modelName],
        apiKey: env.OPENAI_API_KEY,
        streaming: true,
        temperature: 0.7,
      })
    }

    throw new ExternalServiceError(`Unsupported model: ${modelName}`)
  }

  static getSupportedModels(): string[] {
    return [
      ...Object.keys(this.ANTHROPIC_MODEL_MAP),
      ...Object.keys(this.GOOGLE_MODEL_MAP),
      ...Object.keys(this.OPENAI_MODEL_MAP),
    ]
  }
}
