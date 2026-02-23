import { Badge } from '@/components/ui/badge'

interface SkillBadgeProps {
  skills: readonly string[]
}

export function SkillBadge({ skills }: SkillBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map(skill => (
        <Badge key={skill} variant="outline" className="text-xs font-normal">
          {skill}
        </Badge>
      ))}
    </div>
  )
}
