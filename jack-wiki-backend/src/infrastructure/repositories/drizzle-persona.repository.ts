import type { DbClient } from '../database/client'
import type { PersonaRepository } from '@/core/repositories/persona.repository'
import type { PersonaEntity } from '@/core/entities/persona.entity'
import { personas } from '../database/schema'
import { eq, and } from 'drizzle-orm'

export class DrizzlePersonaRepository implements PersonaRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<PersonaEntity | null> {
    const [persona] = await this.db.select().from(personas).where(eq(personas.id, id)).limit(1)

    return persona ? this.mapToEntity(persona) : null
  }

  async list(params?: { category?: string; isActive?: boolean }): Promise<PersonaEntity[]> {
    const conditions = []

    if (params?.category) {
      conditions.push(eq(personas.category, params.category))
    }
    if (params?.isActive !== undefined) {
      conditions.push(eq(personas.isActive, params.isActive))
    }

    const query = this.db.select().from(personas)

    if (conditions.length > 0) {
      query.where(and(...conditions))
    }

    const results = await query

    return results.map(p => this.mapToEntity(p))
  }

  private mapToEntity(row: any): PersonaEntity {
    return {
      id: row.id,
      name: row.name,
      nameEn: row.nameEn,
      description: row.description,
      systemPrompt: row.systemPrompt,
      avatar: row.avatar,
      category: row.category,
      isActive: row.isActive,
      createdAt: row.createdAt,
    }
  }
}
