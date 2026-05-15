import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

export type HomeLinkedHorizontalRefs = {
  rootRef: RefObject<HTMLElement | null>
  experimentsTrackRef: RefObject<HTMLElement | null>
  experimentsStripRef: RefObject<HTMLElement | null>
  workTrackRef: RefObject<HTMLElement | null>
  workStripRef: RefObject<HTMLElement | null>
  booksTrackRef: RefObject<HTMLElement | null>
  booksStripRef: RefObject<HTMLElement | null>
}

function stripTranslateX(progress: number, maxExp: number, maxWork: number, maxBook: number) {
  const budget = maxExp + maxWork + maxBook
  if (budget <= 0) {
    return { exp: 0, work: 0, book: 0 }
  }
  let d = progress * budget
  const takeExp = Math.min(d, maxExp)
  d -= takeExp
  const takeWork = Math.min(d, maxWork)
  d -= takeWork
  const takeBook = Math.min(d, maxBook)
  return { exp: -takeExp, work: -takeWork, book: -takeBook }
}

/**
 * One scrubbed ScrollTrigger from #experiments through #books. Vertical progress is spent
 * sequentially on horizontal translateX: experiments strip, then work strip, then bookshelf.
 *
 * Disabled when reduced motion or when there is no experiments strip (`enabled`: false).
 */
export function useHomeLinkedHorizontalGalleryScroll({
  rootRef,
  experimentsTrackRef,
  experimentsStripRef,
  workTrackRef,
  workStripRef,
  booksTrackRef,
  booksStripRef,
  enabled,
}: HomeLinkedHorizontalRefs & { enabled: boolean }) {
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

    const scrollTrigger = ScrollTrigger.create({
      trigger: experimentsSection,
      start: 'top bottom',
      endTrigger: booksSection,
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const { exp, work, book } = stripTranslateX(self.progress, max.exp, max.work, max.book)
        gsap.set(expStrip, { x: exp })
        gsap.set(workStrip, { x: work })
        gsap.set(bookStrip, { x: book })
      },
    })

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
      scrollTrigger.kill()
      gsap.set(expStrip, { clearProps: 'x' })
      gsap.set(workStrip, { clearProps: 'x' })
      gsap.set(bookStrip, { clearProps: 'x' })
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
  ])
}
