/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType, ReactNode } from 'react'
  import type { WritingMeta, WritingPreviewStep } from '@/data/writingTypes'

  /** Present on `src/content/writings/*.mdx`. */
  export const writingMeta: WritingMeta
  /** Pinned artifact for the article's preview pane; omit for text-only posts. */
  export const preview: ReactNode | undefined
  /** Ordered demos swapped into the preview pane as their prose cues pass. */
  export const previewSteps: WritingPreviewStep[] | undefined
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
