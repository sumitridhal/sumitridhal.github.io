import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect } from 'react'

import { useLenis } from '@/providers/LenisProvider'

gsap.registerPlugin(ScrollTrigger)

/**
 * Keeps ScrollTrigger in sync with Lenis smooth scroll (window scroller).
 */
export function useLenisScrollTrigger() {
  const lenis = useLenis()

  useLayoutEffect(() => {
    if (!lenis) return

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
      pinType: 'fixed',
    })

    const onRefresh = () => lenis.resize()
    ScrollTrigger.addEventListener('refresh', onRefresh)
    ScrollTrigger.refresh()

    return () => {
      lenis.off('scroll', onScroll)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      ScrollTrigger.scrollerProxy(document.documentElement, {})
      ScrollTrigger.clearScrollMemory()
    }
  }, [lenis])
}
