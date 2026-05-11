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
    coverSrc: 'https://picsum.photos/seed/agentic-workflow-copilot/1200/800',
    title: 'Agentic Workflow Copilot',
    tagline: 'LLM-assisted automation for enterprise engineering teams',
    slug: 'agentic-workflow-copilot',
  },
  {
    id: 'lattice',
    imageKey: 'project-lattice',
    coverSrc: 'https://picsum.photos/seed/cloud-cost-intelligence/1200/800',
    title: 'Cloud Cost Intelligence',
    tagline: 'FinOps dashboard with predictive alerts and anomaly detection',
    slug: 'cloud-cost-intelligence',
  },
  {
    id: 'signal',
    imageKey: 'project-signal',
    coverSrc: 'https://picsum.photos/seed/aiops-incident-assistant/1200/800',
    title: 'AIOps Incident Assistant',
    tagline:
      'Incident triage and remediation assistant integrated with observability',
    slug: 'aiops-incident-assistant',
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
