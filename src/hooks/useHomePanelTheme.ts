import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

import {
  applyHomeThemeTokens,
  blendHomeThemeTokens,
  DEFAULT_HOME_THEME,
  type HomeThemeId,
} from '@/utils/homeTheme'
import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type UseHomePanelThemeOptions = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

const THEME_BLEND_SCRUB = 0.65
const THEME_ENTER_END = 'top 34%'
const THEME_HOLD_START = 'top 34%'
const THEME_HOLD_END = 'bottom 66%'

export function useHomePanelTheme({ rootRef, reducedMotion }: UseHomePanelThemeOptions) {
  useLenisScrollTrigger()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    applyHomeThemeTokens(root, DEFAULT_HOME_THEME)

    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-home-theme]'))
    if (!sections.length) return

    if (reducedMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
          const theme = (visible?.target as HTMLElement | undefined)?.dataset.homeTheme as
            | HomeThemeId
            | undefined
          if (theme) applyHomeThemeTokens(root, theme)
        },
        { threshold: [0.35, 0.5, 0.65] },
      )
      sections.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }

    const themes = sections.map(
      (section) => section.dataset.homeTheme as HomeThemeId,
    )
    const triggers: ScrollTrigger[] = []

    sections.forEach((section, index) => {
      const current = themes[index]!
      const previous = themes[Math.max(0, index - 1)]!

      if (index > 0) {
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: THEME_ENTER_END,
            scrub: THEME_BLEND_SCRUB,
            onUpdate: (self) => blendHomeThemeTokens(root, previous, current, self.progress),
          }),
        )
      }

      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: THEME_HOLD_START,
          end: THEME_HOLD_END,
          onEnter: () => applyHomeThemeTokens(root, current),
          onEnterBack: () => applyHomeThemeTokens(root, current),
        }),
      )
    })

    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(root)

    return () => {
      ro.disconnect()
      triggers.forEach((st) => st.kill())
    }
  }, [rootRef, reducedMotion])
}
