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
    bgSolid: '#033220',
    fg: '#e7f5eb',
    fgMuted: 'rgba(214, 235, 224, 0.82)',
    accent: '#74c2a0',
    border: 'rgba(226, 243, 231, 0.24)',
  },
  experiments: {
    bgSolid: '#d6ebe1',
    fg: '#0f0e0c',
    fgMuted: 'rgba(20, 18, 16, 0.72)',
    accent: '#2a7a5c',
    border: 'rgba(20, 18, 16, 0.12)',
  },
  work: {
    bgSolid: '#ebe5da',
    fg: '#141210',
    fgMuted: 'rgba(20, 18, 16, 0.65)',
    accent: '#1f6b4a',
    border: 'rgba(20, 18, 16, 0.14)',
  },
  writings: {
    bgSolid: '#0d3020',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#5bc0be',
    border: 'rgba(232, 236, 244, 0.24)',
  },
  talks: {
    bgSolid: '#0f3624',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#5bc0be',
    border: 'rgba(232, 236, 244, 0.24)',
  },
  books: {
    bgSolid: '#243528',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#e9b858',
    border: 'rgba(232, 236, 244, 0.2)',
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
  const from = HOME_THEMES[fromId]
  const to = HOME_THEMES[toId]

  if (fromId === toId || t <= 0) {
    applyHomeThemeTokens(root, fromId)
    return
  }

  if (t >= 1) {
    applyHomeThemeTokens(root, toId)
    return
  }

  const mix = gsap.utils.interpolate
  setHomeThemeVars(
    root,
    {
      bgSolid: mix(from.bgSolid, to.bgSolid)(t),
      fg: mix(from.fg, to.fg)(t),
      fgMuted: mix(from.fgMuted, to.fgMuted)(t),
      accent: mix(from.accent, to.accent)(t),
      border: mix(from.border, to.border)(t),
    },
    `${fromId}+${toId}`,
  )
}
