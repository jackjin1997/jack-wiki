import { router, procedure } from '../procedures'
import { listPersonasSchema, getPersonaSchema } from '@/shared/schemas/persona.schema'
import { NotFoundError } from '@/shared/errors/base.error'

export const personaRouter = router({
  list: procedure.input(listPersonasSchema).query(async ({ input, ctx }) => {
    return await ctx.personaRepo.list(input)
  }),

  get: procedure.input(getPersonaSchema).query(async ({ input, ctx }) => {
    const persona = await ctx.personaRepo.findById(input.id)
    if (!persona) {
      throw new NotFoundError('Persona not found')
    }
    return persona
  }),
})
