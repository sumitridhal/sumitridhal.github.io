import { lazy, Suspense } from 'react'

const WritingObjectArchiveHeroRevealPreview = lazy(() =>
  import('@/components/writings/WritingObjectArchiveHeroRevealPreview').then((m) => ({
    default: m.WritingObjectArchiveHeroRevealPreview,
  })),
)

export function WritingObjectArchiveHeroRevealPreviewLazy() {
  return (
    <Suspense
      fallback={
        <figure className="writing-oa-hero writing-oa-hero--skeleton" aria-busy="true">
          <figcaption className="writing-oa-hero__caption">Loading hero preview…</figcaption>
          <div className="writing-oa-hero__stage" />
        </figure>
      }
    >
      <WritingObjectArchiveHeroRevealPreview />
    </Suspense>
  )
}
