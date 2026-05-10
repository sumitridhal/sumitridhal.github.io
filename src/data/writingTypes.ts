/** CSS-only thumbnails for the writing article figure grid. */
export type WritingFigureVariant =
  | 'grain'
  | 'cloud'
  | 'flow'
  | 'branch'
  | 'grad'
  | 'glow'
  | 'warp'
  | 'mesh'

/** Gallery list, footer teaser, and article chrome (body is MDX default export). */
export type WritingMeta = {
  id: string
  title: string
  date: string
  category: string
  /** Lower index = newer (matches historical ordering). */
  order: number
  /** Teaser text for footer and cards; usually derived from the opening paragraph. */
  excerpt: string
  coverSrc?: string
  titleLines?: string[]
  asideParagraphs?: string[]
  figureRows?: WritingFigureVariant[][]
}
