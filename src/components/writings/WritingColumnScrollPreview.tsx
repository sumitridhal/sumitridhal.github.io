import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

/** Codrops ColumnScroll demo assets (same repo as the article). */
const COLUMN_SCROLL_IMG_BASE =
  'https://raw.githubusercontent.com/codrops/ColumnScroll/main/src/img/'

/**
 * ColumnScroll repo has 1.jpg … 24.jpg. Outer tiles are 3:2 vs center 4:3; ~15 outers vs 12 centers
 * matches stack height (row height = max column), so rails are not short with empty band below.
 */
const LEFT_IMG_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8] as const
const CENTER_IMG_IDS = [9, 10, 11, 12, 13, 14, 15, 16, 10, 11, 12, 13, 14] as const
const RIGHT_IMG_IDS = [16, 17, 18, 19, 20, 21, 22, 23, 24, 18, 19, 20, 21, 22, 23, 24] as const

/**
 * Locomotive applies scroll on a transformed root, so `translateY(scrollTop)` on outers reads as shear.
 * Inside a native overflow scroller, `translateY(scrollTop)` ~cancels scroll for those children (outers look
 * frozen). Use 2× so net motion is opposite the center column, matching “outer strips move the other way.”
 */
const OUTER_PARALLAX_FACTOR = 2

/** Tweak: added to outer column `translateY` (px). Positive moves rails down, negative up. */
export const WRITING_COLUMN_SCROLL_OUTER_BIAS_PX = -800

/** Tweak: fixed `translateY` on the center column (px). Positive moves stack down, negative up. */
export const WRITING_COLUMN_SCROLL_CENTER_BIAS_PX = 0

/** Tweak: max height of the scroll viewport in rem (visible vertical band for the demo). */
export const WRITING_COLUMN_SCROLL_VIEWPORT_MAX_REM = 22

const DEMO_MS = 4600
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * Parallax: translateY(base + 2×scrollY). `base` used to center shear in the scroll trip; its magnitude must
 * stay within what the outer stack can cover — using full `maxScroll` (row-driven) can shift outers farther
 * than their column height and leaves a black band under the rails at scroll 0.
 */
function outerTranslateY(scrollY: number, maxScroll: number, outerStackHeight: number) {
  if (maxScroll <= 0) return OUTER_PARALLAX_FACTOR * scrollY
  const stack = outerStackHeight > 0 ? outerStackHeight : maxScroll
  const coupling = Math.min(maxScroll, Math.max(1, stack * 0.52))
  const base = -0.5 * OUTER_PARALLAX_FACTOR * coupling
  return base + OUTER_PARALLAX_FACTOR * scrollY
}

function applyOuterParallax(els: HTMLElement[], y: number, reduced: boolean, maxScroll: number) {
  if (reduced) {
    els.forEach((el) => {
      el.style.transform = ''
      el.style.willChange = 'auto'
    })
    return
  }
  const outerH = els[0]?.scrollHeight ?? 0
  const ty = Math.round(outerTranslateY(y, maxScroll, outerH)) + WRITING_COLUMN_SCROLL_OUTER_BIAS_PX
  const t = `translate3d(0, ${ty}px, 0)`
  els.forEach((el) => {
    el.style.willChange = 'transform'
    el.style.transform = t
  })
}

export type WritingColumnScrollPreviewProps = {
  caption?: string
  className?: string
}

