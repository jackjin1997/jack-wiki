import { router, procedure } from '../procedures'
import { CreateConversationUseCase } from '@/core/use-cases/conversation/create-conversation.use-case'
import { ListConversationsUseCase } from '@/core/use-cases/conversation/list-conversations.use-case'
import {
  createConversationSchema,
  listConversationsSchema,
  getConversationSchema,
  deleteConversationSchema,
} from '@/shared/schemas/conversation.schema'
import { NotFoundError } from '@/shared/errors/base.error'

export const conversationRouter = router({
  create: procedure.input(createConversationSchema).mutation(async ({ input, ctx }) => {
    const useCase = new CreateConversationUseCase(ctx.conversationRepo)
    return await useCase.execute(input)
  }),

  list: procedure.input(listConversationsSchema).query(async ({ input, ctx }) => {
    const useCase = new ListConversationsUseCase(ctx.conversationRepo)
    return await useCase.execute(input)
  }),

  get: procedure.input(getConversationSchema).query(async ({ input, ctx }) => {
    const conversation = await ctx.conversationRepo.findById(input.id)
    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }
    return conversation
  }),

  delete: procedure.input(deleteConversationSchema).mutation(async ({ input, ctx }) => {
    await ctx.conversationRepo.delete(input.id)
    return { success: true }
  }),
})
