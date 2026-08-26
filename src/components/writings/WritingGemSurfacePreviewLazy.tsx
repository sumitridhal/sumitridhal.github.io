import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingGemSurfacePreviewProps } from '@/components/writings/WritingGemSurfacePreview'

const WritingGemSurfacePreview = lazy(() =>
  import('@/components/writings/WritingGemSurfacePreview').then((module) => ({
    default: module.WritingGemSurfacePreview,
  })),
)

export function WritingGemSurfacePreviewLazy(props: WritingGemSurfacePreviewProps) {
  const className = `writing-generative-play-preview writing-generative-play-preview--skeleton ${
    props.className ?? ''
  }`.trim()

  return (
    <Suspense
      fallback={
        <figure className={className} aria-busy="true">
          <figcaption className="writing-preview-controls__bar">
            <span className="writing-preview-controls__caption">
              Loading gem surface study…
            </span>
          </figcaption>
          <div
            className="writing-generative-play-preview__canvas-wrap"
            style={{ '--preview-h': `${props.height ?? 560}px` } as CSSProperties}
          >
            <div className="writing-generative-play-preview__skeleton-panel" />
          </div>
        </figure>
      }
    >
      <WritingGemSurfacePreview {...props} />
    </Suspense>
  )
}
