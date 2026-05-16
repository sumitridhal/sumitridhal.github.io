import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

type UseHomeScrollParallaxOptions = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

const HOME_PARALLAX_SKIP_FADE_IDS = new Set([
  'hero',
  'experiments',
  'writings',
  'books',
])

/**
 * Mirrors `/sections` scrubbed motion from `useSectionsScrollExperience`:
 * hero `yPercent` vs next section, experiments body lift, banner `<img>` drift.
 * One-shot fade-up on `#work` and `#talks` (non-parallax panels).
 *
 * Does not call `useLenisScrollTrigger` — other home hooks already register it.
 */
export function useHomeScrollParallax({ rootRef, reducedMotion }: UseHomeScrollParallaxOptions) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const hero = root.querySelector<HTMLElement>('#hero')
    const experiments = root.querySelector<HTMLElement>('#experiments')
    const bannerImgs = root.querySelectorAll<HTMLElement>('.home-section__banner-img')
    const expShift = root.querySelector<HTMLElement>(
      '#experiments .home-experiments__scroll-shift',
    )

    if (reducedMotion) {
      if (hero) gsap.set(hero, { clearProps: 'transform' })
      bannerImgs.forEach((img) => gsap.set(img, { clearProps: 'transform' }))
      if (expShift) gsap.set(expShift, { clearProps: 'transform' })
      return
    }

    const ctx = gsap.context(() => {
      if (hero && experiments) {
        gsap.fromTo(
          hero,
          { x: 0, yPercent: 0 },
          {
            x: 0,
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: experiments,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
            },
          },
        )
      }

      if (expShift && experiments) {
        gsap.fromTo(
          expShift,
          { x: 0, y: 120 },
          {
            x: 0,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: experiments,
              start: 'top bottom',
              end: 'top 30%',
              scrub: true,
            },
          },
        )
      }

      const bindPanelBgParallax = (
        sectionEl: HTMLElement | null,
        imgEl: HTMLElement | null,
      ) => {
        if (!sectionEl || !imgEl) return
        gsap.fromTo(
          imgEl,
          { x: 0, y: 0 },
          {
            xPercent: 0,
            yPercent: 25,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }

      bindPanelBgParallax(
        root.querySelector<HTMLElement>('#experiments'),
        root.querySelector<HTMLElement>('#experiments .home-section__banner-img'),
      )
      bindPanelBgParallax(
        root.querySelector<HTMLElement>('#writings'),
        root.querySelector<HTMLElement>('#writings .home-section__banner-img'),
      )
      bindPanelBgParallax(
        root.querySelector<HTMLElement>('#books'),
        root.querySelector<HTMLElement>('#books .home-section__banner-img'),
      )

      root.querySelectorAll<HTMLElement>('[data-home-panel]').forEach((panel) => {
        if (HOME_PARALLAX_SKIP_FADE_IDS.has(panel.id)) return
        gsap.from(panel, {
          opacity: 0,
          y: 44,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 88%',
            once: true,
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [rootRef, reducedMotion])
}
