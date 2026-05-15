import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

export type HomeStripScrollRefs = {
  rootRef: RefObject<HTMLElement | null>
  experimentsTrackRef: RefObject<HTMLElement | null>
  experimentsStripRef: RefObject<HTMLElement | null>
  workTrackRef: RefObject<HTMLElement | null>
  workStripRef: RefObject<HTMLElement | null>
  booksTrackRef: RefObject<HTMLElement | null>
  booksStripRef: RefObject<HTMLElement | null>
}

/**
 * Relative vertical-scroll “cost” per strip vs baseline `1`.
 * Lower → that strip finishes its horizontal range with less page scroll (feels faster).
 */
export const HOME_STRIP_WEIGHTS = {
  experiments: 0.62,
  work: 1.05,
  books: 0.68,
} as const

export type HomeStripWeights = typeof HOME_STRIP_WEIGHTS

function verticalBudgetPx(maxPx: number, weight: number) {
  if (maxPx <= 0) return 0
  return Math.max(maxPx * weight, 1)
}

/**
 * Scroll-scrubbed timeline: experiments → work → bookshelf translateX, driven by one
 * ScrollTrigger from `#experiments` through `#books`.
 *
 * @see https://gsap.com/docs/v3/GSAP/Timeline/
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
  weights: weightsOverride,
}: HomeStripScrollRefs & {
  enabled: boolean
  weights?: Partial<HomeStripWeights>
}) {
  useLayoutEffect(() => {
    if (!enabled) return

    const root = rootRef.current
    const experimentsSection = root?.querySelector<HTMLElement>('#experiments')
    const booksSection = root?.querySelector<HTMLElement>('#books')
    const expWrap = experimentsTrackRef.current
    const expStrip = experimentsStripRef.current
    const workWrap = workTrackRef.current
    const workStrip = workStripRef.current
    const bookWrap = booksTrackRef.current
    const bookStrip = booksStripRef.current

    if (
      !experimentsSection ||
      !booksSection ||
      !expWrap ||
      !expStrip ||
      !workWrap ||
      !workStrip ||
      !bookWrap ||
      !bookStrip
    ) {
      return
    }

    const max = { exp: 0, work: 0, book: 0 }

    const measure = () => {
      max.exp = Math.max(0, expStrip.scrollWidth - expWrap.clientWidth)
      max.work = Math.max(0, workStrip.scrollWidth - workWrap.clientWidth)
      max.book = Math.max(0, bookStrip.scrollWidth - bookWrap.clientWidth)
    }

    measure()

    if (max.exp + max.work + max.book <= 0) return

    const w: HomeStripWeights = { ...HOME_STRIP_WEIGHTS, ...weightsOverride }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: experimentsSection,
        start: 'top bottom',
        endTrigger: booksSection,
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    if (max.exp > 0) {
      tl.to(expStrip, {
        x: () => -max.exp,
        duration: () => verticalBudgetPx(max.exp, w.experiments),
      })
    }
    if (max.work > 0) {
      tl.to(workStrip, {
        x: () => -max.work,
        duration: () => verticalBudgetPx(max.work, w.work),
      })
    }
    if (max.book > 0) {
      tl.to(bookStrip, {
        x: () => -max.book,
        duration: () => verticalBudgetPx(max.book, w.books),
      })
    }

    const onRefreshInit = () => measure()
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

    const ro = new ResizeObserver(() => {
      measure()
      ScrollTrigger.refresh()
    })

    ro.observe(expStrip)
    ro.observe(expWrap)
    ro.observe(workStrip)
    ro.observe(workWrap)
    ro.observe(bookStrip)
    ro.observe(bookWrap)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
      ro.disconnect()
      tl.kill()
      gsap.set([expStrip, workStrip, bookStrip], { clearProps: 'x' })
    }
  }, [
    enabled,
    rootRef,
    experimentsTrackRef,
    experimentsStripRef,
    workTrackRef,
    workStripRef,
    booksTrackRef,
    booksStripRef,
    weightsOverride,
  ])
}
