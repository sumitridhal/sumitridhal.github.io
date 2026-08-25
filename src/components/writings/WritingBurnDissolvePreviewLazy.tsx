import { lazy, Suspense, type CSSProperties } from 'react'

import type { WritingBurnDissolvePreviewProps } from '@/components/writings/WritingBurnDissolvePreview'

const WritingBurnDissolvePreview = lazy(() =>
  import('@/components/writings/WritingBurnDissolvePreview').then((module) => ({
    default: module.WritingBurnDissolvePreview,
  })),
)

function PreviewSkeleton({ height, className }: { height: number; className?: string }) {
  return (
    <figure
      className={`writing-generative-play-preview writing-generative-play-preview--skeleton ${className ?? ''}`.trim()}
      aria-busy="true"
    >
      <figcaption className="writing-preview-controls__bar">
        <span className="writing-preview-controls__caption">Loading burn/dissolve study…</span>
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

export function WritingBurnDissolvePreviewLazy(
  props: WritingBurnDissolvePreviewProps,
) {
  const height = props.height ?? 520
  return (
    <Suspense fallback={<PreviewSkeleton height={height} className={props.className} />}>
      <WritingBurnDissolvePreview {...props} />
    </Suspense>
  )
}
