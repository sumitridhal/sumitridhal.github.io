import imageDimensions from '@/data/image-dimensions.json'

export type ImageKey = keyof typeof imageDimensions

export type ProjectTheme = {
  bg: string
  fg: string
  muted: string
  accent: string
  surface: string
}

export type ProjectDeckMiniCard = {
  label: string
  meta: string
}

export type ProjectDeckCard = {
  id: string
  pill: string
  title: string
  body: string
  chips?: string[]
  miniCards?: ProjectDeckMiniCard[]
  ctaLabel?: string
  /** Short label for the floating HTML preview card on the center list. */
  previewLabel?: string
}

export type ProjectPreviewScene = 'tokens' | 'kiosk'

export type ProjectDeckCards = [ProjectDeckCard, ProjectDeckCard, ProjectDeckCard]

export type Project = {
  id: string
  imageKey: ImageKey
  coverSrc: string
  title: string
  listSubtitle: string
  category: string
  tagline: string
  slug: string
  theme: ProjectTheme
  deckCards: ProjectDeckCards
  previewScene: ProjectPreviewScene
}

export const projects: Project[] = [
  {
    id: 'wu-design-system',
    imageKey: 'project-wu-design-system',
    coverSrc: '/media/projects/western-union-design-system-cover.png',
    title: 'Western Union design system',
    listSubtitle: 'TOKENS • COMPONENTS • GOVERNANCE',
    category: 'Design system',
    tagline:
      'Cross-channel tokens, component libraries, and governance for global money-movement products',
    slug: 'western-union-design-system',
    previewScene: 'tokens',
    theme: {
      bg: '#f5efe3',
      fg: '#251a0f',
      muted: 'rgba(37, 26, 15, 0.62)',
      accent: '#7a5630',
      surface: '#fff9ef',
    },
    deckCards: [
      {
        id: 'wu-ds-meta',
        pill: 'Design system',
        title: 'Program',
        body: 'Program foundations for global money-movement surfaces.',
        chips: ['Tokens', 'Components', 'Governance'],
        previewLabel: 'Governance',
      },
      {
        id: 'wu-ds-features',
        pill: 'Building blocks',
        title: 'Components',
        body: 'Primitives and patterns teams compose without fragmenting the experience.',
        chips: ['Semantic color', 'Motion'],
        miniCards: [
          { label: 'Token library', meta: 'Color · type · spacing' },
          { label: 'Component tiers', meta: 'Primitives → patterns' },
        ],
        previewLabel: 'Token library',
      },
      {
        id: 'wu-ds-hero',
        pill: 'Cross-channel',
        title: 'One system, many markets',
        body: 'Cross-channel tokens, component libraries, and governance for global money-movement products.',
        ctaLabel: 'View case study',
        previewLabel: 'Token rollout',
      },
    ],
  },
  {
    id: 'wu-cash-kiosk',
    imageKey: 'project-wu-cash-kiosk',
    coverSrc: '/media/projects/western-union-cash-send-kiosk-cover.png',
    title: 'Western Union retail kiosk',
    listSubtitle: 'CASH FLOW • HARDWARE • RECOVERY',
    category: 'Retail product',
    tagline:
      'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail',
    slug: 'western-union-cash-send-kiosk',
    previewScene: 'kiosk',
    theme: {
      bg: '#e7efe9',
      fg: '#10241a',
      muted: 'rgba(16, 36, 26, 0.64)',
      accent: '#2a7a5c',
      surface: '#f4fbf7',
    },
    deckCards: [
      {
        id: 'wu-kiosk-meta',
        pill: 'Retail product',
        title: 'In-store',
        body: 'In-store cash send under glare, gloves, and intermittent connectivity.',
        chips: ['Cash flow', 'Hardware', 'Recovery'],
        previewLabel: 'Bill reader',
      },
      {
        id: 'wu-kiosk-features',
        pill: 'In-store flow',
        title: 'Cash flow',
        body: 'Linear steps with confirmation at every cash boundary.',
        chips: ['Bill reader', 'Localization'],
        miniCards: [
          { label: 'Insert bills', meta: 'Validator sync' },
          { label: 'Agent takeover', meta: 'Jam · partial · timeout' },
        ],
        previewLabel: 'Insert bills',
      },
      {
        id: 'wu-kiosk-hero',
        pill: 'Cash-in send',
        title: 'Clear at every step',
        body: 'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail.',
        ctaLabel: 'View case study',
        previewLabel: 'Send confirmation',
      },
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
