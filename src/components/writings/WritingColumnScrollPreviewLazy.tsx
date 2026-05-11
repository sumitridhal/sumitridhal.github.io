import { lazy, Suspense } from 'react'

import type { WritingColumnScrollPreviewProps } from '@/components/writings/WritingColumnScrollPreview'

const WritingColumnScrollPreview = lazy(() =>
  import('@/components/writings/WritingColumnScrollPreview').then((m) => ({
    default: m.WritingColumnScrollPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure
      className="writing-column-scroll-preview writing-column-scroll-preview--skeleton"
      aria-busy="true"
    >
      {caption ? (
        <figcaption className="writing-column-scroll-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-column-scroll-preview__shell">
        <div className="writing-column-scroll-preview__skeleton-chrome" aria-hidden="true" />
        <div className="writing-column-scroll-preview__stage">
          <div className="writing-column-scroll-preview__viewport writing-column-scroll-preview__viewport--skeleton">
            <div className="writing-column-scroll-preview__skeleton-panel" />
          </div>
        </div>
      </div>
    </figure>
  )
}

export function WritingColumnScrollPreviewLazy(props: WritingColumnScrollPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingColumnScrollPreview {...props} />
    </Suspense>
  )
}
