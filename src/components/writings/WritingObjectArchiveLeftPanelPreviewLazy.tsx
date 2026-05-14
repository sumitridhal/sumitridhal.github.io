import { lazy, Suspense } from 'react'

const WritingObjectArchiveLeftPanelPreview = lazy(() =>
  import('@/components/writings/WritingObjectArchiveLeftPanelPreview').then((m) => ({
    default: m.WritingObjectArchiveLeftPanelPreview,
  })),
)

export function WritingObjectArchiveLeftPanelPreviewLazy() {
  return (
    <Suspense
      fallback={
        <figure className="writing-oa-left-panel writing-oa-left-panel--skeleton" aria-busy="true">
          <figcaption className="writing-oa-left-panel__caption">Loading left-panel preview…</figcaption>
          <div className="writing-oa-left-panel__stage">
            <div className="writing-oa-left-panel__split">
              <div className="writing-oa-left-panel__skeleton-half" />
              <div className="writing-oa-left-panel__skeleton-half" />
            </div>
          </div>
        </figure>
      }
    >
      <WritingObjectArchiveLeftPanelPreview />
    </Suspense>
  )
}
