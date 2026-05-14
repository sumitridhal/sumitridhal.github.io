import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/locomotive-scroll.css'
import { useLayoutEffect, useRef } from 'react'

import {
  OA_HERO_IMG_LEFT,
  OA_HERO_IMG_RIGHT,
  OA_HERO_LOGO_SVG,
} from '@/components/writings/writingObjectArchiveHeroCdn'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** Curator’s picks carousel — titles, artists, and CDN URLs from live storefront markup. */
const SCROLL_ITEMS = [
  {
    src: 'https://objectandarchive.com/cdn/shop/files/oa-custom-5.png?v=1776609699&width=900',
    title: 'Chatter over the New Heir',
    credit: 'LaVerne Nelson Black',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/indianer_du_nord.png?v=1775327543&width=900',
    title: 'Indianer zu Pferd',
    credit: 'August Macke',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_of_confusion_22dd0388-3c82-47b3-a8cc-d33b535c249b.png?v=1775328526&width=900',
    title: 'The Man of Confusion',
    credit: 'Paul Klee',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_s_face.png?v=1775328340&width=900',
    title: "Man's Face",
    credit: 'Arnold Peter Weisz-Kubínčan',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/6715a96f-a601-4e5c-a51e-700c018d4870.png?v=1773532575&width=900',
    title: 'Nocturne',
    credit: 'Childe Hassam',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/september_moonrise_377c7870-65ef-4f06-9e85-a9e914f7fa72.png?v=1775328232&width=900',
    title: 'September Moonrise',
    credit: 'Childe Hassam',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/figures.png?v=1775327811&width=900',
    title: 'Figures',
    credit: 'Jankel Adler',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/two-nudes_99aebea8-e2f2-4441-bac9-0cec70408f4b.png?v=1775328415&width=900',
    title: 'Two Nudes in a Room',
    credit: 'Ernst Ludwig Kirchner',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/flemish-verdure.png?v=1775328708&width=900',
    title: 'Verdure  - Flemish School (17th century)',
    credit: 'Unknown Artist',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/Baigneuses_sur_la_Rance_eb2f9f73-1402-413b-9a1c-4f1f6b2994f1.png?v=1775329598&width=900',
    title: 'Baigneuses sur la Rance',
    credit: 'Émile Othon Friesz',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/paysage_en_provence.png?v=1775330102&width=900',
    title: 'Paysage en Provence',
    credit: 'Émile Othon Friesz',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/Masseida_nue_allongee_sur_un_divan_b0ab1bc2-2c10-4b4e-acfc-f86bbe542236.png?v=1775329916&width=900',
    title: 'Masseïda nue allongée sur un divan',
    credit: 'Théophile Alexandre Steinlen',
  },
] as const

