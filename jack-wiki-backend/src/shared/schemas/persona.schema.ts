import { z } from 'zod'

export const listPersonasSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const getPersonaSchema = z.object({
  id: z.string().uuid(),
})

export type ListPersonasInput = z.infer<typeof listPersonasSchema>
export type GetPersonaInput = z.infer<typeof getPersonaSchema>
