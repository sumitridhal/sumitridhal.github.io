import { lazy, Suspense } from 'react'

import type { WritingCosmosFloatPreviewProps } from '@/components/writings/WritingCosmosFloatPreview'

const WritingCosmosFloatPreview = lazy(() =>
  import('@/components/writings/WritingCosmosFloatPreview').then((m) => ({
    default: m.WritingCosmosFloatPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure
      className="writing-cosmos-float writing-cosmos-float--skeleton"
      aria-busy="true"
    >
      {caption ? (
        <figcaption className="writing-cosmos-float__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-cosmos-float__viewport writing-cosmos-float__viewport--skeleton" />
    </figure>
  )
}

export function WritingCosmosFloatPreviewLazy(props: WritingCosmosFloatPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingCosmosFloatPreview {...props} />
    </Suspense>
  )
}
