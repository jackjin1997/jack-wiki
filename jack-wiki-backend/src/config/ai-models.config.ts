export const AI_MODELS_CONFIG = {
  // Anthropic Models
  'claude-opus-4-6': {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    maxTokens: 1000000,
    supportsStreaming: true,
    requiresApiKey: 'ANTHROPIC_API_KEY',
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    maxTokens: 200000,
    supportsStreaming: true,
    requiresApiKey: 'ANTHROPIC_API_KEY',
  },
  // Google Models
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    maxTokens: 1000000,
    supportsStreaming: true,
    requiresApiKey: 'GOOGLE_API_KEY',
  },
  'gemini-3.0-pro': {
    id: 'gemini-3.0-pro',
    name: 'Gemini 3.0 Pro',
    provider: 'Google',
    maxTokens: 1000000,
    supportsStreaming: true,
    requiresApiKey: 'GOOGLE_API_KEY',
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    maxTokens: 1000000,
    supportsStreaming: true,
    requiresApiKey: 'GOOGLE_API_KEY',
  },
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    maxTokens: 128000,
    supportsStreaming: true,
    requiresApiKey: 'OPENAI_API_KEY',
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    maxTokens: 200000,
    supportsStreaming: true,
    requiresApiKey: 'OPENAI_API_KEY',
  },
} as const

export type ModelId = keyof typeof AI_MODELS_CONFIG
