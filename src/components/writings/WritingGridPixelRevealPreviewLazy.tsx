import { lazy, Suspense } from 'react'

import type { WritingGridPixelRevealPreviewProps } from '@/components/writings/WritingGridPixelRevealPreview'

const WritingGridPixelRevealPreview = lazy(() =>
  import('@/components/writings/WritingGridPixelRevealPreview').then((m) => ({
    default: m.WritingGridPixelRevealPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-grid-pixel-reveal writing-grid-pixel-reveal--skeleton" aria-busy="true">
      {caption ? <figcaption className="writing-grid-pixel-reveal__caption">{caption}</figcaption> : null}
      <div
        className="writing-grid-pixel-reveal__body"
        style={{ position: 'relative', minHeight: '12rem' }}
      >
        <div className="writing-grid-pixel-reveal__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingGridPixelRevealPreviewLazy(props: WritingGridPixelRevealPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingGridPixelRevealPreview {...props} />
    </Suspense>
  )
}
