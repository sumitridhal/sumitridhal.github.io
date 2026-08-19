import type { ComponentType } from 'react'

import type { WorkMeta } from '@/data/workTypes'

type WorkModule = {
  workMeta: WorkMeta
  default: ComponentType
}

const modules = import.meta.glob<WorkModule>('../content/work/*.mdx', {
  eager: true,
})

export type WorkEntry = {
  meta: WorkMeta
  Body: ComponentType
}

function loadEntries(): WorkEntry[] {
  return Object.values(modules)
    .map((mod) => ({
      meta: mod.workMeta,
      Body: mod.default,
    }))
    .sort((a, b) => {
      const ao = a.meta.order ?? 100
      const bo = b.meta.order ?? 100
      if (ao !== bo) return ao - bo
      return a.meta.title.localeCompare(b.meta.title)
    })
}

const entries = loadEntries()

export const workEntries: WorkEntry[] = entries

const bySlug = new Map(entries.map((e) => [e.meta.id, e]))

export function getWorkEntryBySlug(slug: string | undefined): WorkEntry | undefined {
  if (!slug) return undefined
  return bySlug.get(slug)
}
