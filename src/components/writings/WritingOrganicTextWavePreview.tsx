import { useCallback, useEffect, useRef } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

/** Filler editorial copy (unrelated to the film demo)—short lines for narrow rails. */
const RAIL_PARAGRAPHS = [
  'A comfortable measure is roughly sixty to seventy characters per line; much longer and the eye tires tracking back to the next row.',
  'Margins do quiet work: they separate the text block from chrome, give gestures a safe edge on phones, and frame the column like matting on a print.',
  'Serif body copy still reads well on screens when size and contrast are generous; the old “serifs blur” rule mattered more on coarse LCDs.',
  'Hyphenation at narrow widths avoids rivers of white space, but too many breaks can make proper nouns harder to scan—tune language and CSS together.',
  'When motion is only decoration, keep amplitude small and respect reduced motion so the words stay the hero.',
]

const PHASE = 0.0003

function renderStrip(keyPrefix: string, isDuplicate: boolean) {
  return (
    <div
      className="writing-organic-wave__strip"
      data-organic-wave-strip
      aria-hidden={isDuplicate ? true : undefined}
    >
      <article className="writing-organic-wave__copy">
        {RAIL_PARAGRAPHS.map((text, i) => (
          <p key={`${keyPrefix}-${isDuplicate ? 'b' : 'a'}-${i}`}>{text}</p>
        ))}
      </article>
    </div>
  )
}

export type WritingOrganicTextWavePreviewProps = {
  caption?: string
  className?: string
  /** Max horizontal nudge in px. */
  amplitudePx?: number
  /** Vertical drift speed (pixels per second) for both rails. */
  autoScrollPxPerSec?: number
}

export function WritingOrganicTextWavePreview({
  caption = 'Two rails: left translates up, right down; sin vs cos on translateX.',
  className = '',
  amplitudePx = 12,
  autoScrollPxPerSec = 22,
}: WritingOrganicTextWavePreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const leftTrackRef = useRef<HTMLDivElement>(null)
  const rightTrackRef = useRef<HTMLDivElement>(null)
  const leftRailRef = useRef<HTMLDivElement>(null)
  const rightRailRef = useRef<HTMLDivElement>(null)

  const leftYRef = useRef(0)
  const rightYRef = useRef(0)
  const leftHRef = useRef(1)
  const rightHRef = useRef(1)
  const lastTsRef = useRef(0)
  const rafRef = useRef(0)

  const measureStrips = useCallback(() => {
    const lt = leftTrackRef.current
    const rt = rightTrackRef.current
    const lFirst = lt?.querySelector<HTMLElement>('[data-organic-wave-strip]')
    const rFirst = rt?.querySelector<HTMLElement>('[data-organic-wave-strip]')
    if (lFirst && lFirst.offsetHeight > 0) leftHRef.current = lFirst.offsetHeight
    if (rFirst && rFirst.offsetHeight > 0) rightHRef.current = rFirst.offsetHeight

    const lh = leftHRef.current
    const rh = rightHRef.current
    if (lh > 0) {
      while (leftYRef.current <= -lh) leftYRef.current += lh
      while (leftYRef.current > 0) leftYRef.current -= lh
    }
    if (rh > 0) {
      while (rightYRef.current >= rh) rightYRef.current -= rh
      while (rightYRef.current < 0) rightYRef.current += rh
    }
  }, [])

  const applyWave = useCallback(
    (now: number) => {
      if (reduced) return
      const vh = window.innerHeight || 1
      const timePhase = now * PHASE

      const wave = (root: HTMLElement | null, kind: 'sin' | 'cos') => {
        if (!root) return
        root.querySelectorAll<HTMLElement>('.writing-organic-wave__copy p').forEach((el) => {
          const r = el.getBoundingClientRect()
          const p = Math.min(1, Math.max(0, (r.top + r.height * 0.5) / vh))
          const w =
            kind === 'sin'
              ? Math.sin(p * Math.PI + timePhase)
              : Math.cos(p * Math.PI + timePhase)
          const x = w * amplitudePx
          el.style.transform = `translate3d(${x}px,0,0)`
        })
      }

      wave(leftRailRef.current, 'sin')
      wave(rightRailRef.current, 'cos')
    },
    [reduced, amplitudePx],
  )

  const clearWave = useCallback(() => {
    ;[leftRailRef.current, rightRailRef.current].forEach((rail) => {
      rail?.querySelectorAll<HTMLElement>('.writing-organic-wave__copy p').forEach((el) => {
        el.style.transform = ''
      })
    })
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced) {
      leftTrackRef.current?.style.removeProperty('transform')
      rightTrackRef.current?.style.removeProperty('transform')
      clearWave()
      return
    }

    measureStrips()

    const step = (now: number) => {
      const last = lastTsRef.current
      lastTsRef.current = now
      const dt = last === 0 ? 0 : Math.min(48, now - last)
      const speed = (autoScrollPxPerSec * dt) / 1000

      const lh = leftHRef.current
      if (lh > 1 && dt > 0) {
        leftYRef.current -= speed
        while (leftYRef.current <= -lh) leftYRef.current += lh
      }

      const rh = rightHRef.current
      if (rh > 1 && dt > 0) {
        rightYRef.current += speed
        while (rightYRef.current >= rh) rightYRef.current -= rh
      }

      const lt = leftTrackRef.current
      const rt = rightTrackRef.current
      if (lt) lt.style.transform = `translate3d(0,${leftYRef.current}px,0)`
      if (rt) rt.style.transform = `translate3d(0,${rightYRef.current}px,0)`

      applyWave(now)
      rafRef.current = requestAnimationFrame(step)
    }

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      lastTsRef.current = 0
    }

    const start = () => {
      stop()
      lastTsRef.current = 0
      rafRef.current = requestAnimationFrame(step)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)

    const ro = new ResizeObserver(() => {
      measureStrips()
    })
    ro.observe(stage)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      stop()
      leftTrackRef.current?.style.removeProperty('transform')
      rightTrackRef.current?.style.removeProperty('transform')
      clearWave()
    }
  }, [reduced, applyWave, autoScrollPxPerSec, clearWave, measureStrips])

  return (
    <figure className={`writing-organic-wave ${className}`.trim()}>
      {caption ? <figcaption className="writing-organic-wave__caption">{caption}</figcaption> : null}
      <div className="writing-organic-wave__body">
        <div ref={stageRef} className="writing-organic-wave__stage">
          <div ref={leftRailRef} className="writing-organic-wave__rail writing-organic-wave__rail--left">
            <div ref={leftTrackRef} className="writing-organic-wave__track">
              {renderStrip('L', false)}
              {renderStrip('L', true)}
            </div>
          </div>

          <div ref={rightRailRef} className="writing-organic-wave__rail writing-organic-wave__rail--right">
            <div ref={rightTrackRef} className="writing-organic-wave__track">
              {renderStrip('R', false)}
              {renderStrip('R', true)}
            </div>
          </div>
        </div>
        <p className="writing-organic-wave__hint">
          Two columns of filler copy about typography and layout; reduced motion freezes both axes.
        </p>
      </div>
    </figure>
  )
}
