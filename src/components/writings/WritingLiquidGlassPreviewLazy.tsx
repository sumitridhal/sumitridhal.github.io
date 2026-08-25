import { lazy, Suspense } from 'react'

import type { WritingLiquidGlassPreviewProps } from '@/components/writings/WritingLiquidGlassPreview'

const WritingLiquidGlassPreview = lazy(() =>
  import('@/components/writings/WritingLiquidGlassPreview').then((module) => ({
    default: module.WritingLiquidGlassPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure
      className="writing-generative-play-preview writing-generative-play-preview--skeleton"
      aria-busy="true"
    >
      <figcaption className="writing-generative-play-preview__caption">
        Loading liquid glass…
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

export function WritingLiquidGlassPreviewLazy(props: WritingLiquidGlassPreviewProps) {
  const height = props.height ?? 560
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingLiquidGlassPreview {...props} />
    </Suspense>
  )
}
