import { useCallback, useRef, useState } from 'react'

const RESOURCES = [
  {
    label: 'Palette Library',
    caption:
      'A library of color palettes drawn from the works in our collection. Browse by painting, filter by individual colors, or explore historical names tied to each shade.',
    image:
      'https://objectandarchive.com/cdn/shop/files/color-library.png?v=1777035655&width=1200',
  },
  {
    label: 'Artist Index',
    caption:
      "An alphabetical index of the artists in our collection. You can flip through their work and read a short bio. A way to understand the big picture of artists' worlds.",
    image:
      'https://objectandarchive.com/cdn/shop/files/kirchner-self-portrait.jpg?v=1775999782&width=1200',
  },
  {
    label: 'Framing Guide',
    caption:
      'A detailed guide to our printing and framing process, from materials to sizing and finishing. Designed to give you a clearer sense of how each piece is made and what to expect.',
    image:
      'https://objectandarchive.com/cdn/shop/files/process-1.png?v=1776641253&width=1200',
  },
  {
    label: 'Marginalia',
    caption:
      'Marginalia is our running collection of notes on art, aesthetics, and the stranger corners of visual culture. Less formal, more curious, and not always to the point.',
    image:
      'https://objectandarchive.com/cdn/shop/files/The_Swing_c._1775-1780.jpg?v=1776611269&width=1200',
  },
] as const

export function WritingObjectArchiveResourcesPreview() {
  const [active, setActive] = useState<number | null>(null)
  const activeRef = useRef<number | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const overlayTitleRef = useRef<HTMLParagraphElement>(null)

  const writeDom = useCallback((index: number) => {
    const img = imgRef.current
    const cap = captionRef.current
    const title = overlayTitleRef.current
    const row = RESOURCES[index]
    if (!img || !cap || !row) return
    img.alt = row.label
    img.src = row.image
    cap.textContent = row.caption
    if (title) title.textContent = row.label
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(RESOURCES.length - 1, index))
      if (activeRef.current === i) return
      activeRef.current = i
      setActive(i)
      writeDom(i)
    },
    [writeDom],
  )

  const first = RESOURCES[0]!

  return (
    <figure
      className="writing-oa-res"
      aria-label="Tween concept Part 5: hover or focus a resource to swap the portrait and caption (no motion on the image slot)"
    >
      <figcaption className="writing-oa-res__caption">
        **Tween sheet — Part 5:** One serif **list**; after the first pick, a **portrait stack** is **centered over**
        inactive lines (`pointer-events: none` on the float); the **active** line stays above via **z-index**. **No GSAP**
        here—**`img.src`** and copy update **synchronously** on hover/focus. The **frame** is a fixed **3:4** slot; every
        asset uses **`object-fit: cover`** so swaps keep the **same box**.
      </figcaption>

      <div className="writing-oa-res__embed">
        <div className="writing-oa-res__stage">
          <div className="writing-oa-res__canvas">
            <div className="writing-oa-res__controls">
              <p className="writing-oa-res__kicker">Explore our resources</p>

              <div className="writing-oa-res__overlap">
                <ul className="writing-oa-res__list" aria-label="Resources">
                  {RESOURCES.map((r, i) => (
                    <li
                      key={r.label}
                      className={`writing-oa-res__item${active === i ? ' is-active' : ''}`}
                      onPointerEnter={() => goTo(i)}
                    >
                      <button
                        type="button"
                        className="writing-oa-res__label-btn"
                        onFocus={() => goTo(i)}
                        aria-current={active === i ? 'true' : undefined}
                      >
                        {r.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div
                  className={`writing-oa-res__float${active === null ? ' is-idle' : ''}`}
                  aria-hidden={active === null ? true : undefined}
                >
                  <div className="writing-oa-res__panel-inner">
                    <div className="writing-oa-res__portrait-col">
                    
                      <div className="writing-oa-res__frame">
                        <img
                          ref={imgRef}
                          src={first.image}
                          alt={first.label}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {active === null ? (
                <p className="writing-oa-res__idle-hint">Hover or focus a line to open the preview.</p>
              ) : null}
            </div>
          </div>

          <div className={`writing-oa-res__caption-dock${active === null ? ' is-idle' : ''}`}>
            <p ref={captionRef} className="writing-oa-res__dock-caption">
              {first.caption}
            </p>
          </div>
        </div>
      </div>

      <p className="writing-oa-res__hint">
        Fixed <code>aspect-ratio: 3 / 4</code> on <code>.writing-oa-res__frame</code>; <code>img</code> uses{' '}
        <code>object-fit: cover</code> so every asset shares the same slot. No GSAP; <code>.is-idle</code> toggles float +
        caption until a selection.
      </p>
    </figure>
  )
}
