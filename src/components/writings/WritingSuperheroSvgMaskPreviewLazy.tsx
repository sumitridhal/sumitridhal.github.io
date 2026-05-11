import { lazy, Suspense } from 'react'

import type { WritingSuperheroSvgMaskPreviewProps } from '@/components/writings/WritingSuperheroSvgMaskPreview'

const WritingSuperheroSvgMaskPreview = lazy(() =>
  import('@/components/writings/WritingSuperheroSvgMaskPreview').then((m) => ({
    default: m.WritingSuperheroSvgMaskPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-superhero-mask writing-superhero-mask--skeleton" aria-busy="true">
      {caption ? <figcaption className="writing-superhero-mask__caption">{caption}</figcaption> : null}
      <div className="writing-superhero-mask__stage writing-superhero-mask__stage--skeleton">
        <div className="writing-superhero-mask__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingSuperheroSvgMaskPreviewLazy(props: WritingSuperheroSvgMaskPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingSuperheroSvgMaskPreview {...props} />
    </Suspense>
  )
}
