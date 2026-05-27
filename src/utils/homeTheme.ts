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
    bgSolid: '#fdf7f3',
    fg: '#2a2330',
    fgMuted: 'rgba(42, 35, 48, 0.72)',
    accent: '#8d7399',
    border: 'rgba(42, 35, 48, 0.14)',
  },
  experiments: {
    bgSolid: '#f5f9ff',
    fg: '#1f2a3a',
    fgMuted: 'rgba(31, 42, 58, 0.72)',
    accent: '#5f8bb2',
    border: 'rgba(31, 42, 58, 0.14)',
  },
  work: {
    bgSolid: '#f8f6ff',
    fg: '#29233d',
    fgMuted: 'rgba(41, 35, 61, 0.72)',
    accent: '#7c70b3',
    border: 'rgba(41, 35, 61, 0.14)',
  },
  writings: {
    bgSolid: '#fef7f1',
    fg: '#342722',
    fgMuted: 'rgba(52, 39, 34, 0.72)',
    accent: '#b57d63',
    border: 'rgba(52, 39, 34, 0.14)',
  },
  talks: {
    bgSolid: '#f4fbf7',
    fg: '#1d352f',
    fgMuted: 'rgba(29, 53, 47, 0.72)',
    accent: '#4c9a8d',
    border: 'rgba(29, 53, 47, 0.14)',
  },
  books: {
    bgSolid: '#fff9ef',
    fg: '#3a2f1f',
    fgMuted: 'rgba(58, 47, 31, 0.72)',
    accent: '#b9934b',
    border: 'rgba(58, 47, 31, 0.14)',
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
