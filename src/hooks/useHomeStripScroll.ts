import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

export type HomeStripScrollRefs = {
  rootRef: RefObject<HTMLElement | null>
  experimentsTrackRef: RefObject<HTMLElement | null>
  experimentsStripRef: RefObject<HTMLElement | null>
  workTrackRef?: RefObject<HTMLElement | null>
  workStripRef?: RefObject<HTMLElement | null>
  booksTrackRef: RefObject<HTMLElement | null>
  booksStripRef: RefObject<HTMLElement | null>
}

type StripBinding = {
  section: HTMLElement
  wrap: HTMLElement
  strip: HTMLElement
}

function bindSectionHorizontalStrip({ section, wrap, strip }: StripBinding) {
  let max = 0

  const measure = () => {
    max = Math.max(0, strip.scrollWidth - wrap.clientWidth)
  }

  measure()
  if (max <= 0) return () => {}

  const tween = gsap.to(strip, {
    x: () => -max,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  })

  const onRefreshInit = () => measure()
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

  const ro = new ResizeObserver(() => {
    measure()
    ScrollTrigger.refresh()
  })
  ro.observe(strip)
  ro.observe(wrap)

  requestAnimationFrame(() => ScrollTrigger.refresh())

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
    ro.disconnect()
    tween.scrollTrigger?.kill()
    tween.kill()
    gsap.set(strip, { clearProps: 'x' })
  }
}

/**
 * Scroll-scrubbed horizontal strips — each section scrubs while that panel
 * crosses the viewport (same feel as Experiments).
 */
export function useHomeStripScroll({
  rootRef,
  experimentsTrackRef,
  experimentsStripRef,
  workTrackRef,
  workStripRef,
  booksTrackRef,
  booksStripRef,
  enabled,
  experimentsEnabled = true,
  booksEnabled = true,
}: HomeStripScrollRefs & {
  enabled: boolean
  experimentsEnabled?: boolean
  booksEnabled?: boolean
}) {
  useLayoutEffect(() => {
    if (!enabled) return

    const root = rootRef.current
    const experimentsSection = root?.querySelector<HTMLElement>('#experiments')
    const workSection = root?.querySelector<HTMLElement>('#work')
    const booksSection = root?.querySelector<HTMLElement>('#books')
    const expWrap = experimentsTrackRef.current
    const expStrip = experimentsStripRef.current
    const workWrap = workTrackRef?.current ?? null
    const workStrip = workStripRef?.current ?? null
    const bookWrap = booksTrackRef.current
    const bookStrip = booksStripRef.current

    const cleanups: Array<() => void> = []

    if (experimentsEnabled && experimentsSection && expWrap && expStrip) {
      const cleanup = bindSectionHorizontalStrip({
        section: experimentsSection,
        wrap: expWrap,
        strip: expStrip,
      })
      cleanups.push(cleanup)
    }

    if (workSection && workWrap && workStrip) {
      const cleanup = bindSectionHorizontalStrip({
        section: workSection,
        wrap: workWrap,
        strip: workStrip,
      })
      cleanups.push(cleanup)
    }

    if (booksEnabled && booksSection && bookWrap && bookStrip) {
      const cleanup = bindSectionHorizontalStrip({
        section: booksSection,
        wrap: bookWrap,
        strip: bookStrip,
      })
      cleanups.push(cleanup)
    }

    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [
    enabled,
    experimentsEnabled,
    booksEnabled,
    rootRef,
    experimentsTrackRef,
    experimentsStripRef,
    workTrackRef,
    workStripRef,
    booksTrackRef,
    booksStripRef,
  ])
}
