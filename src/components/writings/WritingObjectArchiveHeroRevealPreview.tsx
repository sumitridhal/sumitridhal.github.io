import { useCallback, useEffect, useState } from 'react'

import {
  OA_HERO_IMG_LEFT as IMG_LEFT,
  OA_HERO_IMG_RIGHT as IMG_RIGHT,
  OA_HERO_LOGO_SVG as LOGO_SVG,
} from '@/components/writings/writingObjectArchiveHeroCdn'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

type Phase = 'initial' | 'lifting' | 'open'

export function WritingObjectArchiveHeroRevealPreview() {
  const reduced = useWritingPreviewReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduced ? 'open' : 'initial')

  useEffect(() => {
    if (reduced) return
    const id = window.requestAnimationFrame(() => setPhase('lifting'))
    return () => window.cancelAnimationFrame(id)
  }, [reduced])

  const onCurtainEnd = useCallback(() => {
    setPhase((p) => (p === 'lifting' ? 'open' : p))
  }, [])

  const replay = useCallback(() => {
    if (reduced) return
    setPhase('initial')
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setPhase('lifting'))
    })
  }, [reduced])

  const curtainClass =
    'writing-oa-hero__curtain' +
    (phase === 'lifting' ? ' is-lifting' : '') +
    (phase === 'open' ? ' is-open' : '')

  return (
    <figure
      className={`writing-oa-hero${reduced ? ' writing-oa-hero--reduced' : ''}`}
      aria-label="Tween concept Part 1: curtain translateY off split hero; wordmark fixed in overlay stack"
    >
      <figcaption className="writing-oa-hero__caption">
        **Tween sheet — Part 1:** CSS keyframes move the curtain from closed → open over the split CDN diptych; the wordmark
        stays in the overlay stack (no separate position tween in this embed).
      </figcaption>

      <div className="writing-oa-hero__stage">
        <div className="writing-oa-hero__split" aria-hidden="true">
          <div className="writing-oa-hero__half writing-oa-hero__half--left">
            <img src={IMG_LEFT} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="writing-oa-hero__half writing-oa-hero__half--right">
            <img src={IMG_RIGHT} alt="" loading="lazy" decoding="async" />
          </div>
        </div>

        <div
          className={curtainClass}
          onAnimationEnd={onCurtainEnd}
          aria-hidden="true"
        />

        <div className="writing-oa-hero__logo">
          <span className="writing-oa-hero__logo-scrim" aria-hidden="true" />
          <img src={LOGO_SVG} alt="Object & Archive" loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="writing-oa-hero__controls">
        <button type="button" className="writing-oa-hero__replay" onClick={replay} disabled={reduced}>
          Replay intro
        </button>
      </div>
    </figure>
  )
}
