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
          <figcaption className="writing-oa-scroll__caption">Loading Part 3 preview…</figcaption>
          <div className="writing-oa-scroll__embed">
            <div className="writing-oa-scroll__shell">
              <div className="writing-oa-scroll__track">
                <div className="writing-oa-scroll__hero-slot">
                  <div className="writing-oa-scroll__hero-static writing-oa-scroll__hero-static--skeleton" aria-hidden="true">
                    <div className="writing-oa-scroll__skeleton-hero-split">
                      <div className="writing-oa-scroll__skeleton-hero-half" />
                      <div className="writing-oa-scroll__skeleton-hero-half" />
                    </div>
                  </div>
                </div>
                <div className="writing-oa-scroll__obsessions-raise">
                  <div className="writing-oa-scroll__obsessions-inner">
                    <div className="writing-oa-scroll__obsessions">
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
                  </div>
                </div>
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
