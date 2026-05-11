import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const TILE_COUNT = 9

/** Percent layout inside the stage (Codrops-like sparse → dense grid). */
const TILE_START: gsap.TweenVars[] = [
  { left: '10%', top: '10%', width: '16%', height: '22%', opacity: 1, scale: 1 },
  { left: '72%', top: '8%', width: '18%', height: '24%', opacity: 1, scale: 1 },
  { left: '38%', top: '68%', width: '24%', height: '20%', opacity: 1, scale: 1 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
  { left: '46%', top: '42%', width: '8%', height: '10%', opacity: 0, scale: 0.85 },
]

const TILE_END: gsap.TweenVars[] = [
  { left: '2%', top: '8%', width: '13%', height: '30%', opacity: 1, scale: 1 },
  { left: '2%', top: '68%', width: '13%', height: '24%', opacity: 1, scale: 1 },
  { left: '36%', top: '4%', width: '11%', height: '26%', opacity: 1, scale: 1 },
  { left: '50%', top: '62%', width: '30%', height: '16%', opacity: 1, scale: 1 },
  { left: '84%', top: '6%', width: '14%', height: '22%', opacity: 1, scale: 1 },
  { left: '84%', top: '38%', width: '14%', height: '28%', opacity: 1, scale: 1 },
  { left: '84%', top: '76%', width: '14%', height: '18%', opacity: 1, scale: 1 },
  { left: '16%', top: '44%', width: '14%', height: '18%', opacity: 1, scale: 1 },
  { left: '70%', top: '34%', width: '16%', height: '20%', opacity: 1, scale: 1 },
]

export type WritingStickyGridScrollPreviewProps = {
  caption?: string
  className?: string
}

function applyEndState(
  tiles: HTMLElement[],
  topbar: HTMLElement | null,
  foot: HTMLElement | null,
  subtitle: HTMLElement | null,
  cta: HTMLElement | null,
  title: HTMLElement | null,
) {
  tiles.forEach((t, i) => {
    gsap.set(t, { ...TILE_END[i], clearProps: 'transform' })
  })
  gsap.set([topbar, foot], { opacity: 1, y: 0, clearProps: 'transform' })
  gsap.set([subtitle, cta], { opacity: 1, y: 0, clearProps: 'transform' })
  gsap.set(title, { scale: 1, y: 0, clearProps: 'transform' })
}

function applyStartState(
  tiles: HTMLElement[],
  topbar: HTMLElement | null,
  foot: HTMLElement | null,
  subtitle: HTMLElement | null,
  cta: HTMLElement | null,
  title: HTMLElement | null,
) {
  tiles.forEach((t, i) => {
    gsap.set(t, { ...TILE_START[i], transformOrigin: '50% 50%' })
  })
  gsap.set([topbar, foot], { opacity: 0, y: -6 })
  gsap.set([subtitle, cta], { opacity: 0, y: 12 })
  gsap.set(title, { scale: 1.06, y: 4, transformOrigin: '50% 50%' })
}

export function WritingStickyGridScrollPreview({
  caption = 'Mini Codrops-style stage: sparse tiles → denser grid + chrome. One played timeline (article uses scroll scrub).',
  className = '',
}: WritingStickyGridScrollPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const topbarRef = useRef<HTMLDivElement>(null)
  const footRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const tiles = Array.from(stage.querySelectorAll<HTMLElement>('[data-sticky-grid-tile]'))
    const topbar = topbarRef.current
    const foot = footRef.current
    const subtitle = subtitleRef.current
    const cta = ctaRef.current
    const title = titleRef.current

    if (tiles.length !== TILE_COUNT) return
    if (!topbar || !foot || !subtitle || !cta || !title) return

    if (reduced) {
      tlRef.current = null
      applyEndState(tiles, topbar, foot, subtitle, cta, title)
      return
    }

    applyStartState(tiles, topbar, foot, subtitle, cta, title)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          setIsPlaying(false)
          setHasPlayed(true)
        },
      })

      tlRef.current = tl

      tiles.forEach((tile, i) => {
        tl.fromTo(
          tile,
          { ...TILE_START[i] },
          { ...TILE_END[i], duration: i < 3 ? 0.85 : 0.95, ease: 'power2.inOut' },
          0.12 + i * 0.06,
        )
      })

      tl.fromTo(title, { scale: 1.06, y: 4 }, { scale: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.32)
      tl.fromTo(subtitle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55 }, 0.52)
      tl.fromTo(cta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 }, 0.62)
      tl.fromTo(topbar, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.48 }, 0.68)
      tl.fromTo(foot, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.48 }, 0.76)
    }, stage)

    return () => {
      tlRef.current = null
      ctx.revert()
    }
  }, [reduced])

  const play = () => {
    if (reduced) return
    const tl = tlRef.current
    const stage = stageRef.current
    if (!tl || !stage || tl.isActive()) return
    const tiles = Array.from(stage.querySelectorAll<HTMLElement>('[data-sticky-grid-tile]'))
    applyStartState(tiles, topbarRef.current, footRef.current, subtitleRef.current, ctaRef.current, titleRef.current)
    setIsPlaying(true)
    tl.restart()
  }

  const tileNodes = Array.from({ length: TILE_COUNT }, (_, i) => (
    <div
      key={i}
      data-sticky-grid-tile
      className={`writing-sticky-grid-preview__tile writing-sticky-grid-preview__tile--p${i % 3}`}
      aria-hidden
    />
  ))

  return (
    <figure className={`writing-sticky-grid-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-sticky-grid-preview__caption">{caption}</figcaption> : null}
      <div className="writing-sticky-grid-preview__body">
        <div className="writing-sticky-grid-preview__controls">
          <p className="writing-sticky-grid-preview__hint">
            Runs a short GSAP timeline.
          </p>
          <button
            type="button"
            className="writing-sticky-grid-preview__play"
            disabled={reduced || isPlaying}
            aria-busy={isPlaying}
            aria-disabled={reduced}
            title={reduced ? 'Animation disabled when reduced motion is requested' : undefined}
            onClick={play}
          >
            {hasPlayed && !isPlaying ? 'Replay sequence' : 'Play sequence'}
          </button>
        </div>
      </div>
      <div className="writing-sticky-grid-preview__frame">
        <div ref={stageRef} className="writing-sticky-grid-preview__stage">
          <div ref={topbarRef} className="writing-sticky-grid-preview__topbar">
            <span className="writing-sticky-grid-preview__nav">
              Home · About · Work · Writings · Experiments
            </span>
            <span className="writing-sticky-grid-preview__promo">sumitridhal.github.io →</span>
          </div>

          <div className="writing-sticky-grid-preview__tiles" aria-hidden>
            {tileNodes}
          </div>

          <div className="writing-sticky-grid-preview__hero">
            <h3 ref={titleRef} className="writing-sticky-grid-preview__title">
              Sticky Grid Scroll
            </h3>
            <p ref={subtitleRef} className="writing-sticky-grid-preview__subtitle">
              Sticky grid + phased motion — layout notes (not scroll-scrubbed here).
            </p>
            <span ref={ctaRef} className="writing-sticky-grid-preview__cta">
              Read the Codrops tutorial
            </span>
          </div>

          <div ref={footRef} className="writing-sticky-grid-preview__foot">
            <span className="writing-sticky-grid-preview__tags">#writing #ui #gsap</span>
            <span className="writing-sticky-grid-preview__by">Sumit Ridhal</span>
          </div>
        </div>
      </div>
    </figure>
  )
}
