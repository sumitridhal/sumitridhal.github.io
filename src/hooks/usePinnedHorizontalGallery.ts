import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

type UsePinnedHorizontalGalleryOptions = {
  sectionRef: RefObject<HTMLElement | null>
  wrapperRef: RefObject<HTMLElement | null>
  stripRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

/**
 * Scrubs a horizontal strip while its panel is in the layered pin stack (no extra pin here).
 */
export function usePinnedHorizontalGallery({
  sectionRef,
  wrapperRef,
  stripRef,
  reducedMotion,
}: UsePinnedHorizontalGalleryOptions) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const wrapper = wrapperRef.current
    const strip = stripRef.current
    if (!section || !wrapper || !strip) return

    let horizontalLength = 0

    const measure = () => {
      horizontalLength = Math.max(0, strip.scrollWidth - wrapper.clientWidth)
    }

    measure()

    if (reducedMotion) {
      wrapper.style.overflowX = 'auto'
      return () => {
        wrapper.style.overflowX = ''
      }
    }

    if (horizontalLength <= 0) return

    const tween = gsap.to(strip, {
      x: () => -horizontalLength,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${horizontalLength}`,
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
    ro.observe(wrapper)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
      ro.disconnect()
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(strip, { clearProps: 'x' })
    }
  }, [sectionRef, wrapperRef, stripRef, reducedMotion])
}
