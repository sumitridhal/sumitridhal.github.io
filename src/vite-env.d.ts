/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { WritingMeta } from '@/data/writingTypes'

  export const writingMeta: WritingMeta
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
