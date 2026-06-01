export type HeroFloaterId =
  | 'principal'
  | 'engineer'
  | 'aiWorkflows'
  | 'react18'
  | 'nodejs'
  | 'amp'
  | 'kubernetes'
  | 'redHat'
  | 'vercelAiSdk'
  | 'productionUx'
  | 'performance'
  | 'platforms'
  | 'reliability'
  | 'delivery'
  | 'shipOnTime'
  | 'agenticSystems'
  | 'enterpriseScale'
  | 'mentoring'
  | 'communities'
  | 'deploymentStat'
  | 'usersStat'
  | 'engineering'
  | 'leadership'
  | 'clarity'
  | 'execution'
  | 'automate'
  | 'iterate'

export type HeroFloaterZone = 'leadership' | 'platform' | 'delivery' | 'craft'
export type HeroFloaterTier = 'primary' | 'secondary' | 'ghost'

export type HeroFloaterLayoutEntry = {
  floaterId: HeroFloaterId
  zone: HeroFloaterZone
  tier: HeroFloaterTier
  top: string
  left?: string
  right?: string
  /** Shown on viewports below 768px (subset of desktop layout). */
  mobile?: boolean
  /** Enables per-letter intro GSAP on mount. */
  letterIntro?: boolean
}

/** Desktop + mobile floater positions (letter fragments removed). */
export const HERO_FLOATER_LAYOUT: HeroFloaterLayoutEntry[] = [
  // Top arc — leadership / platform
  { floaterId: 'principal', zone: 'leadership', tier: 'primary', top: '6%', left: '6%', mobile: true },
  { floaterId: 'engineer', zone: 'leadership', tier: 'secondary', top: '6%', left: '22%' },
  { floaterId: 'aiWorkflows', zone: 'platform', tier: 'primary', top: '6%', left: '38%', mobile: true },
  { floaterId: 'react18', zone: 'craft', tier: 'secondary', top: '6%', left: '54%' },
  { floaterId: 'nodejs', zone: 'platform', tier: 'primary', top: '6%', left: '68%', mobile: true },
  { floaterId: 'kubernetes', zone: 'platform', tier: 'secondary', top: '6%', right: '6%' },
  { floaterId: 'redHat', zone: 'leadership', tier: 'ghost', top: '12%', left: '10%' },
  { floaterId: 'vercelAiSdk', zone: 'craft', tier: 'secondary', top: '12%', left: '42%' },
  { floaterId: 'productionUx', zone: 'craft', tier: 'primary', top: '12%', right: '12%', mobile: true },
  { floaterId: 'performance', zone: 'platform', tier: 'ghost', top: '18%', left: '8%' },
  { floaterId: 'platforms', zone: 'platform', tier: 'secondary', top: '18%', left: '32%', mobile: true },
  { floaterId: 'reliability', zone: 'platform', tier: 'secondary', top: '18%', right: '28%' },
  { floaterId: 'delivery', zone: 'delivery', tier: 'ghost', top: '18%', right: '8%' },
  // Side bands — craft / tools
  { floaterId: 'agenticSystems', zone: 'craft', tier: 'secondary', top: '38%', left: '4%', mobile: true },
  { floaterId: 'enterpriseScale', zone: 'platform', tier: 'secondary', top: '38%', right: '4%', mobile: true },
  { floaterId: 'mentoring', zone: 'leadership', tier: 'ghost', top: '48%', left: '6%' },
  { floaterId: 'communities', zone: 'leadership', tier: 'ghost', top: '48%', right: '6%' },
  { floaterId: 'shipOnTime', zone: 'delivery', tier: 'primary', top: '42%', right: '5%', letterIntro: true },
  { floaterId: 'amp', zone: 'craft', tier: 'ghost', top: '52%', left: '48%' },
  // Bottom arc — outcomes
  { floaterId: 'deploymentStat', zone: 'delivery', tier: 'primary', top: '72%', left: '14%', mobile: true },
  { floaterId: 'usersStat', zone: 'delivery', tier: 'primary', top: '72%', right: '14%', mobile: true },
  { floaterId: 'engineering', zone: 'craft', tier: 'secondary', top: '78%', left: '8%', mobile: true },
  { floaterId: 'leadership', zone: 'leadership', tier: 'secondary', top: '78%', left: '32%' },
  { floaterId: 'clarity', zone: 'delivery', tier: 'ghost', top: '78%', left: '58%' },
  { floaterId: 'execution', zone: 'delivery', tier: 'secondary', top: '78%', right: '8%', mobile: true },
  { floaterId: 'automate', zone: 'craft', tier: 'ghost', top: '86%', left: '22%' },
  { floaterId: 'iterate', zone: 'delivery', tier: 'primary', top: '86%', right: '22%', mobile: true },
]

export const HERO_FLOATER_IDS: HeroFloaterId[] = Array.from(
  new Set(HERO_FLOATER_LAYOUT.map((e) => e.floaterId)),
)

/** Vertical scan-grid tick count (center-weighted heights applied in SCSS). */
export const HERO_SCAN_GRID_TICK_COUNT = 28

/** Tick indices that show a directional marker (▸). */
export const HERO_SCAN_GRID_MARKER_INDICES = [3, 7, 11, 15, 19, 23, 27]
