import { lazy, Suspense } from 'react'

import type { WritingInfiniteCanvasPreviewProps } from '@/components/writings/WritingInfiniteCanvasPreview'

const WritingInfiniteCanvasPreview = lazy(() =>
  import('@/components/writings/WritingInfiniteCanvasPreview').then((m) => ({
    default: m.WritingInfiniteCanvasPreview,
  })),
)

function PreviewSkeleton({ height, caption }: { height: number; caption?: string }) {
  return (
    <figure className="writing-infinite-canvas-preview writing-infinite-canvas-preview--skeleton" aria-busy="true">
      {caption ? (
        <figcaption className="writing-infinite-canvas-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-infinite-canvas-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <div className="writing-infinite-canvas-preview__skeleton-panel" />
      </div>
    </figure>
  )
}

export function WritingInfiniteCanvasPreviewLazy(props: WritingInfiniteCanvasPreviewProps) {
  const height = props.height ?? 300
  return (
    <Suspense
      fallback={
        <PreviewSkeleton height={height} caption="Loading interactive preview…" />
      }
    >
      <WritingInfiniteCanvasPreview {...props} />
    </Suspense>
  )
}
