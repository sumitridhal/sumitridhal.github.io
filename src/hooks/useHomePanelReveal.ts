import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'
import { playPanelReveal, resetPanelReveal } from '@/utils/homePanelReveal'

type UseHomePanelRevealOptions = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

/**
 * Media + content enter animations when a home section scrolls into view.
 */
export function useHomePanelReveal({ rootRef, reducedMotion }: UseHomePanelRevealOptions) {
  useLenisScrollTrigger()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const panels = root.querySelectorAll<HTMLElement>('[data-home-panel]')
    if (!panels.length) return

    if (reducedMotion) {
      panels.forEach((panel) => {
        panel.querySelectorAll<HTMLElement>('[data-home-reveal-media]').forEach((el) => {
          el.style.removeProperty('opacity')
          el.style.removeProperty('transform')
        })
        panel.querySelectorAll<HTMLElement>('[data-home-reveal-content], [data-home-reveal]').forEach(
          (el) => {
            el.style.removeProperty('opacity')
            el.style.removeProperty('transform')
          },
        )
      })
      return
    }

    const triggers: ScrollTrigger[] = []

    panels.forEach((panel) => {
      if (panel.id === 'hero') return

      resetPanelReveal(panel)

      const st = ScrollTrigger.create({
        trigger: panel,
        start: 'top 82%',
        onEnter: () => playPanelReveal(panel),
        onEnterBack: () => playPanelReveal(panel),
        onLeave: () => resetPanelReveal(panel),
        onLeaveBack: () => resetPanelReveal(panel),
      })
      triggers.push(st)
    })

    return () => {
      triggers.forEach((st) => st.kill())
    }
  }, [rootRef, reducedMotion])
}
