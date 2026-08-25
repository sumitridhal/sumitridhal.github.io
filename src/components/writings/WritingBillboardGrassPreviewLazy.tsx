import { lazy, Suspense } from 'react'

import type { WritingBillboardGrassPreviewProps } from '@/components/writings/WritingBillboardGrassPreview'

const WritingBillboardGrassPreview = lazy(() =>
  import('@/components/writings/WritingBillboardGrassPreview').then((module) => ({
    default: module.WritingBillboardGrassPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure
      className="writing-generative-play-preview writing-generative-play-preview--skeleton"
      aria-busy="true"
    >
      <figcaption className="writing-generative-play-preview__caption">
        Loading billboard grass field…
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

export function WritingBillboardGrassPreviewLazy(props: WritingBillboardGrassPreviewProps) {
  const height = props.height ?? 560
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingBillboardGrassPreview {...props} />
    </Suspense>
  )
}
