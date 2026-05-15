export type HomeThemeId = 'hero' | 'experiments' | 'work' | 'writings' | 'talks' | 'books'

export type HomeThemeTokens = {
  bg: string
  fg: string
  fgMuted: string
  accent: string
  border: string
}

export const HOME_THEMES: Record<HomeThemeId, HomeThemeTokens> = {
  hero: {
    bg: 'linear-gradient(165deg, #023218 0%, #033f21 58%, #032f19 100%)',
    fg: '#e7f5eb',
    fgMuted: 'rgba(214, 235, 224, 0.82)',
    accent: '#74c2a0',
    border: 'rgba(226, 243, 231, 0.24)',
  },
  experiments: {
    bg: 'linear-gradient(155deg, #e8f5ee 0%, #d4ebe0 45%, #b8dcc8 100%)',
    fg: '#0f0e0c',
    fgMuted: 'rgba(20, 18, 16, 0.72)',
    accent: '#2a7a5c',
    border: 'rgba(20, 18, 16, 0.12)',
  },
  work: {
    bg: 'linear-gradient(150deg, #f4efe6 0%, #e6ddd0 55%, #d8cfc0 100%)',
    fg: '#141210',
    fgMuted: 'rgba(20, 18, 16, 0.65)',
    accent: '#1f6b4a',
    border: 'rgba(20, 18, 16, 0.14)',
  },
  writings: {
    bg: 'linear-gradient(165deg, #0a2818 0%, #0d3d24 50%, #062a17 100%)',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#5bc0be',
    border: 'rgba(232, 236, 244, 0.24)',
  },
  talks: {
    bg: 'linear-gradient(160deg, #0c3220 0%, #134a30 55%, #0a2618 100%)',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#5bc0be',
    border: 'rgba(232, 236, 244, 0.24)',
  },
  books: {
    bg: 'linear-gradient(155deg, #1e2a1a 0%, #2d3e27 40%, #033b1f 100%)',
    fg: '#e8ecf4',
    fgMuted: 'rgba(232, 236, 244, 0.78)',
    accent: '#e9b858',
    border: 'rgba(232, 236, 244, 0.2)',
  },
}

export const DEFAULT_HOME_THEME: HomeThemeId = 'hero'

export function applyHomeThemeTokens(root: HTMLElement, themeId: HomeThemeId) {
  const tokens = HOME_THEMES[themeId]
  root.style.setProperty('--home-bg', tokens.bg)
  root.style.setProperty('--home-fg', tokens.fg)
  root.style.setProperty('--home-fg-muted', tokens.fgMuted)
  root.style.setProperty('--home-accent', tokens.accent)
  root.style.setProperty('--home-border', tokens.border)
  root.dataset.homeActiveTheme = themeId
}
