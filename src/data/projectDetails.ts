export type ProjectGalleryItem = {
  src: string
  alt: string
  width?: number
  height?: number
}

export type ProjectPageDetail = {
  role: string
  year: string
  stack: string
  intro: string[]
  highlights: string[]
  /** Optional extra figures after the hero (same aspect not required). */
  gallery?: ProjectGalleryItem[]
}

const westernUnionDesignSystem: ProjectPageDetail = {
  role: 'Product design / design systems',
  year: '2018',
  stack: 'Design tokens, component specs, Sketch/Figma libraries, documentation',
  intro: [
    'This program established a single design language for Western Union’s digital surfaces—web, mobile, and partner-embedded flows—so money-movement journeys stayed recognizable and trustworthy across regions and brands.',
    'Work centered on tokenized foundations (type, spacing, color, elevation) and a tiered component library: primitives, patterns for forms and disclosures, and product-specific assemblies that still composed from the same audited building blocks.',
    'Governance mattered as much as the canvas: contribution models, review gates for breaking changes, and accessibility criteria baked into component acceptance so localized markets could extend the system without fragmenting the experience.',
  ],
  highlights: [
    'Semantic color and motion tokens aligned to compliance-heavy states (success, hold, error, fraud review) instead of one-off hex values per screen.',
    'Documented interaction patterns for high-stakes flows—recipient verification, limits, fee transparency—with variants for dense agent tooling versus consumer self-serve.',
    'Component QA checklist covering keyboard order, screen reader labels, and touch targets for retail and kiosk-adjacent breakpoints.',
    'Versioned library rollout with migration notes so product teams could schedule refactors without blocking seasonal campaigns.',
    'Partner white-label hooks: theme slots and content guidelines so cobranded experiences inherited structure while respecting parent brand constraints.',
  ],
}

const westernUnionCashSendKiosk: ProjectPageDetail = {
  role: 'UX / product design',
  year: '2017',
  stack: 'Retail kiosk UI, hardware constraints, localization',
  intro: [
    'The kiosk experience targets customers who fund a transfer with cash in store: bill insertion, amount confirmation, and handoff to the same compliance steps as digital send—under glare, gloves, and intermittent connectivity.',
    'The flow is deliberately linear with heavy confirmation at cash boundaries: counted total, fee and FX disclosure, and explicit “insert bills” states tied to hardware events so the UI never races ahead of the validator.',
    'Recovery paths are first-class—jammed notes, partial acceptance, timeouts, and agent takeover—so store staff can resolve issues without losing the customer’s intent or forcing a duplicate transaction.',
  ],
  highlights: [
    'Step chrome that mirrors physical sequence: amount due, inserted total, and change due with large numerals and high-contrast states for varied lighting.',
    'Hardware-aware messaging for bill reader busy, retry, and “see associate” escalations with minimal text and icon redundancy for low-literacy audiences.',
    'Localization and right-to-left layouts tested against longest-market copy so buttons and totals do not clip on narrow portrait screens.',
    'Offline-tolerant queueing cues when authorization lags, with clear safe-to-leave messaging versus hard-fail states that require voiding the session.',
    'Accessibility and posture: primary actions in thumb reach zones, timeout extensions for cash counting, and audio-off defaults with optional assistive prompts.',
  ],
  gallery: [
    {
      src: '/media/projects/western-union-cash-send-kiosk-confirmation.png',
      alt: 'Transfer Money confirmation: recipient and delivery summary, totals, exchange rate, and finish actions before printing a receipt.',
      width: 1024,
      height: 856,
    },
  ],
}

export const projectDetailsBySlug: Record<string, ProjectPageDetail> = {
  'western-union-design-system': westernUnionDesignSystem,
  'western-union-cash-send-kiosk': westernUnionCashSendKiosk,
}

export function getProjectDetail(slug: string): ProjectPageDetail | undefined {
  return projectDetailsBySlug[slug]
}
