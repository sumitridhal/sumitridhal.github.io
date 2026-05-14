import gsap from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const LEFT_SLIDES = [
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/Etudedeforet.jpg?v=1775498766&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/PaleFacewithRedHair.jpg?v=1775094104&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/Amphitriteetchevauxmarins.jpg?v=1773609935&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/Ascending-moon.jpg?v=1776038634&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/DerBeginndesAufruhrs_BeginningoftheRevolt.jpg?v=1774187155&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/ElevenNudes_circa1910_3d3714b8-f780-4c74-b6d9-a08c0130dd7c.jpg?v=1777133390&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/FloreSousMarine.jpg?v=1774273439&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/JardinauBorddelaSeine.png?v=1775995528&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/LandschaftmitBaumenimVordergrund.jpg?v=1774273500&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/Lime_1959.jpg?v=1774786837&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/nocturne.jpg?v=1773609725&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/Ceylon_Adam_sPeaklandscape.FromthejourneytoIndia_1907.jpg?v=1775092958&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/UntitledVI.jpg?v=1777215321&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/Nudes_1915-1918.jpg?v=1777215750&width=800',
  },
  {
    bg: 'https://objectandarchive.com/cdn/shop/files/Flowers_1915.jpg?v=1777216101&width=800',
    mid: 'https://objectandarchive.com/cdn/shop/files/L_Atelier_rouge__par_Henri_Matisse.jpg?v=1777216463&width=800',
  },
] as const

/** One continuous column: each slide contributes bg then mid (16 plates). */
const LEFT_STACK_URLS = LEFT_SLIDES.flatMap((s) => [s.bg, s.mid])

const RIGHT_DECOR =
  'https://objectandarchive.com/cdn/shop/files/monet_detail.png?v=1777132945&width=800'

const DURATION = 0.58
const EASE = 'power2.inOut'

/** Back stack: already revealed layers sit at this zoom. */
const BIG_SCALE = 2.7754
/** Current “focal” plate. */
const MID_SCALE = 1
/** Not yet reached; >0 avoids transform quirks. */
const HIDDEN_SCALE = 0.01

function targetScale(layerIndex: number, advanceCount: number, layerCount: number): number {
  const focalIndex = advanceCount + 1
  if (layerIndex <= advanceCount) return BIG_SCALE
  if (layerIndex === focalIndex && focalIndex < layerCount) return MID_SCALE
  return HIDDEN_SCALE
}

export function WritingObjectArchiveLeftPanelPreview() {
  const reduced = useWritingPreviewReducedMotion()
  const [advanceCount, setAdvanceCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const stackRef = useRef<HTMLDivElement>(null)
  const layoutReady = useRef(false)

  const n = LEFT_STACK_URLS.length
  const maxAdvance = n - 1

  const getLayerImgs = useCallback((): HTMLImageElement[] => {
    const root = stackRef.current
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLImageElement>('.writing-oa-left-panel__stack-layer img'))
  }, [])

  const goNext = useCallback(() => {
    if (isAnimating || advanceCount >= maxAdvance) return
    setAdvanceCount((c) => Math.min(c + 1, maxAdvance))
  }, [advanceCount, isAnimating, maxAdvance])

  const goBack = useCallback(() => {
    if (isAnimating || advanceCount <= 0) return
    setAdvanceCount((c) => Math.max(c - 1, 0))
  }, [advanceCount, isAnimating])

  useEffect(() => {
    return () => {
      layoutReady.current = false
    }
  }, [])

  useLayoutEffect(() => {
    const imgs = getLayerImgs()
    if (imgs.length !== n) return

    const dur = reduced ? 0 : DURATION

    imgs.forEach((img) => {
      gsap.set(img, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: '50% 50%',
      })
    })

    if (!layoutReady.current) {
      layoutReady.current = true
      imgs.forEach((img, j) => {
        gsap.set(img, { scale: targetScale(j, advanceCount, n) })
      })
      return
    }

    let alive = true
    gsap.killTweensOf(imgs)
    setIsAnimating(true)

    const tl = gsap.timeline({
      defaults: { duration: dur, ease: EASE },
      onComplete: () => {
        if (alive) setIsAnimating(false)
      },
    })

    imgs.forEach((img, j) => {
      tl.to(img, { scale: targetScale(j, advanceCount, n) }, 0)
    })

    return () => {
      alive = false
      tl.kill()
      gsap.killTweensOf(imgs)
      setIsAnimating(false)
    }
  }, [advanceCount, reduced, getLayerImgs, n])

  const badge = `${advanceCount + 1} / ${n}`

  return (
    <figure
      className="writing-oa-left-panel"
      aria-label="Left column: stacked plates with continuous scale handoff; Next advances, Back reverses"
    >
      <figcaption className="writing-oa-left-panel__caption">
        The left half is a **single stack** of sixteen CDN plates (bg then mid for each of eight slides). Each layer uses{' '}
        <code>translate(-50%, -50%)</code> with a **scale ladder**: behind the focal plane everything already shown sits at{' '}
        <strong>{BIG_SCALE}</strong>, the **current** plate at <strong>{MID_SCALE}</strong>, and deeper plates at{' '}
        <strong>{HIDDEN_SCALE}</strong>. **Next →** bumps that ladder forward in one GSAP pass; **← Back** rewinds it.
      </figcaption>

      <div className="writing-oa-left-panel__stage">
        <div className="writing-oa-left-panel__split">
          <div className="writing-oa-left-panel__left" aria-hidden="true">
            <div ref={stackRef} className="writing-oa-left-panel__stack">
              {LEFT_STACK_URLS.map((src, i) => (
                <div
                  key={`${i}-${src}`}
                  className="writing-oa-left-panel__stack-layer"
                  style={{ zIndex: i }}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
            <span className="writing-oa-left-panel__index">{badge}</span>
          </div>

          <div className="writing-oa-left-panel__right">
            <img src={RIGHT_DECOR} alt="" loading="lazy" decoding="async" />
            <div className="writing-oa-left-panel__next-row">
              <button
                type="button"
                className="writing-oa-left-panel__back"
                onClick={goBack}
                disabled={advanceCount <= 0 || isAnimating}
                aria-label="Rewind the scale ladder one step"
              >
                ← Back
              </button>
              <button
                type="button"
                className="writing-oa-left-panel__next"
                onClick={goNext}
                disabled={advanceCount >= maxAdvance || isAnimating}
                aria-label="Advance the scale ladder one step"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="writing-oa-left-panel__hint">
        Scales tween together each step. At the end every layer rests at {BIG_SCALE}. Reduced motion uses zero duration.
      </p>
    </figure>
  )
}
