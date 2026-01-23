'use client'

import { trpc } from '@/lib/trpc'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PersonaSelectorProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

export function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  const { data: personas } = trpc.persona.list.useQuery({ isActive: true })

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Persona:</span>
      <Select
        value={value || 'none'}
        onValueChange={val => onChange(val === 'none' ? undefined : val)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Persona</SelectItem>
          {personas?.map(persona => (
            <SelectItem key={persona.id} value={persona.id}>
              {persona.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
