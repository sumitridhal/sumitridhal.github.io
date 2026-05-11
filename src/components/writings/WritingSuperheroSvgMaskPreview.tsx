import gsap from 'gsap'
import { useId, useLayoutEffect, useRef } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const VB_W = 200
const VB_H = 280

export type WritingSuperheroSvgMaskPreviewProps = {
  caption?: string
  className?: string
}

/**
 * Inline “wanted poster” stack: two fills swap behind a frame while mask rects
 * slide in lockstep; feTurbulence + feDisplacementMap live on mask geometry only
 * (Codrops pattern: filter on a wrapper group inside each mask, not on the portraits alone).
 */
export function WritingSuperheroSvgMaskPreview({
  caption = 'Move the pointer vertically: timeline progress maps to mask rect Y and a poster wash.',
  className = '',
}: WritingSuperheroSvgMaskPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const uid = useId().replace(/:/g, '')
  const filterId = `shf-${uid}-distort`
  const maskBlue = `shf-${uid}-m-blue`
  const maskWarm = `shf-${uid}-m-warm`
  const rootRef = useRef<HTMLDivElement>(null)
  const blueRectRef = useRef<SVGRectElement>(null)
  const warmRectRef = useRef<SVGRectElement>(null)
  const bgRef = useRef<SVGRectElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const blueRect = blueRectRef.current
    const warmRect = warmRectRef.current
    const bg = bgRef.current
    if (!root || !blueRect || !warmRect || !bg) return

    gsap.set(blueRect, { attr: { y: -VB_H } })
    gsap.set(warmRect, { attr: { y: 0 } })
    gsap.set(bg, { attr: { fill: '#4a5eb2' } })

    if (reduced) {
      const p = 0.45
      gsap.set(blueRect, { attr: { y: -VB_H + p * VB_H } })
      gsap.set(warmRect, { attr: { y: p * VB_H } })
      gsap.set(bg, { attr: { fill: '#6d62a4' } })
      return
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', duration: 1 } })
    tl.to(
      blueRect,
      {
        attr: { y: 0 },
      },
      0,
    )
    tl.to(
      warmRect,
      {
        attr: { y: VB_H },
      },
      0,
    )
    tl.to(
      bg,
      {
        attr: { fill: '#ffd11b' },
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
          aria-label="Two-tone figure behind a poster frame; vertical pointer position scrubs a mask transition."
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.09" numOctaves="2" result="turbulence" />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="32" />
            </filter>
            <linearGradient id={`shf-${uid}-g-warm`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f4d9c8" />
              <stop offset="55%" stopColor="#e8b89a" />
              <stop offset="100%" stopColor="#c97d62" />
            </linearGradient>
            <radialGradient id={`shf-${uid}-g-blue`} cx="45%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#7ec8ff" />
              <stop offset="45%" stopColor="#3d6fb8" />
              <stop offset="100%" stopColor="#1a2f66" />
            </radialGradient>
            <mask id={maskBlue} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
              <g filter={`url(#${filterId})`}>
                <rect ref={blueRectRef} x="0" y={-VB_H} width={VB_W} height={VB_H} fill="white" />
              </g>
            </mask>
            <mask id={maskWarm} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
              <g filter={`url(#${filterId})`}>
                <rect ref={warmRectRef} x="0" y="0" width={VB_W} height={VB_H} fill="white" />
              </g>
            </mask>
          </defs>

          <rect ref={bgRef} data-superhero-bg x="0" y="0" width={VB_W} height={VB_H} fill="#4a5eb2" />

          <rect x="0" y="0" width={VB_W} height={VB_H} fill="#2a1f3d" opacity="0.92" />
          <circle
            cx="102"
            cy="118"
            r="86"
            fill={`url(#shf-${uid}-g-warm)`}
            mask={`url(#${maskWarm})`}
          />
          <ellipse
            cx="98"
            cy="124"
            rx="72"
            ry="96"
            fill={`url(#shf-${uid}-g-blue)`}
            mask={`url(#${maskBlue})`}
          />

          <g opacity="0.97">
            <rect x="12" y="18" width="176" height="244" fill="none" stroke="#f2e6c8" strokeWidth="2.2" rx="2" />
            <line x1="22" y1="210" x2="178" y2="210" stroke="#f2e6c8" strokeWidth="1" opacity="0.55" />
            <text x="100" y="44" textAnchor="middle" fill="#f2e6c8" fontSize="11" fontFamily="Georgia, serif" letterSpacing="0.18em">
              HAVE YOU SEEN
            </text>
            <text x="100" y="238" textAnchor="middle" fill="#f2e6c8" fontSize="9" fontFamily="Georgia, serif" letterSpacing="0.12em" opacity="0.85">
              CODROPS MASK LAB
            </text>
          </g>
        </svg>
        <p className="writing-superhero-mask__hint">Pointer Y scrubs the mask pair; leaving the frame eases back.</p>
      </div>
    </figure>
  )
}
