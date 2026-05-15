import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

import {
  applyHomeThemeTokens,
  DEFAULT_HOME_THEME,
  type HomeThemeId,
} from '@/utils/homeTheme'
import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type UseHomePanelThemeOptions = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

export function useHomePanelTheme({ rootRef, reducedMotion }: UseHomePanelThemeOptions) {
  useLenisScrollTrigger()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    applyHomeThemeTokens(root, DEFAULT_HOME_THEME)

    const sections = root.querySelectorAll<HTMLElement>('[data-home-theme]')
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

    const triggers: ScrollTrigger[] = []

    sections.forEach((section) => {
      const themeId = section.dataset.homeTheme as HomeThemeId | undefined
      if (!themeId) return

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => applyHomeThemeTokens(root, themeId),
        onEnterBack: () => applyHomeThemeTokens(root, themeId),
      })
      triggers.push(st)
    })

    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(root)

    return () => {
      ro.disconnect()
      triggers.forEach((st) => st.kill())
    }
  }, [rootRef, reducedMotion])
}