export function WritingObjectArchiveScrollPreview() {
  const reduced = useWritingPreviewReducedMotion()
  const shellRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const shell = shellRef.current
    const track = trackRef.current
    if (!shell || !track) return

    if (reduced) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: track,
          scroller: shell,
          start: 'top top',
          end: () => `+=${Math.max(32, shell.clientHeight)}`,
          scrub: 0,
          invalidateOnRefresh: true,
          onUpdate(self) {
            shell.style.setProperty('--oa-cover-p', String(self.progress))
          },
        })
      }, shell)

      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh()
      })
      ro.observe(shell)

      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })

      return () => {
        ro.disconnect()
        ctx.revert()
      }
    }

    shell.classList.add('writing-oa-scroll__shell--smooth')

    const setCoverFromScroll = (scroll: number) => {
      const h = Math.max(32, shell.clientHeight)
      const p = Math.min(1, Math.max(0, scroll / h))
      shell.style.setProperty('--oa-cover-p', String(p))
    }

    const loco = new LocomotiveScroll({
      lenisOptions: {
        wrapper: shell,
        content: track,
        eventsTarget: shell,
        orientation: 'vertical',
        smoothWheel: true,
        lerp: 0.09,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        allowNestedScroll: true,
        autoResize: true,
      },
      scrollCallback: ({ scroll }) => {
        setCoverFromScroll(scroll)
      },
      initCustomTicker: (render) => {
        gsap.ticker.add(render)
      },
      destroyCustomTicker: (render) => {
        gsap.ticker.remove(render)
      },
    })

    const ro = new ResizeObserver(() => {
      loco.resize()
    })
    ro.observe(shell)

    requestAnimationFrame(() => {
      loco.resize()
      const lenis = loco.lenisInstance
      if (lenis) setCoverFromScroll(lenis.scroll)
    })

    return () => {
      ro.disconnect()
      shell.classList.remove('writing-oa-scroll__shell--smooth')
      loco.destroy()
      shell.style.removeProperty('--oa-cover-p')
    }
  }, [reduced])

  return (
    <figure
      className="writing-oa-scroll"
      aria-label="Tween concept Part 3: Locomotive Scroll smooths the shell; scroll position drives cover progress via CSS variable"
    >
      <figcaption className="writing-oa-scroll__caption">
        **Tween sheet — Part 3:** **Locomotive Scroll v5** (Lenis-backed) smooths vertical wheel on the shell;{' '}
        **`scrollCallback`** maps **`scroll` → `--oa-cover-p`** over the first viewport height (same 0→1 window the old
        **`ScrollTrigger`** scrub used). **GSAP `ticker`** runs Locomotive’s frame loop so scrub stays aligned with other
        tweens. **`allowNestedScroll`** keeps the horizontal strip usable. **`data-lenis-prevent`** still isolates the
        embed from the page Lenis. **Reduced motion:** native **`overflow-y: auto`** + **`ScrollTrigger`** only (
        **`scrub: 0`**).
      </figcaption>

      <div className="writing-oa-scroll__embed">
        <div ref={shellRef} className="writing-oa-scroll__shell" data-lenis-prevent>
          <div ref={trackRef} className="writing-oa-scroll__track">
            <div className="writing-oa-scroll__hero-slot">
              <div className="writing-oa-scroll__hero-static">
                <div className="writing-oa-scroll__hero-stage" aria-hidden="true">
                  <div className="writing-oa-hero__stage">
                    <div className="writing-oa-hero__split">
                      <div className="writing-oa-hero__half writing-oa-hero__half--left">
                        <img src={OA_HERO_IMG_LEFT} alt="" loading="lazy" decoding="async" />
                      </div>
                      <div className="writing-oa-hero__half writing-oa-hero__half--right">
                        <img src={OA_HERO_IMG_RIGHT} alt="" loading="lazy" decoding="async" />
                      </div>
                    </div>
                    <div className="writing-oa-hero__logo">
                      <span className="writing-oa-hero__logo-scrim" aria-hidden="true" />
                      <img src={OA_HERO_LOGO_SVG} alt="" loading="lazy" decoding="async" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="writing-oa-scroll__obsessions-raise">
              <div className="writing-oa-scroll__obsessions-inner">
                <div className="writing-oa-scroll__obsessions" id="writing-oa-scroll-collections">
                  <header className="writing-oa-scroll__intro" aria-labelledby="writing-oa-scroll-heading">
                    <div className="writing-oa-scroll__intro-text">
                      <h2 id="writing-oa-scroll-heading" className="writing-oa-scroll__heading">
                        Current obsessions
                      </h2>
                      <p className="writing-oa-scroll__lede">
                        These are the works we keep coming back to right now. If you don&apos;t know where to start, start
                        here.
                      </p>
                    </div>
                    <a
                      className="writing-oa-scroll__cta"
                      href="https://objectandarchive.com/collections/all"
                      rel="noreferrer noopener"
                    >
                      See the collection
                    </a>
                  </header>

                  <div
                    className="writing-oa-scroll__viewport"
                    tabIndex={0}
                    role="region"
                    aria-label="Horizontally scrollable obsession picks from Object and Archive"
                  >
                    <ul className="writing-oa-scroll__strip">
                      {SCROLL_ITEMS.map((item) => (
                        <li key={item.src} className="writing-oa-scroll__tile">
                          <div className="writing-oa-scroll__frame">
                            <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
                          </div>
                          <p className="writing-oa-scroll__tile-title">{item.title}</p>
                          {item.credit ? <p className="writing-oa-scroll__tile-credit">{item.credit}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="writing-oa-scroll__hint">
        Default path: <code>LocomotiveScroll</code> with <code>lenisOptions.wrapper</code> = shell and{' '}
        <code>content</code> = track; <code>scrollCallback</code> writes <code>--oa-cover-p</code>. Reduced motion:{' '}
        <code>ScrollTrigger</code> + native scroller. ResizeObserver → <code>loco.resize()</code> or{' '}
        <code>ScrollTrigger.refresh()</code>.
      </p>
    </figure>
  )
}
