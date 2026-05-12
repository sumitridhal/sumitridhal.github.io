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

const cloudCostIntelligence: ProjectPageDetail = {
  role: 'Lead front-end',
  year: '2026',
  stack: 'React, TypeScript, dashboard UI, design tokens',
  intro: [
    'Cloud Cost Intelligence is a FinOps-style command center for turning raw billing and utilization signals into prioritized savings work. The experience anchors on an optimization hub: leadership sees total opportunity at a glance, while practitioners can move from aggregate numbers to concrete resource-level actions without losing context.',
    'The surface is organized around three lenses that mirror how platform teams actually reduce spend—rightsizing workloads that are over-provisioned, reclaiming unused or orphaned assets, and tuning commitments (RIs, savings plans) where coverage lags usage. Each recommendation carries difficulty and impact cues so teams can sequence work across squads instead of chasing the loudest line item on an invoice.',
    'A dense but scannable queue ties the story together: resource identifiers, current versus recommended shapes, estimated monthly savings, and selection for bulk remediation. That pattern supports the real-world loop of discover → review → approve → execute, with enough metadata in the row to justify a change without opening five other tools.',
  ],
  highlights: [
    'Global optimization status with headline potential savings and a bulk-action entry point for large recommendation sets.',
    'Card-based groupings for rightsizing, unused resources, and reservations, each with counts and “view all” paths into the backlog.',
    'Per-item difficulty (low / medium / high) and qualitative tags such as safe-to-delete or high-impact to steer risk appetite.',
    'Account- and date-range-aware chrome so finance and engineering can align on the same slice of the estate before exporting or sharing.',
    'Tabular work queue with utilization context, recommended targets, estimated savings, and row-level selection for controlled rollouts.',
  ],
}

const aiopsIncidentAssistant: ProjectPageDetail = {
  role: 'Lead front-end',
  year: '2026',
  stack: 'React, TypeScript, dashboard UI, design tokens',
  intro: [
    'AIOps Incident Assistant is an incident-command surface for production issues: it keeps responders in one place from first detection through a safe execution path. The layout mirrors how SRE teams actually work—context and impact up top, ranked remediation options in the middle, and evidence (script output, permissions checks, simulated blast radius) where operators can audit before they click approve.',
    'The experience walks a deliberate pipeline—Detected → AI analysis → Dry-run → Execute—so confidence is earned step by step rather than buried in a chat transcript. Recommendations are scored and explained (for example rolling restarts versus horizontal scale) with affordances to preview generated bash and Kubernetes-shaped artifacts, aligning model output with the same primitives engineers already run in production.',
    'Governance is first-class: dual-authorization, an explicit attestation that dry-run results were reviewed, and a single controlled CTA to run the playbook. Historical remediation for the same service grounds the UI in what worked or failed before, and narrative insights connect recurring symptoms back to likely code hotspots—bridging observability, automation, and long-term fixes.',
  ],
  highlights: [
    'Live incident header with environment, timing, and a compact impact readout (error rate delta, affected sessions, service health).',
    'AI-ranked fixes with confidence, plain-language rationale, and actions to preview remediation scripts or inspect YAML before any change.',
    'Embedded terminal-style dry-run output (for example kubectl permission checks and rolling pod rotation) including surfaced warnings such as estimated latency during rotation.',
    'Approve-and-execute rail with dual-auth requirements and a mandatory safety checkbox tied to dry-run review.',
    'Historical playbook outcomes and smart RCA hints that tie repeat patterns to concrete files or controllers for follow-up engineering work.',
  ],
}

const agenticWorkflowCopilot: ProjectPageDetail = {
  role: 'Lead front-end',
  year: '2025',
  stack: 'React, TypeScript, Vercel AI SDK, design tokens',
  intro: [
    'Agentic Workflow Copilot is an enterprise monitoring surface for long-running AI agents: operators see status, current task, and resource load at a glance, then drill into structured reasoning and raw execution logs side by side.',
    'The UI pairs a depth-limited reasoning chain (query → thought → tool execution with confidence hints) with a streaming console so teams can correlate model intent with gateway latency, retrieval, and embedding work—similar to the flows you need when orchestrating sub-agents against SEC filings or other RAG corpora.',
  ],
  highlights: [
    'Orchestration-aware layout: agent id, pause/parameters controls, and step progress for multi-step plans.',
    'Chain-of-thought style timeline with timestamps, intent synthesis, and execution nodes (e.g. parallel scrapers / sub-agents).',
    'Live console with severity-tagged lines, highlighted agent thoughts, and a command line for human-in-the-loop steering.',
    'Observability cues wired into the chrome: uptime, CPU load, LLM cluster handshake, and payload sizes on fetch.',
  ],
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
}

export const projectDetailsBySlug: Record<string, ProjectPageDetail> = {
  'agentic-workflow-copilot': agenticWorkflowCopilot,
  'aiops-incident-assistant': aiopsIncidentAssistant,
  'cloud-cost-intelligence': cloudCostIntelligence,
  'western-union-design-system': westernUnionDesignSystem,
  'western-union-cash-send-kiosk': westernUnionCashSendKiosk,
}

export function getProjectDetail(slug: string): ProjectPageDetail | undefined {
  return projectDetailsBySlug[slug]
}
