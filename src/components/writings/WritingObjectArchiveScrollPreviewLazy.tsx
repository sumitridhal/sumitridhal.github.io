import { lazy, Suspense } from 'react'

const WritingObjectArchiveScrollPreview = lazy(() =>
  import('@/components/writings/WritingObjectArchiveScrollPreview').then((m) => ({
    default: m.WritingObjectArchiveScrollPreview,
  })),
)

export function WritingObjectArchiveScrollPreviewLazy() {
  return (
    <Suspense
      fallback={
        <figure className="writing-oa-scroll writing-oa-scroll--skeleton" aria-busy="true">
          <figcaption className="writing-oa-scroll__caption">Loading scroll-strip preview…</figcaption>
          <div className="writing-oa-scroll__stage">
            <div className="writing-oa-scroll__intro writing-oa-scroll__intro--skeleton">
              <div className="writing-oa-scroll__skeleton-line writing-oa-scroll__skeleton-line--wide" />
              <div className="writing-oa-scroll__skeleton-line" />
              <div className="writing-oa-scroll__skeleton-pill" />
            </div>
            <div className="writing-oa-scroll__viewport writing-oa-scroll__viewport--skeleton">
              <div className="writing-oa-scroll__skeleton-tiles">
                <div className="writing-oa-scroll__skeleton-tile" />
                <div className="writing-oa-scroll__skeleton-tile" />
                <div className="writing-oa-scroll__skeleton-tile" />
              </div>
            </div>
          </div>
        </figure>
      }
    >
      <WritingObjectArchiveScrollPreview />
    </Suspense>
  )
}
