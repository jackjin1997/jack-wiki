export const AI_MODELS_CONFIG = {
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    maxTokens: 30720,
    supportsStreaming: true,
    requiresApiKey: 'GOOGLE_API_KEY',
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    maxTokens: 200000,
    supportsStreaming: true,
    requiresApiKey: 'ANTHROPIC_API_KEY',
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    maxTokens: 128000,
    supportsStreaming: true,
    requiresApiKey: 'OPENAI_API_KEY',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    maxTokens: 128000,
    supportsStreaming: true,
    requiresApiKey: 'OPENAI_API_KEY',
  },
} as const

export type ModelId = keyof typeof AI_MODELS_CONFIG
