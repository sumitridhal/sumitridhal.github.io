export type NoteMeta = {
  id: string
  title: string
  /** ISO calendar date YYYY-MM-DD. */
  date: string
  category: string
  excerpt: string
  /** Include "draft" to hide a note from public listings. */
  tags: string[]
  generated: boolean
  /** Stable authoring source, for example gbrain:concepts/local-first. */
  source: string
}
