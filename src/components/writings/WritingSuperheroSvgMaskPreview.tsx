import gsap from 'gsap'
import { useId, useLayoutEffect, useRef } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

/** Wide portraits (~1024×559); slightly taller viewBox than native ratio so `slice` centers on the figure. */
const VB_W = 360
const VB_H = 220

const CIVILIAN_SRC = '/writings/superhero-svg-mask-preview/civilian.png'
const HERO_SRC = '/writings/superhero-svg-mask-preview/hero.png'

export type WritingSuperheroSvgMaskPreviewProps = {
  caption?: string
  className?: string
  civilianSrc?: string
  heroSrc?: string
}

/**
 * Stacked civilian + hero `<image>` fills with paired sliding mask rects; feTurbulence + feDisplacementMap
 * on mask geometry only (Codrops pattern: filter on a wrapper group inside each mask).
 */
export function WritingSuperheroSvgMaskPreview({
  caption = 'Move the pointer vertically: timeline progress maps to mask rect Y and the background wash.',
  className = '',
  civilianSrc = CIVILIAN_SRC,
  heroSrc = HERO_SRC,
}: WritingSuperheroSvgMaskPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const uid = useId().replace(/:/g, '')
  const filterId = `shf-${uid}-distort`
  const maskCivilian = `shf-${uid}-m-civilian`
  const maskHero = `shf-${uid}-m-hero`
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRectRef = useRef<SVGRectElement>(null)
  const civilianRectRef = useRef<SVGRectElement>(null)
  const bgRef = useRef<SVGRectElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const heroRect = heroRectRef.current
    const civilianRect = civilianRectRef.current
    const bg = bgRef.current
    if (!root || !heroRect || !civilianRect || !bg) return

    gsap.set(heroRect, { attr: { y: -VB_H } })
    gsap.set(civilianRect, { attr: { y: 0 } })
    gsap.set(bg, { attr: { fill: '#8a9cb0' } })

    if (reduced) {
      const p = 0.45
      gsap.set(heroRect, { attr: { y: -VB_H + p * VB_H } })
      gsap.set(civilianRect, { attr: { y: p * VB_H } })
      gsap.set(bg, { attr: { fill: '#a8988a' } })
      return
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', duration: 1 } })
    tl.to(
      heroRect,
      {
        attr: { y: 0 },
      },
      0,
    )
    tl.to(
      civilianRect,
      {
        attr: { y: VB_H },
      },
      0,
    )
    tl.to(
      bg,
      {
        attr: { fill: '#e8c878' },
        duration: 0.7,
      },
      0.35,
    )

    let raf = 0
    const onPointerMove = (ev: PointerEvent) => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const rect = root.getBoundingClientRect()
        if (rect.height < 1) return
        const rel = (ev.clientY - rect.top) / rect.height
        tl.progress(Math.min(1, Math.max(0, rel)))
      })
    }

    let leaveTween: gsap.core.Tween | null = null
    const onLeave = () => {
      leaveTween?.kill()
      leaveTween = gsap.to(tl, { progress: 0, duration: 0.35, ease: 'power2.out' })
    }

    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerleave', onLeave)

    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onLeave)
      leaveTween?.kill()
      if (raf) window.cancelAnimationFrame(raf)
      tl.kill()
    }
  }, [reduced])

  return (
    <figure className={`writing-superhero-mask ${className}`.trim()}>
      {caption ? <figcaption className="writing-superhero-mask__caption">{caption}</figcaption> : null}
      <div ref={rootRef} className="writing-superhero-mask__stage" tabIndex={0}>
        <svg
          className="writing-superhero-mask__svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label="Civilian portrait crossfades to armored hero; vertical pointer position scrubs a masked transition with displacement along the seam."
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.09" numOctaves="2" result="turbulence" />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="32" />
            </filter>
            <mask id={maskCivilian} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
              <g filter={`url(#${filterId})`}>
                <rect ref={civilianRectRef} x="0" y="0" width={VB_W} height={VB_H} fill="white" />
              </g>
            </mask>
            <mask id={maskHero} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
              <g filter={`url(#${filterId})`}>
                <rect ref={heroRectRef} x="0" y={-VB_H} width={VB_W} height={VB_H} fill="white" />
              </g>
            </mask>
          </defs>

          <rect ref={bgRef} data-superhero-bg x="0" y="0" width={VB_W} height={VB_H} fill="#8a9cb0" />

          <image
            href={civilianSrc}
            x="0"
            y="0"
            width={VB_W}
            height={VB_H}
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskCivilian})`}
          />
          <image
            href={heroSrc}
            x="0"
            y="0"
            width={VB_W}
            height={VB_H}
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskHero})`}
          />
        </svg>
      </div>
    </figure>
  )
}
