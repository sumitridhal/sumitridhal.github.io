import { lazy, Suspense, type ReactNode } from 'react'

import type { WritingVibeBookshelfPreviewProps } from '@/components/writings/WritingVibeBookshelfPreview'

const WritingVibeBookshelfPreview = lazy(() =>
  import('@/components/writings/WritingVibeBookshelfPreview').then((m) => ({
    default: m.WritingVibeBookshelfPreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: ReactNode }) {
  return (
    <figure
      className="writing-vibe-bookshelf-preview writing-vibe-bookshelf-preview--skeleton"
      aria-busy="true"
    >
      {caption != null ? (
        <figcaption className="writing-vibe-bookshelf-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-vibe-bookshelf-preview__frame writing-vibe-bookshelf-preview__frame--skeleton">
        <div className="writing-vibe-bookshelf-preview__panel writing-vibe-bookshelf-preview__panel--skeleton">
          <div className="writing-vibe-bookshelf-preview__skeleton-title" />
          <div className="writing-vibe-bookshelf-preview__skeleton-shelf">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} className="writing-vibe-bookshelf-preview__skeleton-spine" />
            ))}
          </div>
        </div>
      </div>
    </figure>
  )
}

export function WritingVibeBookshelfPreviewLazy(props: WritingVibeBookshelfPreviewProps) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingVibeBookshelfPreview {...props} />
    </Suspense>
  )
}
