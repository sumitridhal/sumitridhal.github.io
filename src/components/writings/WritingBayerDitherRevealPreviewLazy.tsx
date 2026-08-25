import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingBayerDitherRevealPreviewProps } from '@/components/writings/WritingBayerDitherRevealPreview'

const WritingBayerDitherRevealPreview = lazy(() =>
  import('@/components/writings/WritingBayerDitherRevealPreview').then((module) => ({
    default: module.WritingBayerDitherRevealPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure
      className="writing-generative-play-preview writing-generative-play-preview--bayer writing-generative-play-preview--skeleton"
      aria-busy="true"
    >
      <figcaption className="writing-preview-controls__bar">
        <span className="writing-preview-controls__caption">Loading Bayer dither reveal…</span>
      </figcaption>
      <div
        className="writing-generative-play-preview__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
      >
        <div className="writing-generative-play-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingBayerDitherRevealPreviewLazy(
  props: WritingBayerDitherRevealPreviewProps,
) {
  const height = props.height ?? 640
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingBayerDitherRevealPreview {...props} />
    </Suspense>
  )
}
