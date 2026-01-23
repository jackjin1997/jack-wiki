import { router, procedure } from '../procedures'
import { AIModelFactory } from '@/infrastructure/ai/langchain/model-factory'

export const modelRouter = router({
  list: procedure.query(() => {
    const models = AIModelFactory.getSupportedModels()
    return models.map(id => ({
      id,
      name: getModelDisplayName(id),
      provider: getModelProvider(id),
    }))
  }),
})

function getModelDisplayName(id: string): string {
  const names: Record<string, string> = {
    'gemini-pro': 'Gemini Pro',
    'claude-3-sonnet': 'Claude 3.5 Sonnet',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4o': 'GPT-4o',
  }
  return names[id] || id
}

function getModelProvider(id: string): string {
  if (id.startsWith('gemini')) return 'Google'
  if (id.startsWith('claude')) return 'Anthropic'
  if (id.startsWith('gpt')) return 'OpenAI'
  return 'Unknown'
}
