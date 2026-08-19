/** Gallery figure on a case-study page (hero is `coverSrc`). */
export type WorkGalleryItem = {
  src: string
  alt: string
  width?: number
  height?: number
}

/**
 * Frontmatter-like export from each `src/content/work/*.mdx` module.
 * Keep this the single source of truth for MDX case studies on `/work/:slug`.
 */
export type WorkMeta = {
  /** URL slug — must match the MDX filename stem and `/work/:slug`. */
  id: string
  title: string
  /** One-line summary for cards and page tagline. */
  tagline: string
  category: string
  role: string
  /** Display year or year range, e.g. `2026`. */
  year: string
  /** Human-readable stack line for the meta row. */
  stack: string
  /** Structured tags (also rendered under Tech stack when present). */
  techStack?: string[]
  coverSrc: string
  /** Key into `image-dimensions.json` / `lqip-data.json`. */
  imageKey: string
  /** Lower lists earlier among MDX case studies. */
  order?: number
  demoUrl?: string
  repoPath?: string
  highlights?: string[]
  gallery?: WorkGalleryItem[]
}
