import type { ComponentType } from 'react'

import type { WritingMeta } from '@/data/writingTypes'

type WritingModule = {
  writingMeta: WritingMeta
  default: ComponentType
}

const modules = import.meta.glob<WritingModule>('../content/writings/*.mdx', {
  eager: true,
})

export type WritingEntry = {
  meta: WritingMeta
  Body: ComponentType
}

function loadEntries(): WritingEntry[] {
  return Object.values(modules)
    .map((mod) => ({
      meta: mod.writingMeta,
      Body: mod.default,
    }))
    .sort((a, b) => a.meta.order - b.meta.order)
}

const entries = loadEntries()

export const writingEntries: WritingEntry[] = entries

export const writings: WritingMeta[] = entries.map((e) => e.meta)

const bySlug = new Map(entries.map((e) => [e.meta.id, e]))

export function getWritingEntryBySlug(slug: string | undefined): WritingEntry | undefined {
  if (!slug) return undefined
  return bySlug.get(slug)
}
