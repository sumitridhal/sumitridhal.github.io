import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'
import { useLayoutEffect, useState, type RefObject } from 'react'

import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export type UseLocomotiveScrollTriggerEmbedOptions = {
  shellRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  enabled?: boolean
  smoothClassName?: string
  /** Site Lenis instance — paused while the embed shell is hovered/focused. */
  pageLenis?: Lenis | null
}

/**
 * Locomotive Scroll v5 embed + ScrollTrigger.scrollerProxy on the shell.
 * Fires scrollReady when the scroller is safe to bind scrubbed timelines.
 */
export function useLocomotiveScrollTriggerEmbed({
  shellRef,
  trackRef,
  reducedMotion,
  enabled = true,
  smoothClassName,
  pageLenis,
}: UseLocomotiveScrollTriggerEmbedOptions): boolean {
  const [scrollReady, setScrollReady] = useState(false)

  useLayoutEffect(() => {
    if (!enabled) {
      return
    }

    const shell = shellRef.current
    const track = trackRef.current
    if (!shell || !track) {
      return
    }

    const pausePageScroll = () => pageLenis?.stop()
    const resumePageScroll = () => pageLenis?.start()

    if (pageLenis) {
      shell.addEventListener('mouseenter', pausePageScroll)
      shell.addEventListener('mouseleave', resumePageScroll)
      shell.addEventListener('focusin', pausePageScroll)
      shell.addEventListener('focusout', resumePageScroll)
    }

    let loco: LocomotiveScroll | null = null
    let lenisScrollHandler: (() => void) | null = null

    const teardownPageListeners = () => {
      if (pageLenis) {
        shell.removeEventListener('mouseenter', pausePageScroll)
        shell.removeEventListener('mouseleave', resumePageScroll)
        shell.removeEventListener('focusin', pausePageScroll)
        shell.removeEventListener('focusout', resumePageScroll)
        pageLenis.start()
      }
    }

    const onRefresh = () => {
      loco?.resize()
    }

    if (reducedMotion) {
      shell.classList.remove(smoothClassName ?? '')

      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh()
      })
      ro.observe(shell)

      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        setScrollReady(true)
      })

      return () => {
        teardownPageListeners()
        ro.disconnect()
        setScrollReady(false)
      }
    }

    if (smoothClassName) {
      shell.classList.add(smoothClassName)
    }

    loco = new LocomotiveScroll({
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
      scrollCallback: () => {
        ScrollTrigger.update()
      },
      initCustomTicker: (render) => {
        gsap.ticker.add(render)
      },
      destroyCustomTicker: (render) => {
        gsap.ticker.remove(render)
      },
    })

    const lenis = loco.lenisInstance

    ScrollTrigger.scrollerProxy(shell, {
      scrollTop(value) {
        if (!lenis) return 0
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: shell.clientWidth,
          height: shell.clientHeight,
        }
      },
      scrollHeight() {
        return track.scrollHeight
      },
      pinType: 'transform',
    })

    if (lenis) {
      lenisScrollHandler = () => ScrollTrigger.update()
      lenis.on('scroll', lenisScrollHandler)
    }

    ScrollTrigger.addEventListener('refresh', onRefresh)

    const ro = new ResizeObserver(() => {
      loco?.resize()
    })
    ro.observe(shell)

    requestAnimationFrame(() => {
      loco?.resize()
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        setScrollReady(true)
      })
    })

    return () => {
      teardownPageListeners()
      ro.disconnect()
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      if (lenis && lenisScrollHandler) {
        lenis.off('scroll', lenisScrollHandler)
      }
      ScrollTrigger.scrollerProxy(shell, {})
      if (smoothClassName) {
        shell.classList.remove(smoothClassName)
      }
      loco?.destroy()
      loco = null
      setScrollReady(false)
    }
  }, [shellRef, trackRef, reducedMotion, enabled, smoothClassName, pageLenis])

  return enabled && scrollReady
}
