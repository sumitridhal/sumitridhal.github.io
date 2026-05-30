import { lazy, Suspense } from 'react'

import type { WritingBentoCardsPreviewProps } from '@/components/writings/WritingBentoCardsPreview'

const WritingBentoCardsPreview = lazy(() =>
  import('@/components/writings/WritingBentoCardsPreview').then((m) => ({
    default: m.WritingBentoCardsPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-bento-preview writing-bento-preview--skeleton" aria-busy="true">
      {caption ? <figcaption className="writing-bento-preview__caption">{caption}</figcaption> : null}
      <div className="writing-bento-preview__frame">
        <div className="writing-bento-preview__skeleton-phone" />
      </div>
    </figure>
  )
}

export function WritingBentoCardsPreviewLazy(props: WritingBentoCardsPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading bento preview…" />}>
      <WritingBentoCardsPreview {...props} />
    </Suspense>
  )
}
