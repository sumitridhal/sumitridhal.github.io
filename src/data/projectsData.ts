import imageDimensions from '@/data/image-dimensions.json'

export type ImageKey = keyof typeof imageDimensions

export type Project = {
  id: string
  imageKey: ImageKey
  coverSrc: string
  title: string
  tagline: string
  slug: string
}

export const projects: Project[] = [
  {
    id: 'nebula',
    imageKey: 'project-nebula',
    coverSrc: '/work/agentic-workflow-copilot-dashboard.png',
    title: 'Agentic Workflow Copilot',
    tagline: 'LLM-assisted automation for enterprise engineering teams',
    slug: 'agentic-workflow-copilot',
  },
  {
    id: 'lattice',
    imageKey: 'project-lattice',
    coverSrc: '/work/cloud-cost-intelligence-dashboard.png',
    title: 'Cloud Cost Intelligence',
    tagline:
      'FinOps optimization hub: savings discovery, impact scoring, and a remediation-ready work queue',
    slug: 'cloud-cost-intelligence',
  },
  {
    id: 'signal',
    imageKey: 'project-signal',
    coverSrc: '/work/aiops-incident-assistant-dashboard.png',
    title: 'AIOps Incident Assistant',
    tagline:
      'Incident command for AI-ranked playbooks, transparent dry-runs, and governed execution',
    slug: 'aiops-incident-assistant',
  },
  {
    id: 'wu-design-system',
    imageKey: 'project-wu-design-system',
    coverSrc: '/work/western-union-design-system-cover.png',
    title: 'Western Union design system',
    tagline:
      'Cross-channel tokens, component libraries, and governance for global money-movement products',
    slug: 'western-union-design-system',
  },
  {
    id: 'wu-cash-kiosk',
    imageKey: 'project-wu-cash-kiosk',
    coverSrc: '/work/western-union-cash-send-kiosk-cover.png',
    title: 'Western Union retail kiosk',
    tagline:
      'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail',
    slug: 'western-union-cash-send-kiosk',
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
