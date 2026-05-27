import imageDimensions from '@/data/image-dimensions.json'

export type ImageKey = keyof typeof imageDimensions

export type ProjectTheme = {
  bg: string
  fg: string
  muted: string
  accent: string
  surface: string
}

export type DeckCardLayout =
  | 'activity-feed'
  | 'registry-list'
  | 'locale-orbit'
  | 'spotlight-hero'
  | 'cash-form'
  | 'support-stat'
  | 'spec-template'

export type ActivityRow = {
  brand: string
  action: string
  synced: string
  delta: string
}

export type RegistryRow = {
  initials: string
  name: string
  meta: string
  code: string
}

export type FormField = {
  icon: 'card' | 'layers'
  label: string
  trailing: 'plus' | 'chevron'
}

export type SpecMetaRow = {
  icon: 'calendar' | 'briefcase'
  label: string
  value: string
}

export type SpecSection = {
  label: string
  body: string
}

export type BentoTile =
  | {
      kind: 'amount'
      title: string
      subtitle: string
      amount: string
    }
  | {
      kind: 'activity'
      brand: string
      action: string
      synced: string
      delta: string
    }
  | {
      kind: 'status'
      label: string
      value: string
      tone?: 'ok' | 'warn'
    }

export type LocaleOrbitData = {
  pill: string
  heading: string
  body: string
  markets: string[]
}

export type SpotlightHeroData = {
  pill: string
  title: string
  body: string
  badgeLabel: string
}

export type CashFormData = {
  title: string
  subtitle: string
  amount: string
  fields: FormField[]
  ctaLabel: string
  footer: string
}

export type SupportStatData = {
  stat: string
  footer: string
}

export type SpecTemplateData = {
  iconLabel: string
  title: string
  description: string
  meta: SpecMetaRow[]
  sections: SpecSection[]
}

export type ProjectDeckCard = {
  id: string
  pill: string
  title: string
  body: string
  layout: DeckCardLayout
  activityRows?: ActivityRow[]
  registryRows?: RegistryRow[]
  localeOrbit?: LocaleOrbitData
  spotlight?: SpotlightHeroData
  cashForm?: CashFormData
  supportStat?: SupportStatData
  specTemplate?: SpecTemplateData
}

export type ProjectDeckCards = [ProjectDeckCard, ProjectDeckCard, ProjectDeckCard]

export type ProjectCenterVariant = 'list-picker' | 'bento'

export type LocaleFloatData = {
  pill: string
  heading: string
  caption: string
  markets: string[]
}

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
  centerVariant: ProjectCenterVariant
  localeFloat?: LocaleFloatData
  bentoTiles?: BentoTile[]
  deckCards: ProjectDeckCards
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
    centerVariant: 'list-picker',
    localeFloat: {
      pill: 'CROSS-MARKET',
      heading: '40+ locales',
      caption: 'Semantic tokens per corridor',
      markets: ['US', 'MX', 'IN', 'PH', 'EU'],
    },
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
        layout: 'activity-feed',
        activityRows: [
          {
            brand: 'Design tokens',
            action: 'Sync',
            synced: 'Last synced: 12 mins ago',
            delta: 'v3.2',
          },
          {
            brand: 'Figma library',
            action: 'Publish',
            synced: 'Last synced: 1 hr ago',
            delta: '+48',
          },
          {
            brand: 'Governance',
            action: 'Review',
            synced: 'Last synced: Today',
            delta: 'Open',
          },
        ],
      },
      {
        id: 'wu-ds-features',
        pill: 'Building blocks',
        title: 'Components',
        body: 'Primitives and patterns teams compose without fragmenting the experience.',
        layout: 'registry-list',
        registryRows: [
          {
            initials: 'TL',
            name: 'Token library',
            meta: 'Color · type · spacing',
            code: 'DS-1042',
          },
          {
            initials: 'CT',
            name: 'Component tiers',
            meta: 'Primitives → patterns',
            code: 'DS-2088',
          },
          {
            initials: 'GV',
            name: 'Governance board',
            meta: 'Approvals · changelog',
            code: 'DS-3011',
          },
        ],
      },
      {
        id: 'wu-ds-hero',
        pill: 'Cross-channel',
        title: 'One system',
        body: 'Cross-channel tokens, component libraries, and governance for global money-movement products.',
        layout: 'locale-orbit',
        localeOrbit: {
          pill: 'CROSS-MARKET',
          heading: '40+ locales',
          body: 'Semantic color, type, and motion tokens tuned per corridor—one library, many markets.',
          markets: ['US', 'MX', 'IN', 'PH', 'EU', 'UK'],
        },
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
    centerVariant: 'bento',
    bentoTiles: [
      {
        kind: 'amount',
        title: 'Cash send',
        subtitle: 'In-store kiosk',
        amount: '$240.00',
      },
      {
        kind: 'activity',
        brand: 'Bill reader',
        action: 'Insert',
        synced: 'Last synced: 2 mins ago',
        delta: '+$40',
      },
      {
        kind: 'status',
        label: 'Hardware',
        value: 'Validator online',
        tone: 'ok',
      },
    ],
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
        layout: 'activity-feed',
        activityRows: [
          {
            brand: 'Bill reader',
            action: 'Insert',
            synced: 'Last synced: 2 mins ago',
            delta: '+$40',
          },
          {
            brand: 'Send flow',
            action: 'Confirm',
            synced: 'Last synced: 5 mins ago',
            delta: 'Ready',
          },
          {
            brand: 'Agent desk',
            action: 'Standby',
            synced: 'Last synced: Live',
            delta: 'Online',
          },
        ],
      },
      {
        id: 'wu-kiosk-features',
        pill: 'In-store flow',
        title: 'Cash flow',
        body: 'Linear steps with confirmation at every cash boundary.',
        layout: 'registry-list',
        registryRows: [
          {
            initials: 'IB',
            name: 'Insert bills',
            meta: 'Validator sync',
            code: 'K-4401',
          },
          {
            initials: 'VL',
            name: 'Verify limits',
            meta: 'Corridor rules',
            code: 'K-4408',
          },
          {
            initials: 'AT',
            name: 'Agent takeover',
            meta: 'Jam · partial · timeout',
            code: 'K-4412',
          },
        ],
      },
      {
        id: 'wu-kiosk-hero',
        pill: 'Cash-in send',
        title: 'Clear at every step',
        body: 'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail.',
        layout: 'cash-form',
        cashForm: {
          title: 'Cash send',
          subtitle: 'In-store kiosk flow',
          amount: '240.00',
          fields: [
            { icon: 'card', label: 'Insert bills', trailing: 'plus' },
            { icon: 'layers', label: 'Select corridor', trailing: 'chevron' },
          ],
          ctaLabel: 'Confirm send',
          footer: 'Validated at every cash boundary.',
        },
      },
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
