import type { WritingMeta } from '@/data/writingTypes'
import { getWritingEntryBySlug } from '@/data/writingsRegistry'

export type { WritingFigureVariant, WritingMeta } from '@/data/writingTypes'

/** @deprecated Use `WritingMeta`; kept for gradual refactors. */
export type WritingItem = WritingMeta

export { writings, getWritingEntryBySlug, type WritingEntry } from '@/data/writingsRegistry'

export function getWritingBySlug(slug: string | undefined): WritingMeta | undefined {
  return getWritingEntryBySlug(slug)?.meta
}

export function titleLinesForWriting(item: WritingMeta): string[] {
  const lines = item.titleLines
  if (lines && lines.length > 0) return lines
  return [writingTitle(item)]
}

export function asideParagraphsForWriting(item: WritingMeta): string[] {
  return item.asideParagraphs ?? []
}

export function writingTitle(item: WritingMeta): string {
  return item.title
}

export function excerptFromWriting(item: WritingMeta): string {
  return item.excerpt
}
