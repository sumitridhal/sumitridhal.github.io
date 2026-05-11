import { lazy, Suspense } from 'react'

import type { WritingOrganicTextWavePreviewProps } from '@/components/writings/WritingOrganicTextWavePreview'

const WritingOrganicTextWavePreview = lazy(() =>
  import('@/components/writings/WritingOrganicTextWavePreview').then((m) => ({
    default: m.WritingOrganicTextWavePreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-organic-wave writing-organic-wave--skeleton" aria-busy="true">
      {caption ? <figcaption className="writing-organic-wave__caption">{caption}</figcaption> : null}
      <div className="writing-organic-wave__body">
        <div className="writing-organic-wave__stage writing-organic-wave__stage--skeleton">
          <div className="writing-organic-wave__skeleton-cell writing-organic-wave__skeleton-cell--left" />
          <div className="writing-organic-wave__skeleton-cell writing-organic-wave__skeleton-cell--right" />
        </div>
      </div>
    </figure>
  )
}

export function WritingOrganicTextWavePreviewLazy(props: WritingOrganicTextWavePreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingOrganicTextWavePreview {...props} />
    </Suspense>
  )
}
