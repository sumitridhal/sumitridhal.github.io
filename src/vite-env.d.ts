/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { NoteMeta } from '@/data/noteTypes'
  import type { WorkMeta } from '@/data/workTypes'
  import type { WritingMeta } from '@/data/writingTypes'

  /** Present on `src/content/notes/*.mdx`. */
  export const noteMeta: NoteMeta
  /** Present on `src/content/writings/*.mdx`. */
  export const writingMeta: WritingMeta
  /** Present on `src/content/work/*.mdx`. */
  export const workMeta: WorkMeta
  const MDXComponent: ComponentType
  export default MDXComponent
}

declare module '*.vert?raw' {
  const source: string
  export default source
}

declare module '*.frag?raw' {
  const source: string
  export default source
}
