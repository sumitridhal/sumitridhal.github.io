import { lazy, Suspense } from 'react'

import type { WritingGlassRefractionPreviewProps } from '@/components/writings/WritingGlassRefractionPreview'

const WritingGlassRefractionPreview = lazy(() =>
  import('@/components/writings/WritingGlassRefractionPreview').then((module) => ({
    default: module.WritingGlassRefractionPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure className="writing-generative-play-preview writing-generative-play-preview--skeleton" aria-busy="true">
      <figcaption className="writing-generative-play-preview__caption">Loading glass refraction preview…</figcaption>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <div className="writing-generative-play-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingGlassRefractionPreviewLazy(props: WritingGlassRefractionPreviewProps) {
  const height = props.height ?? 330
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingGlassRefractionPreview {...props} />
    </Suspense>
  )
}
