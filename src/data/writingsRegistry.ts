import type { ComponentType, ReactNode } from 'react'

import type { WritingMeta, WritingPreviewStep } from '@/data/writingTypes'

type WritingModule = {
  writingMeta: WritingMeta
  preview?: ReactNode
  previewSteps?: WritingPreviewStep[]
  default: ComponentType
}

const modules = import.meta.glob<WritingModule>('../content/writings/*.mdx', {
  eager: true,
})

export type WritingEntry = {
  meta: WritingMeta
  /** Rendered in the article preview pane; absent when the post has no demo. */
  preview?: ReactNode
  previewSteps?: WritingPreviewStep[]
  Body: ComponentType
}

function loadEntries(): WritingEntry[] {
  return Object.values(modules)
    .map((mod) => ({
      meta: mod.writingMeta,
      preview: mod.preview,
      previewSteps: mod.previewSteps,
      Body: mod.default,
    }))
    .sort((a, b) => {
      const byDate = b.meta.date.localeCompare(a.meta.date)
      if (byDate !== 0) return byDate
      return a.meta.order - b.meta.order
    })
}

const entries = loadEntries()

export const writingEntries: WritingEntry[] = entries

export function isWritingDraft(meta: WritingMeta): boolean {
  return meta.keywords?.includes('draft') ?? false
}

function currentUtcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isWritingScheduled(
  meta: WritingMeta,
  today = currentUtcDate(),
): boolean {
  return meta.date > today
}

const releasedEntries = entries.filter((entry) => !isWritingScheduled(entry.meta))

export const writings: WritingMeta[] = releasedEntries
  .filter((e) => !isWritingDraft(e.meta))
  .map((e) => e.meta)

const bySlug = new Map(releasedEntries.map((e) => [e.meta.id, e]))

export function getWritingEntryBySlug(slug: string | undefined): WritingEntry | undefined {
  if (!slug) return undefined
  return bySlug.get(slug)
}
