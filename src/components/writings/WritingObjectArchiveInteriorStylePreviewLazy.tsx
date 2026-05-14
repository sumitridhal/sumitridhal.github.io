import { lazy, Suspense } from 'react'

const WritingObjectArchiveInteriorStylePreview = lazy(() =>
  import('@/components/writings/WritingObjectArchiveInteriorStylePreview').then((m) => ({
    default: m.WritingObjectArchiveInteriorStylePreview,
  })),
)

export function WritingObjectArchiveInteriorStylePreviewLazy() {
  return (
    <Suspense
      fallback={
        <figure className="writing-oa-style writing-oa-style--skeleton" aria-busy="true">
          <figcaption className="writing-oa-style__caption">Loading Part 4 preview…</figcaption>
          <div className="writing-oa-style__embed">
            <div className="writing-oa-style__stage">
              <div className="writing-oa-style__kicker writing-oa-style__kicker--skeleton" />
              <div className="writing-oa-style__row">
                <ul className="writing-oa-style__list">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="writing-oa-style__item">
                      <span className="writing-oa-style__skeleton-line" />
                    </li>
                  ))}
                </ul>
                <div className="writing-oa-style__panel">
                  <div className="writing-oa-style__panel-inner">
                    <div className="writing-oa-style__frame writing-oa-style__frame--skeleton" />
                    <div className="writing-oa-style__skeleton-caption" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </figure>
      }
    >
      <WritingObjectArchiveInteriorStylePreview />
    </Suspense>
  )
}
