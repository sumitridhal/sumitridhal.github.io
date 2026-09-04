import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingChromaticAberrationCardPreviewProps } from '@/components/writings/WritingChromaticAberrationCardPreview'

const WritingChromaticAberrationCardPreview = lazy(() =>
  import('@/components/writings/WritingChromaticAberrationCardPreview').then((module) => ({
    default: module.WritingChromaticAberrationCardPreview,
  })),
)

export function WritingChromaticAberrationCardPreviewLazy(
  props: WritingChromaticAberrationCardPreviewProps,
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
              Loading chromatic card study…
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
      <WritingChromaticAberrationCardPreview {...props} />
    </Suspense>
  )
}
