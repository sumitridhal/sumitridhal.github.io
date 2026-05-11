import { lazy, Suspense } from 'react'

import type { WritingGsapHorizontalMarqueePreviewProps } from '@/components/writings/WritingGsapHorizontalMarqueePreview'

const WritingGsapHorizontalMarqueePreview = lazy(() =>
  import('@/components/writings/WritingGsapHorizontalMarqueePreview').then((m) => ({
    default: m.WritingGsapHorizontalMarqueePreview,
  })),
)

function PreviewSkeleton({ caption }: { caption?: string }) {
  return (
    <figure
      className="writing-gsap-marquee-preview writing-gsap-marquee-preview--skeleton"
      aria-busy="true"
    >
      {caption ? (
        <figcaption className="writing-gsap-marquee-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-gsap-marquee-preview__banner writing-gsap-marquee-preview__banner--skeleton">
        <div className="writing-gsap-marquee-preview__skeleton-row" />
        <div className="writing-gsap-marquee-preview__skeleton-row" />
        <div className="writing-gsap-marquee-preview__skeleton-row" />
      </div>
    </figure>
  )
}

export function WritingGsapHorizontalMarqueePreviewLazy(
  props: WritingGsapHorizontalMarqueePreviewProps,
) {
  return (
    <Suspense fallback={<PreviewSkeleton caption="Loading interactive preview…" />}>
      <WritingGsapHorizontalMarqueePreview {...props} />
    </Suspense>
  )
}
