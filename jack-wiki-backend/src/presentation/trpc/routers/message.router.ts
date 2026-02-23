import { router, procedure } from '../procedures'
import { SendMessageUseCase } from '@/core/use-cases/message/send-message.use-case'
import { sendMessageSchema, listMessagesSchema } from '@/shared/schemas/message.schema'
import { observable } from '@trpc/server/observable'

export const messageRouter = router({
  send: procedure.input(sendMessageSchema).mutation(async ({ input, ctx }) => {
    const useCase = new SendMessageUseCase(
      ctx.messageRepo,
      ctx.personaRepo,
      ctx.aiService,
      ctx.knowledgeRepo,
      ctx.embeddingService,
    )
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

          // Get persona system prompt if specified
          let systemPrompt: string | undefined
          if (input.personaId) {
            const persona = await ctx.personaRepo.findById(input.personaId)
            if (persona) {
              systemPrompt = persona.systemPrompt
            }
          }

          // RAG: retrieve relevant knowledge and inject into system prompt
          if (input.useRAG) {
            try {
              const queryVector = await ctx.embeddingService.embedText(input.message)
              const chunks = await ctx.knowledgeRepo.similaritySearch(queryVector, 3)
              const relevant = chunks.filter(c => c.similarity >= 0.4)
              if (relevant.length > 0) {
                const contextText = relevant
                  .map((c, i) => `[${i + 1}] ${c.chunkText}`)
                  .join('\n\n')
                const ragContext = `以下是与用户问题相关的知识库内容，请参考这些内容回答：\n\n${contextText}`
                systemPrompt = systemPrompt ? `${systemPrompt}\n\n---\n${ragContext}` : ragContext
              }
            } catch {
              // RAG failure is non-fatal; continue without context
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
