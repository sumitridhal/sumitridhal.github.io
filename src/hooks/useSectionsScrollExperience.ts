import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis (GSAP ticker + ScrollTrigger scroller proxy) plus light entrance motion
 * for sections 1–7 inside {@link SectionsPage} `<main>`.
 */
export function useSectionsScrollExperience(
  rootRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
) {
  useLenisScrollTrigger()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const main = root.querySelector('main.sections-page__main')
    if (!main) return

    const sections = main.querySelectorAll<HTMLElement>(':scope > .sections-page__section')
    if (!sections.length) return

    if (reducedMotion) {
      gsap.set(sections, { clearProps: 'opacity,transform' })
      return
    }

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 44,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [rootRef, reducedMotion])
}
