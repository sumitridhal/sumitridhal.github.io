import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingFisheyeImagePreviewProps } from '@/components/writings/WritingFisheyeImagePreview'

const WritingFisheyeImagePreview = lazy(() =>
  import('@/components/writings/WritingFisheyeImagePreview').then((module) => ({
    default: module.WritingFisheyeImagePreview,
  })),
)

export function WritingFisheyeImagePreviewLazy(props: WritingFisheyeImagePreviewProps) {
  const className = `writing-generative-play-preview writing-generative-play-preview--skeleton ${
    props.className ?? ''
  }`.trim()

  return (
    <Suspense
      fallback={
        <figure className={className} aria-busy="true">
          <figcaption className="writing-preview-controls__bar">
            <span className="writing-preview-controls__caption">
              Loading fisheye image study…
            </span>
          </figcaption>
          <div
            className="writing-generative-play-preview__canvas-wrap"
            style={{ '--preview-h': `${props.height ?? 600}px` } as CSSProperties}
          >
            <div className="writing-generative-play-preview__skeleton-panel" />
          </div>
        </figure>
      }
    >
      <WritingFisheyeImagePreview {...props} />
    </Suspense>
  )
}
