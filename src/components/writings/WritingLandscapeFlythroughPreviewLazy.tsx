import { lazy, Suspense } from 'react'

import type { WritingLandscapeFlythroughPreviewProps } from '@/components/writings/WritingLandscapeFlythroughPreview'

const WritingLandscapeFlythroughPreview = lazy(() =>
  import('@/components/writings/WritingLandscapeFlythroughPreview').then((m) => ({
    default: m.WritingLandscapeFlythroughPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure
      className="writing-landscape-flythrough writing-landscape-flythrough--skeleton"
      aria-busy="true"
    >
      {caption ? (
        <figcaption className="writing-landscape-flythrough__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-landscape-flythrough__embed">
        <div className="writing-landscape-flythrough__skeleton-stage" />
      </div>
    </figure>
  )
}

export function WritingLandscapeFlythroughPreviewLazy(props: WritingLandscapeFlythroughPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading fly-through preview…" />}>
      <WritingLandscapeFlythroughPreview {...props} />
    </Suspense>
  )
}
