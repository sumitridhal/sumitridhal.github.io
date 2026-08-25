import { lazy, Suspense } from 'react'

import type { WritingFractalGlassPreviewProps } from '@/components/writings/WritingFractalGlassPreview'

const WritingFractalGlassPreview = lazy(() =>
  import('@/components/writings/WritingFractalGlassPreview').then((module) => ({
    default: module.WritingFractalGlassPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure
      className="writing-generative-play-preview writing-generative-play-preview--skeleton"
      aria-busy="true"
    >
      <figcaption className="writing-generative-play-preview__caption">
        Loading fractal glass…
      </figcaption>
      <div
        className="writing-generative-play-preview__canvas-wrap"
        style={{ height: `${height}px` }}
      >
        <div className="writing-generative-play-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingFractalGlassPreviewLazy(props: WritingFractalGlassPreviewProps) {
  const height = props.height ?? 520
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingFractalGlassPreview {...props} />
    </Suspense>
  )
}
