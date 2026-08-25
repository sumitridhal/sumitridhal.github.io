import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingPixelHoverFieldPreviewProps } from '@/components/writings/WritingPixelHoverFieldPreview'

const WritingPixelHoverFieldPreview = lazy(() =>
  import('@/components/writings/WritingPixelHoverFieldPreview').then((module) => ({
    default: module.WritingPixelHoverFieldPreview,
  })),
)

export function WritingPixelHoverFieldPreviewLazy(
  props: WritingPixelHoverFieldPreviewProps,
) {
  const className = `writing-generative-play-preview writing-generative-play-preview--skeleton ${
    props.className ?? ''
  }`.trim()

  return (
    <Suspense
      fallback={
        <figure className={className} aria-busy="true">
          <figcaption className="writing-preview-controls__bar">
            <span className="writing-preview-controls__caption">
              Loading pixel hover field…
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
      <WritingPixelHoverFieldPreview {...props} />
    </Suspense>
  )
}
