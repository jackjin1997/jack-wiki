import { router, procedure } from '../procedures'
import { SendMessageUseCase } from '@/core/use-cases/message/send-message.use-case'
import { sendMessageSchema, listMessagesSchema } from '@/shared/schemas/message.schema'
import { observable } from '@trpc/server/observable'

export const messageRouter = router({
  send: procedure.input(sendMessageSchema).mutation(async ({ input, ctx }) => {
    const useCase = new SendMessageUseCase(ctx.messageRepo, ctx.personaRepo, ctx.aiService)
    return await useCase.execute(input)
  }),

  // Streaming endpoint using tRPC subscriptions
  stream: procedure.input(sendMessageSchema).subscription(({ input, ctx }) => {
    return observable(emit => {
      const stream = async () => {
        try {
          // Save user message first
          await ctx.messageRepo.create({
            conversationId: input.conversationId,
            role: 'user',
            content: input.message,
          })

          // Get persona if specified
          let systemPrompt: string | undefined
          if (input.personaId) {
            const persona = await ctx.personaRepo.findById(input.personaId)
            if (persona) {
              systemPrompt = persona.systemPrompt
            }
          }

          // Get conversation history
          const history = await ctx.messageRepo.findByConversation(input.conversationId, {
            limit: 20,
          })

          // Stream AI response
          const aiStream = ctx.aiService.streamResponse({
            model: input.model,
            systemPrompt,
            history: history.slice(0, -1),
            message: input.message,
          })

          let fullResponse = ''
          for await (const chunk of aiStream) {
            fullResponse += chunk
            emit.next({ type: 'token', content: chunk })
          }

          // Save complete AI response
          const assistantMessage = await ctx.messageRepo.create({
            conversationId: input.conversationId,
            role: 'assistant',
            content: fullResponse,
            model: input.model,
            personaId: input.personaId,
          })

          emit.next({ type: 'done', messageId: assistantMessage.id })
          emit.complete()
        } catch (error) {
          emit.error(error as Error)
        }
      }

      void stream()

      return () => {
        // Cleanup if needed
      }
    })
  }),

  list: procedure.input(listMessagesSchema).query(async ({ input, ctx }) => {
    return await ctx.messageRepo.findByConversation(input.conversationId, {
      limit: input.limit,
      offset: input.offset,
    })
  }),
})
