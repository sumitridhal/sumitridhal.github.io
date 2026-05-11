import { lazy, Suspense } from 'react'

import type { WritingTerrainR3fPreviewProps } from '@/components/writings/WritingTerrainR3fPreview'

const WritingTerrainR3fPreview = lazy(() =>
  import('@/components/writings/WritingTerrainR3fPreview').then((m) => ({
    default: m.WritingTerrainR3fPreview,
  })),
)

function PreviewSkeleton({ height, caption }: { height: number; caption?: string }) {
  return (
    <figure className="writing-generative-play-preview writing-generative-play-preview--skeleton" aria-busy="true">
      {caption ? (
        <figcaption className="writing-generative-play-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <div className="writing-generative-play-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingTerrainR3fPreviewLazy(props: WritingTerrainR3fPreviewProps) {
  const height = props.height ?? 300
  return (
    <Suspense
      fallback={<PreviewSkeleton height={height} caption="Loading terrain preview…" />}
    >
      <WritingTerrainR3fPreview {...props} />
    </Suspense>
  )
}
