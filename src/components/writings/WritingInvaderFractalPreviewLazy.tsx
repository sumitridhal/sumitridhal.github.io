import { lazy, Suspense } from 'react'

import type { WritingInvaderFractalPreviewProps } from '@/components/writings/WritingInvaderFractalPreview'

const WritingInvaderFractalPreview = lazy(() =>
  import('@/components/writings/WritingInvaderFractalPreview').then((m) => ({
    default: m.WritingInvaderFractalPreview,
  })),
)

function Skeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-invader-fractal-preview writing-invader-fractal-preview--skeleton" aria-busy="true">
      {caption ? (
        <figcaption className="writing-invader-fractal-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-invader-fractal-preview__skeleton-bar" />
    </figure>
  )
}

export function WritingInvaderFractalPreviewLazy(props: WritingInvaderFractalPreviewProps) {
  return (
    <Suspense fallback={<Skeleton caption="Loading invader preview…" />}>
      <WritingInvaderFractalPreview {...props} />
    </Suspense>
  )
}