export function WritingColumnScrollPreview({
  caption = 'Native overflow: center scroll vs outer rails at 2× translateY — Play demo or wheel. ColumnScroll repo photos.',
  className = '',
}: WritingColumnScrollPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const playingRef = useRef(false)
  const rafRef = useRef(0)
  const maxScrollRef = useRef(0)

  const [scrollY, setScrollY] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playedOnce, setPlayedOnce] = useState(false)

  const stopAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    playingRef.current = false
    setPlaying(false)
  }, [])

  const syncParallax = useCallback(
    (y: number) => {
      const left = leftRef.current
      const center = centerRef.current
      const right = rightRef.current
      if (!left || !right) return
      applyOuterParallax([left, right], y, reduced, maxScrollRef.current)
      if (center) {
        if (reduced) {
          center.style.transform = ''
          center.style.willChange = 'auto'
        } else {
          center.style.willChange = 'transform'
          center.style.transform = `translate3d(0, ${WRITING_COLUMN_SCROLL_CENTER_BIAS_PX}px, 0)`
        }
      }
    },
    [reduced],
  )

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const row = rowRef.current
    const left = leftRef.current
    const center = centerRef.current
    const right = rightRef.current
    if (!viewport || !left || !right) return

    const outerEls = [left, right]

    const measureMax = () => {
      stopAnimation()
      const m = Math.max(0, Math.round(viewport.scrollHeight - viewport.clientHeight))
      maxScrollRef.current = m
      setMaxScroll(m)
      const top = viewport.scrollTop
      const clamped = Math.min(top, m)
      if (clamped !== top) viewport.scrollTop = clamped
      setScrollY(clamped)
      syncParallax(clamped)
    }

    syncParallax(viewport.scrollTop)

    const onScroll = () => {
      if (playingRef.current) return
      const y = viewport.scrollTop
      setScrollY(y)
      syncParallax(y)
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const ro = new ResizeObserver(() => {
      measureMax()
    })
    ro.observe(viewport)
    if (row) ro.observe(row)

    measureMax()

    return () => {
      stopAnimation()
      viewport.removeEventListener('scroll', onScroll)
      ro.disconnect()
      outerEls.forEach((el) => {
        el.style.transform = ''
        el.style.willChange = 'auto'
      })
      if (center) {
        center.style.transform = ''
        center.style.willChange = 'auto'
      }
    }
  }, [reduced, stopAnimation, syncParallax])

  const scrollable = maxScroll > 0
  const reducedSnapHigh = reduced && scrollable && scrollY > maxScroll * 0.5

  const runPlayDemo = () => {
    const viewport = viewportRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!viewport || !left || !right || !scrollable) return

    if (reduced) {
      const target = reducedSnapHigh ? 0 : maxScroll
      viewport.scrollTop = target
      setScrollY(target)
      syncParallax(target)
      setPlayedOnce(true)
      return
    }

    stopAnimation()
    playingRef.current = true
    setPlaying(true)

    const m = maxScrollRef.current
    const t0 = performance.now()

    const tick = (now: number) => {
      const elapsed = now - t0
      if (elapsed >= DEMO_MS) {
        viewport.scrollTop = 0
        setScrollY(0)
        syncParallax(0)
        playingRef.current = false
        setPlaying(false)
        setPlayedOnce(true)
        rafRef.current = 0
        return
      }
      const half = DEMO_MS / 2
      let y: number
      if (elapsed < half) {
        y = easeInOutCubic(elapsed / half) * m
      } else {
        y = (1 - easeInOutCubic((elapsed - half) / half)) * m
      }
      y = Math.round(Math.min(m, Math.max(0, y)))
      viewport.scrollTop = y
      syncParallax(y)
      setScrollY(y)
      rafRef.current = requestAnimationFrame(tick)
    }

    viewport.scrollTop = 0
    setScrollY(0)
    syncParallax(0)
    rafRef.current = requestAnimationFrame(tick)
  }

  const playLabel = reduced
    ? reducedSnapHigh
      ? 'Reset view'
      : 'Show offset'
    : playing
      ? 'Playing…'
      : playedOnce
        ? 'Replay'
        : 'Play demo'

  const cardRow = (prefix: string, ids: readonly number[]) =>
    ids.map((imgId, i) => (
      <div key={`${prefix}-${i}`} className="writing-column-scroll-preview__card">
        <img
          className="writing-column-scroll-preview__img"
          src={`${COLUMN_SCROLL_IMG_BASE}${imgId}.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    ))

  return (
    <figure className={`writing-column-scroll-preview ${className}`.trim()}>
      {caption ? (
        <figcaption className="writing-column-scroll-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-column-scroll-preview__shell">
        <div className="writing-column-scroll-preview__chrome">
          <p className="writing-column-scroll-preview__lede">
            <span className="writing-column-scroll-preview__lede-tag">Native scroll</span>
            <span className="writing-column-scroll-preview__lede-copy">
              Outer columns parallax at 2×; center stays the anchor.
            </span>
          </p>
          <button
            type="button"
            className="writing-column-scroll-preview__play"
            disabled={!scrollable || playing}
            onClick={runPlayDemo}
          >
            {playLabel}
          </button>
        </div>

        <div className="writing-column-scroll-preview__stage">
          <div className="writing-column-scroll-preview__rails" aria-hidden="true">
            <span className="writing-column-scroll-preview__rail">Outer</span>
            <span className="writing-column-scroll-preview__rail writing-column-scroll-preview__rail--center">
              Center
            </span>
            <span className="writing-column-scroll-preview__rail">Outer</span>
          </div>
          <div
            ref={viewportRef}
            className="writing-column-scroll-preview__viewport"
            tabIndex={0}
            style={{ maxHeight: `${WRITING_COLUMN_SCROLL_VIEWPORT_MAX_REM}rem` }}
          >
            <div ref={rowRef} className="writing-column-scroll-preview__row">
              <div
                ref={leftRef}
                className="writing-column-scroll-preview__col writing-column-scroll-preview__col--outer"
              >
                {cardRow('l', LEFT_IMG_IDS)}
              </div>
              <div
                ref={centerRef}
                className="writing-column-scroll-preview__col writing-column-scroll-preview__col--center"
              >
                {cardRow('c', CENTER_IMG_IDS)}
              </div>
              <div
                ref={rightRef}
                className="writing-column-scroll-preview__col writing-column-scroll-preview__col--outer"
              >
                {cardRow('r', RIGHT_IMG_IDS)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}
