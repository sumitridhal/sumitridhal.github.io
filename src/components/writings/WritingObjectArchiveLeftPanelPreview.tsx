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

const BIG_SCALE = 1.02
const MID_SCALE = 0.5
const HIDDEN_SCALE = 0

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
      aria-label="Tween concept Part 2: sixteen stacked plates; GSAP parallel scale ladder; Next and Back step advanceCount"
    >
      <figcaption className="writing-oa-left-panel__caption">
        **Tween sheet — Part 2:** sixteen stacked plates (bg then mid × eight slides). Each <code>img</code> is centered (
        <code>translate(-50%, -50%)</code>) and only <strong>scale</strong> tweens—passed layers → <strong>{BIG_SCALE}</strong>,
        focal → <strong>{MID_SCALE}</strong>, ahead → <strong>{HIDDEN_SCALE}</strong>. One GSAP timeline per step; **Next →**
        / **← Back** move <code>advanceCount</code>.
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
        Part 2 ladder: all layers tween in parallel; terminal step holds everyone at {BIG_SCALE}. Reduced motion snaps (
        duration 0).
      </p>
    </figure>
  )
}
