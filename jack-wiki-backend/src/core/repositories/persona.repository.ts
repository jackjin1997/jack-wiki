import type { PersonaEntity } from '../entities/persona.entity'

export interface PersonaRepository {
  findById(id: string): Promise<PersonaEntity | null>
  list(params?: { category?: string; isActive?: boolean }): Promise<PersonaEntity[]>
}
