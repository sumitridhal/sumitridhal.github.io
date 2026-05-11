import { lazy, Suspense } from 'react'

import type { WritingMotionPathTilesPreviewProps } from '@/components/writings/WritingMotionPathTilesPreview'

const WritingMotionPathTilesPreview = lazy(() =>
  import('@/components/writings/WritingMotionPathTilesPreview').then((m) => ({
    default: m.WritingMotionPathTilesPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure
      className="writing-motion-path-tiles-preview writing-motion-path-tiles-preview--skeleton"
      aria-busy="true"
    >
      {caption ? (
        <figcaption className="writing-motion-path-tiles-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-motion-path-tiles-preview__stage writing-motion-path-tiles-preview__stage--skeleton">
        <div className="writing-motion-path-tiles-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingMotionPathTilesPreviewLazy(props: WritingMotionPathTilesPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingMotionPathTilesPreview {...props} />
    </Suspense>
  )
}
