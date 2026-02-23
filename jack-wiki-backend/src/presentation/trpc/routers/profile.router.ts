import { z } from 'zod'
import { router, procedure } from '../procedures'
import { SendMessageUseCase } from '@/core/use-cases/message/send-message.use-case'

// Static profile data — update this to reflect Jack's actual info
const JACK_PROFILE = {
  name: 'Jack',
  nameZh: '许进泽',
  title: 'Full-Stack Engineer · AI Enthusiast',
  bio: '专注于 TypeScript 生态和 AI 应用开发，热爱构建实用的开发者工具和知识管理系统。目前正在开发 jack-wiki——一个集成多模型对话、RAG 知识检索的个人知识库系统。',
  email: '1037461232@qq.com',
  github: 'https://github.com/jackjin1997',
  skills: {
    Frontend: ['TypeScript', 'React', 'Next.js 15', 'Tailwind CSS', 'shadcn/ui'],
    Backend: ['Bun', 'Node.js', 'Elysia', 'tRPC', 'Drizzle ORM', 'PostgreSQL'],
    AI: ['LangChain', 'RAG', 'pgvector', 'Gemini', 'Claude', 'GPT-4o'],
    Tools: ['Docker', 'pnpm', 'Git', 'Redis'],
  },
  projects: [
    {
      name: 'Jack Wiki',
      desc: '个人 AI 知识库系统，支持多模型对话、12 个 AI 角色扮演、RAG 知识检索和 CXP 上下文导出协议。',
      tech: ['Next.js 15', 'Bun', 'tRPC', 'PostgreSQL', 'pgvector', 'LangChain'],
      url: 'https://github.com/jackjin1997/jack-wiki',
    },
  ],
} as const

export const profileRouter = router({
  // Structured profile data for the about page UI
  getProfile: procedure.query(() => JACK_PROFILE),

  // AI self-introduction: auto-binds Jack's profile persona + forces RAG
  // Accepts a conversationId managed by the client (lazy-created)
  askJack: procedure
    .input(z.object({
      conversationId: z.string().uuid(),
      message: z.string().min(1).max(2000),
      model: z.enum(['gemini-2.5-flash', 'claude-sonnet-4-6']).default('gemini-2.5-flash'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Find Jack's profile persona automatically
      const allPersonas = await ctx.personaRepo.list({ category: 'profile', isActive: true })
      const jackPersona = allPersonas[0]

      const useCase = new SendMessageUseCase(
        ctx.messageRepo,
        ctx.personaRepo,
        ctx.aiService,
        ctx.knowledgeRepo,
        ctx.embeddingService,
      )

      return await useCase.execute({
        conversationId: input.conversationId,
        message: input.message,
        model: input.model,
        personaId: jackPersona?.id,
        useRAG: true,
      })
    }),
})
