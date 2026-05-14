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
  /** ISO calendar date `YYYY-MM-DD` (primary reference publish date, or site/git proxy). */
  date: string
  category: string
  /** Tie-break when two posts share the same `date`; lower lists first. */
  order: number
  /** Teaser text for footer and cards; usually derived from the opening paragraph. */
  excerpt: string
  coverSrc?: string
  /** When set, site footer uses this image instead of `coverSrc` (e.g. portrait poster). */
  footerCoverSrc?: string
  /** Prefer this post in the site footer “latest” slot over sort order. */
  pinInFooter?: boolean
  titleLines?: string[]
  asideParagraphs?: string[]
  figureRows?: WritingFigureVariant[][]
}
