import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingMaskedNoiseWarpPreviewProps } from '@/components/writings/WritingMaskedNoiseWarpPreview'

const WritingMaskedNoiseWarpPreview = lazy(() =>
  import('@/components/writings/WritingMaskedNoiseWarpPreview').then((module) => ({
    default: module.WritingMaskedNoiseWarpPreview,
  })),
)

function PreviewSkeleton({ height }: { height: number }) {
  return (
    <figure
      className="writing-generative-play-preview writing-generative-play-preview--skeleton"
      aria-busy="true"
    >
      <figcaption className="writing-preview-controls__bar">
        <span className="writing-preview-controls__caption">Loading masked noise warp…</span>
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

export function WritingMaskedNoiseWarpPreviewLazy(
  props: WritingMaskedNoiseWarpPreviewProps,
) {
  const height = props.height ?? 580
  return (
    <Suspense fallback={<PreviewSkeleton height={height} />}>
      <WritingMaskedNoiseWarpPreview {...props} />
    </Suspense>
  )
}
