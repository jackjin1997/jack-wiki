import { router, procedure } from '../procedures'
import { AI_MODELS_CONFIG } from '@/config/ai-models.config'

export const modelRouter = router({
  list: procedure.query(() => {
    return Object.values(AI_MODELS_CONFIG).map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
    }))
  }),
})
