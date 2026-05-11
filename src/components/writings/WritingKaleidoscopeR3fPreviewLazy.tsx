import { lazy, Suspense } from 'react'

import type { WritingKaleidoscopeR3fPreviewProps } from '@/components/writings/WritingKaleidoscopeR3fPreview'

const WritingKaleidoscopeR3fPreview = lazy(() =>
  import('@/components/writings/WritingKaleidoscopeR3fPreview').then((m) => ({
    default: m.WritingKaleidoscopeR3fPreview,
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

export function WritingKaleidoscopeR3fPreviewLazy(props: WritingKaleidoscopeR3fPreviewProps) {
  const height = props.height ?? 300
  return (
    <Suspense
      fallback={<PreviewSkeleton height={height} caption="Loading kaleidoscope preview…" />}
    >
      <WritingKaleidoscopeR3fPreview {...props} />
    </Suspense>
  )
}
