import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingSlashFlipbookPreviewProps } from '@/components/writings/WritingSlashFlipbookPreview'

const WritingSlashFlipbookPreview = lazy(() =>
  import('@/components/writings/WritingSlashFlipbookPreview').then((module) => ({
    default: module.WritingSlashFlipbookPreview,
  })),
)

export function WritingSlashFlipbookPreviewLazy(props: WritingSlashFlipbookPreviewProps) {
  const className = `writing-generative-play-preview writing-generative-play-preview--skeleton ${
    props.className ?? ''
  }`.trim()

  return (
    <Suspense
      fallback={
        <figure className={className} aria-busy="true">
          <figcaption className="writing-preview-controls__bar">
            <span className="writing-preview-controls__caption">
              Loading slash flipbook study…
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
      <WritingSlashFlipbookPreview {...props} />
    </Suspense>
  )
}
