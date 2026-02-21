import { router, procedure } from '../procedures'
import { UploadKnowledgeUseCase } from '@/core/use-cases/knowledge/upload-knowledge.use-case'
import { SearchKnowledgeUseCase } from '@/core/use-cases/knowledge/search-knowledge.use-case'
import { NotFoundError } from '@/shared/errors/base.error'
import {
  uploadKnowledgeSchema,
  searchKnowledgeSchema,
  getKnowledgeItemSchema,
  listKnowledgeSchema,
  deleteKnowledgeSchema,
} from '@/shared/schemas/knowledge.schema'

export const knowledgeRouter = router({
  upload: procedure.input(uploadKnowledgeSchema).mutation(async ({ input, ctx }) => {
    const useCase = new UploadKnowledgeUseCase(ctx.knowledgeRepo, ctx.embeddingService)
    return await useCase.execute(input)
  }),

  search: procedure.input(searchKnowledgeSchema).query(async ({ input, ctx }) => {
    const useCase = new SearchKnowledgeUseCase(ctx.knowledgeRepo, ctx.embeddingService)
    return await useCase.execute(input)
  }),

  list: procedure.input(listKnowledgeSchema).query(async ({ input, ctx }) => {
    return await ctx.knowledgeRepo.listItems(input)
  }),

  get: procedure.input(getKnowledgeItemSchema).query(async ({ input, ctx }) => {
    const item = await ctx.knowledgeRepo.findItemById(input.id)
    if (!item) throw new NotFoundError('Knowledge item not found')
    return item
  }),

  delete: procedure.input(deleteKnowledgeSchema).mutation(async ({ input, ctx }) => {
    await ctx.knowledgeRepo.deleteItem(input.id)
    return { success: true }
  }),
})
