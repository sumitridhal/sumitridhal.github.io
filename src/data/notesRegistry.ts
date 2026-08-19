import type { ComponentType } from 'react'

import type { NoteMeta } from '@/data/noteTypes'

type NoteModule = {
  noteMeta: NoteMeta
  default: ComponentType
}

const modules = import.meta.glob<NoteModule>('../content/notes/*.mdx', {
  eager: true,
})

export type NoteEntry = {
  meta: NoteMeta
  Body: ComponentType
}

function loadEntries(): NoteEntry[] {
  return Object.values(modules)
    .map((module) => ({
      meta: module.noteMeta,
      Body: module.default,
    }))
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date))
}

const entries = loadEntries()

export function isNoteDraft(meta: NoteMeta): boolean {
  return meta.tags.includes('draft')
}

export const notes: NoteMeta[] = entries
  .filter((entry) => !isNoteDraft(entry.meta))
  .map((entry) => entry.meta)

const entriesBySlug = new Map(entries.map((entry) => [entry.meta.id, entry]))

export function getNoteEntryBySlug(slug: string | undefined): NoteEntry | undefined {
  if (!slug) return undefined
  return entriesBySlug.get(slug)
}
