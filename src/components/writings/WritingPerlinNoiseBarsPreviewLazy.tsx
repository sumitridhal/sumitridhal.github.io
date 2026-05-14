import { lazy, Suspense } from 'react'

import type { WritingPerlinNoiseBarsPreviewProps } from '@/components/writings/WritingPerlinNoiseBarsPreview'

const WritingPerlinNoiseBarsPreview = lazy(() =>
  import('@/components/writings/WritingPerlinNoiseBarsPreview').then((m) => ({
    default: m.WritingPerlinNoiseBarsPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure className="writing-perlin-bars writing-perlin-bars--skeleton" aria-busy="true">
      {caption ? <figcaption className="writing-perlin-bars__caption">{caption}</figcaption> : null}
      <div className="writing-perlin-bars__body">
        <div className="writing-perlin-bars__stage writing-perlin-bars__stage--skeleton" />
      </div>
    </figure>
  )
}

export function WritingPerlinNoiseBarsPreviewLazy(props: WritingPerlinNoiseBarsPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingPerlinNoiseBarsPreview {...props} />
    </Suspense>
  )
}
