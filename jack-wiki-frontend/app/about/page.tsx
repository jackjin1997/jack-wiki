'use client'

import { trpc } from '@/lib/trpc'
import { AIChatWidget } from '@/components/profile/ai-chat-widget'
import { SkillBadge } from '@/components/profile/skill-badge'
import { ProjectCard } from '@/components/profile/project-card'
import { Button } from '@/components/ui/button'
import { Github, Mail, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const { data: profile } = trpc.profile.getProfile.useQuery()

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">Jack Wiki</span>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            AI 对话
          </Button>
        </Link>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

        {/* Left column */}
        <div className="space-y-12">

          {/* Hero */}
          <section className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl select-none">
                👨‍💻
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {profile?.name}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {profile?.nameZh}
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{profile?.title}</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
              {profile?.bio}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {profile?.github && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" asChild>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </Button>
              )}
              {profile?.email && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" asChild>
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              技术技能
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {profile && Object.entries(profile.skills).map(([category, skills]) => (
                <div key={category} className="space-y-2">
                  <p className="text-xs font-medium text-foreground">{category}</p>
                  <SkillBadge skills={skills} />
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              项目经历
            </h2>
            <div className="space-y-3">
              {profile?.projects.map(p => (
                <ProjectCard key={p.name} project={p} />
              ))}
            </div>
          </section>

        </div>

        {/* Right column — sticky sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-[60px] lg:self-start">
          <AIChatWidget />
        </aside>

      </main>
    </div>
  )
}
