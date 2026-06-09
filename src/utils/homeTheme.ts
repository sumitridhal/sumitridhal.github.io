export type HomeThemeId = 'hero' | 'experiments' | 'work' | 'writings' | 'talks' | 'books'

import gsap from 'gsap'

export type HomeThemeTokens = {
  /** Solid backdrop color for scroll blending (fixed page wash). */
  bgSolid: string
  fg: string
  fgMuted: string
  accent: string
  border: string
}

export const HOME_THEMES: Record<HomeThemeId, HomeThemeTokens> = {
  hero: {
    bgSolid: '#1e2a1a',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.7)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
  experiments: {
    bgSolid: '#202d1c',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.68)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
  work: {
    bgSolid: '#182316',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.68)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
  writings: {
    bgSolid: '#1e2a1a',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.7)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
  talks: {
    bgSolid: '#22301f',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.68)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
  books: {
    bgSolid: '#1b2718',
    fg: '#f2f5ff',
    fgMuted: 'rgba(232, 236, 244, 0.7)',
    accent: '#e9b858',
    border: 'rgba(233, 184, 88, 0.2)',
  },
}

export const DEFAULT_HOME_THEME: HomeThemeId = 'hero'

function setHomeThemeVars(
  root: HTMLElement,
  tokens: HomeThemeTokens,
  themeId: HomeThemeId | `${HomeThemeId}+${HomeThemeId}`,
) {
  root.style.setProperty('--home-bg', tokens.bgSolid)
  root.style.setProperty('--home-fg', tokens.fg)
  root.style.setProperty('--home-fg-muted', tokens.fgMuted)
  root.style.setProperty('--home-accent', tokens.accent)
  root.style.setProperty('--home-border', tokens.border)
  root.dataset.homeActiveTheme = themeId
}

export function applyHomeThemeTokens(root: HTMLElement, themeId: HomeThemeId) {
  setHomeThemeVars(root, HOME_THEMES[themeId], themeId)
}

export function blendHomeThemeTokens(
  root: HTMLElement,
  fromId: HomeThemeId,
  toId: HomeThemeId,
  progress: number,
) {
  const t = gsap.utils.clamp(0, 1, progress)
  const easedT = gsap.parseEase('sine.inOut')(t)
  const from = HOME_THEMES[fromId]
  const to = HOME_THEMES[toId]

  if (fromId === toId || easedT <= 0) {
    applyHomeThemeTokens(root, fromId)
    return
  }

  if (easedT >= 1) {
    applyHomeThemeTokens(root, toId)
    return
  }

  const mix = gsap.utils.interpolate
  setHomeThemeVars(
    root,
    {
      bgSolid: mix(from.bgSolid, to.bgSolid)(easedT),
      fg: mix(from.fg, to.fg)(easedT),
      fgMuted: mix(from.fgMuted, to.fgMuted)(easedT),
      accent: mix(from.accent, to.accent)(easedT),
      border: mix(from.border, to.border)(easedT),
    },
    `${fromId}+${toId}`,
  )
}
