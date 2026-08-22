import { lazy, Suspense } from 'react'

import type { WritingScrollSyncPreviewProps } from '@/components/writings/WritingScrollSyncPreview'

const WritingScrollSyncPreview = lazy(() =>
  import('@/components/writings/WritingScrollSyncPreview').then((module) => ({
    default: module.WritingScrollSyncPreview,
  })),
)

export function WritingScrollSyncPreviewLazy(props: WritingScrollSyncPreviewProps) {
  return (
    <Suspense
      fallback={
        <figure className="writing-generative-play-preview writing-generative-play-preview--skeleton" aria-busy="true">
          <figcaption className="writing-generative-play-preview__caption">Loading scroll-sync preview…</figcaption>
          <div className="writing-generative-play-preview__canvas-wrap" style={{ height: '304px' }}>
            <div className="writing-generative-play-preview__skeleton-panel" />
          </div>
        </figure>
      }
    >
      <WritingScrollSyncPreview {...props} />
    </Suspense>
  )
}
