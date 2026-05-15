import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

type UseCoverScrollShellOptions = {
  shellRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLElement | null>
  cssVarName: string
  reducedMotion: boolean
  /** Class added to shell while Locomotive smooth scroll is active. */
  smoothClassName?: string
  /** Pause page Lenis while the shell is hovered or focused. */
  pageLenis?: { stop: () => void; start: () => void } | null
}

/**
 * Part 3 cover scroll: vertical shell scroll maps to a 0…1 CSS variable over one viewport height.
 */
export function useCoverScrollShell({
  shellRef,
  trackRef,
  cssVarName,
  reducedMotion,
  smoothClassName,
  pageLenis,
}: UseCoverScrollShellOptions) {
  useLayoutEffect(() => {
    const shell = shellRef.current
    const track = trackRef.current
    if (!shell || !track) return

    const setCoverFromScroll = (scroll: number) => {
      const h = Math.max(32, shell.clientHeight)
      const p = Math.min(1, Math.max(0, scroll / h))
      shell.style.setProperty(cssVarName, String(p))
    }

    const pausePageScroll = () => pageLenis?.stop()
    const resumePageScroll = () => pageLenis?.start()

    if (pageLenis) {
      shell.addEventListener('mouseenter', pausePageScroll)
      shell.addEventListener('mouseleave', resumePageScroll)
      shell.addEventListener('focusin', pausePageScroll)
      shell.addEventListener('focusout', resumePageScroll)
    }

    if (reducedMotion) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: track,
          scroller: shell,
          start: 'top top',
          end: () => `+=${Math.max(32, shell.clientHeight)}`,
          scrub: 0,
          invalidateOnRefresh: true,
          onUpdate(self) {
            shell.style.setProperty(cssVarName, String(self.progress))
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
        if (pageLenis) {
          shell.removeEventListener('mouseenter', pausePageScroll)
          shell.removeEventListener('mouseleave', resumePageScroll)
          shell.removeEventListener('focusin', pausePageScroll)
          shell.removeEventListener('focusout', resumePageScroll)
          pageLenis.start()
        }
        ro.disconnect()
        ctx.revert()
        shell.style.removeProperty(cssVarName)
      }
    }

    if (smoothClassName) {
      shell.classList.add(smoothClassName)
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
      if (pageLenis) {
        shell.removeEventListener('mouseenter', pausePageScroll)
        shell.removeEventListener('mouseleave', resumePageScroll)
        shell.removeEventListener('focusin', pausePageScroll)
        shell.removeEventListener('focusout', resumePageScroll)
        pageLenis.start()
      }
      ro.disconnect()
      if (smoothClassName) {
        shell.classList.remove(smoothClassName)
      }
      loco.destroy()
      shell.style.removeProperty(cssVarName)
    }
  }, [shellRef, trackRef, cssVarName, reducedMotion, smoothClassName, pageLenis])
}
