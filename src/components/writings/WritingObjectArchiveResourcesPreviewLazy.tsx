import { lazy, Suspense } from 'react'

const WritingObjectArchiveResourcesPreview = lazy(() =>
  import('@/components/writings/WritingObjectArchiveResourcesPreview').then((m) => ({
    default: m.WritingObjectArchiveResourcesPreview,
  })),
)

export function WritingObjectArchiveResourcesPreviewLazy() {
  return (
    <Suspense
      fallback={
        <figure className="writing-oa-res writing-oa-res--skeleton" aria-busy="true">
          <figcaption className="writing-oa-res__caption">Loading Part 5 preview…</figcaption>
          <div className="writing-oa-res__embed">
            <div className="writing-oa-res__stage">
              <div className="writing-oa-res__canvas">
                <div className="writing-oa-res__controls">
                  <div className="writing-oa-res__kicker writing-oa-res__kicker--skeleton" />
                  <div className="writing-oa-res__overlap">
                    <ul className="writing-oa-res__list">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="writing-oa-res__item">
                          <span className="writing-oa-res__skeleton-line" />
                        </li>
                      ))}
                    </ul>
                    <div className="writing-oa-res__float">
                      <div className="writing-oa-res__panel-inner">
                        <div className="writing-oa-res__portrait-col">
                          <div className="writing-oa-res__kicker-dock writing-oa-res__kicker-dock--skeleton" />
                          <div className="writing-oa-res__frame writing-oa-res__frame--skeleton" />
                          <div className="writing-oa-res__skeleton-overlay-title" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="writing-oa-res__caption-dock">
                <div className="writing-oa-res__dock-caption writing-oa-res__dock-caption--skeleton" />
              </div>
            </div>
          </div>
        </figure>
      }
    >
      <WritingObjectArchiveResourcesPreview />
    </Suspense>
  )
}
