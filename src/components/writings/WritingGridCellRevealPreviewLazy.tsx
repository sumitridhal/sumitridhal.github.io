import { lazy, Suspense } from 'react'

import type { WritingGridCellRevealPreviewProps } from '@/components/writings/WritingGridCellRevealPreview'

const WritingGridCellRevealPreview = lazy(() =>
  import('@/components/writings/WritingGridCellRevealPreview').then((module) => ({
    default: module.WritingGridCellRevealPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure className="writing-generative-play-preview writing-generative-play-preview--skeleton" aria-busy="true">
      <figcaption className="writing-generative-play-preview__caption">Loading GPU grid reveal…</figcaption>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <div className="writing-generative-play-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingGridCellRevealPreviewLazy(props: WritingGridCellRevealPreviewProps) {
  const height = props.height ?? 560
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingGridCellRevealPreview {...props} />
    </Suspense>
  )
}
