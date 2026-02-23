import { ExternalLink } from 'lucide-react'
import { SkillBadge } from './skill-badge'

interface Project {
  name: string
  desc: string
  tech: readonly string[]
  url?: string
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{project.name}</h3>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{project.desc}</p>
      <SkillBadge skills={project.tech} />
    </div>
  )
}
