import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingCssHolographicMaskPreviewProps } from '@/components/writings/WritingCssHolographicMaskPreview'

const WritingCssHolographicMaskPreview = lazy(() =>
  import('@/components/writings/WritingCssHolographicMaskPreview').then((module) => ({
    default: module.WritingCssHolographicMaskPreview,
  })),
)

export function WritingCssHolographicMaskPreviewLazy(
  props: WritingCssHolographicMaskPreviewProps,
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
              Loading CSS holographic mask study…
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
      <WritingCssHolographicMaskPreview {...props} />
    </Suspense>
  )
}
