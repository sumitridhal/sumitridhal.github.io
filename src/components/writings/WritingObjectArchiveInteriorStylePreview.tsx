import gsap from 'gsap'
import { useCallback, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const STYLES = [
  {
    label: 'Modern Folk',
    caption:
      'Hand-thrown forms, linen, and quiet pattern. Art that feels gathered over seasons rather than staged overnight.',
    image:
      'https://objectandarchive.com/cdn/shop/files/oa-custom-5.png?v=1776609699&width=900',
  },
  {
    label: 'Cottagecore',
    caption:
      'Soft daylight, hedgerow greens, and small domestic joys. Pieces read like pressed flowers in a commonplace book.',
    image:
      'https://objectandarchive.com/cdn/shop/files/indianer_du_nord.png?v=1775327543&width=900',
  },
  {
    label: 'Cosmic Feminine',
    caption:
      'Lunar palettes, veils of pigment, and slow orbit. Work that tilts toward myth without losing a human scale.',
    image:
      'https://objectandarchive.com/cdn/shop/files/man_of_confusion_22dd0388-3c82-47b3-a8cc-d33b535c249b.png?v=1775328526&width=900',
  },
  {
    label: 'Americana',
    caption:
      'Wide skies, timber grain, and plainspoken color. Art that carries distance and weather in the same frame.',
    image:
      'https://objectandarchive.com/cdn/shop/files/man_s_face.png?v=1775328340&width=900',
  },
  {
    label: 'Heritage Eclectic',
    caption:
      'Layered rooms where centuries politely disagree. A salon wall that refuses a single provenance.',
    image:
      'https://objectandarchive.com/cdn/shop/files/6715a96f-a601-4e5c-a51e-700c018d4870.png?v=1773532575&width=900',
  },
  {
    label: 'French Romantic',
    caption:
      'Soft drama, candlelight, longing. Art that feels intimate and slightly theatrical, like a scene from a Baudelaire novel.',
    image:
      'https://objectandarchive.com/cdn/shop/files/september_moonrise_377c7870-65ef-4f06-9e85-a9e914f7fa72.png?v=1775328232&width=900',
  },
  {
    label: 'Modern Medievalism',
    caption:
      'Flat perspectives, tapestry motifs, medieval panel painting. From monastic restraint to jewel-toned maximalism.',
    image:
      'https://objectandarchive.com/cdn/shop/files/figures.png?v=1775327811&width=900',
  },
  {
    label: 'Midcentury Modern',
    caption:
      'Crisp planes, honest materials, and optimism in line. Art that sits forward on the sofa, not against the wall.',
    image:
      'https://objectandarchive.com/cdn/shop/files/two-nudes_99aebea8-e2f2-4441-bac9-0cec70408f4b.png?v=1775328415&width=900',
  },
  {
    label: 'Organic Modern',
    caption:
      'Stone, clay, and slow curves; daylight as the loudest accent. Calm surfaces with one irregular heartbeat.',
    image:
      'https://objectandarchive.com/cdn/shop/files/flemish-verdure.png?v=1775328708&width=900',
  },
  {
    label: 'Dark Maximalism',
    caption:
      'Velvet depth, gilt edges, and appetite for shadow. Rooms that read like a cabinet of curiosities after midnight.',
    image:
      'https://objectandarchive.com/cdn/shop/files/Baigneuses_sur_la_Rance_eb2f9f73-1402-413b-9a1c-4f1f6b2994f1.png?v=1775329598&width=900',
  },
] as const

export function WritingObjectArchiveInteriorStylePreview() {
  const reduced = useWritingPreviewReducedMotion()
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const panelInnerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)

  const writeDom = useCallback((index: number) => {
    const img = imgRef.current
    const cap = captionRef.current
    if (!img || !cap) return
    const row = STYLES[index]
    if (!row) return
    img.alt = row.label
    img.src = row.image
    cap.textContent = row.caption
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(STYLES.length - 1, index))
      if (i === activeRef.current) return
      activeRef.current = i
      setActive(i)

      const inner = panelInnerRef.current
      if (!inner) {
        writeDom(i)
        return
      }

      gsap.killTweensOf(inner)

      if (reduced) {
        writeDom(i)
        gsap.set(inner, { clearProps: 'transform,opacity' })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      tl.to(inner, { opacity: 0, yPercent: 5, duration: 0.14 }, 0)
      tl.call(() => {
        writeDom(i)
      })
      tl.fromTo(
        inner,
        { yPercent: 9, opacity: 0.55 },
        { yPercent: 0, opacity: 1, duration: 0.42, ease: 'power2.out' },
      )
    },
    [reduced, writeDom],
  )

  return (
    <figure
      className="writing-oa-style"
      aria-label="Tween concept Part 4: hover or focus a style to swap the panel with GSAP"
    >
      <figcaption className="writing-oa-style__caption">
        **Tween sheet — Part 4:** No nested scroll—**hover** (or **keyboard focus**) a style on the left and the right
        **image + caption** update. **GSAP** runs a short **timeline**: ease out, swap DOM, then **fromTo** (`yPercent` +
        opacity) so the panel reads as rising **from center toward rest**—same intent as the storefront rail, driven by
        pointer/focus instead of `scrollTop`.
      </figcaption>

      <div className="writing-oa-style__embed">
        <div className="writing-oa-style__stage">
          <p className="writing-oa-style__kicker">Explore by interior style</p>
          <div className="writing-oa-style__row">
            <ul className="writing-oa-style__list" aria-label="Interior styles">
              {STYLES.map((s, i) => (
                <li
                  key={s.label}
                  className={`writing-oa-style__item${active === i ? ' is-active' : ''}`}
                  onPointerEnter={() => goTo(i)}
                >
                  <button
                    type="button"
                    className="writing-oa-style__label-btn"
                    onFocus={() => goTo(i)}
                    aria-current={active === i ? 'true' : undefined}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="writing-oa-style__panel">
              <div ref={panelInnerRef} className="writing-oa-style__panel-inner">
                <div className="writing-oa-style__frame">
                  <img ref={imgRef} src={STYLES[0]!.image} alt={STYLES[0]!.label} loading="lazy" decoding="async" />
                </div>
                <p ref={captionRef} className="writing-oa-style__panel-caption">
                  {STYLES[0]!.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="writing-oa-style__hint">
        <code>gsap.timeline</code> on <code>.writing-oa-style__panel-inner</code>: out tween → swap src/caption → in
        tween. List: <code>onPointerEnter</code> / <code>onFocus</code>; reduced motion skips motion and clears transforms.
      </p>
    </figure>
  )
}
