import { lazy, Suspense } from 'react'

import type { WritingStickyGridScrollPreviewProps } from '@/components/writings/WritingStickyGridScrollPreview'

const WritingStickyGridScrollPreview = lazy(() =>
  import('@/components/writings/WritingStickyGridScrollPreview').then((m) => ({
    default: m.WritingStickyGridScrollPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-sticky-grid-preview writing-sticky-grid-preview--skeleton" aria-busy="true">
      {caption ? (
        <figcaption className="writing-sticky-grid-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-sticky-grid-preview__frame">
        <div className="writing-sticky-grid-preview__skeleton-stage" />
      </div>
    </figure>
  )
}

export function WritingStickyGridScrollPreviewLazy(props: WritingStickyGridScrollPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingStickyGridScrollPreview {...props} />
    </Suspense>
  )
}
