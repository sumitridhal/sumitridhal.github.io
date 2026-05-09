import imageDimensions from '@/data/image-dimensions.json'
import type { Locale } from '@/i18n/routes'

export type ImageKey = keyof typeof imageDimensions

export type Project = {
  id: string
  imageKey: ImageKey
  coverSrc: string
  title: Record<Locale, string>
  tagline: Record<Locale, string>
  slug: Record<Locale, string>
}

export const projects: Project[] = [
  {
    id: 'nebula',
    imageKey: 'project-nebula',
    coverSrc: 'https://picsum.photos/seed/agentic-workflow-copilot/1200/800',
    title: {
      en: 'Agentic Workflow Copilot',
      de: 'Agentischer Workflow Copilot',
      fr: 'Copilote de workflow agentique',
      hi: 'एजेंटिक वर्कफ़्लो कोपायलट',
    },
    tagline: {
      en: 'LLM-assisted automation for enterprise engineering teams',
      de: 'LLM-gestuetzte Automatisierung fuer Enterprise-Engineering-Teams',
      fr: 'Automatisation assistee par LLM pour les equipes ingenierie',
      hi: 'एंटरप्राइज इंजीनियरिंग टीमों के लिए LLM-सहायित ऑटोमेशन',
    },
    slug: {
      en: 'agentic-workflow-copilot',
      de: 'agentischer-workflow-copilot',
      fr: 'agentic-workflow-copilot',
      hi: 'agentic-workflow-copilot',
    },
  },
  {
    id: 'lattice',
    imageKey: 'project-lattice',
    coverSrc: 'https://picsum.photos/seed/cloud-cost-intelligence/1200/800',
    title: {
      en: 'Cloud Cost Intelligence',
      de: 'Cloud Cost Intelligence',
      fr: 'Intelligence des couts cloud',
      hi: 'क्लाउड कॉस्ट इंटेलिजेंस',
    },
    tagline: {
      en: 'FinOps dashboard with predictive alerts and anomaly detection',
      de: 'FinOps-Dashboard mit Praediktionswarnungen und Anomalieerkennung',
      fr: 'Tableau FinOps avec alertes predictives et detection d\'anomalies',
      hi: 'पूर्वानुमानी अलर्ट और एनॉमली डिटेक्शन के साथ FinOps डैशबोर्ड',
    },
    slug: {
      en: 'cloud-cost-intelligence',
      de: 'cloud-cost-intelligence',
      fr: 'cloud-cost-intelligence',
      hi: 'cloud-cost-intelligence',
    },
  },
  {
    id: 'signal',
    imageKey: 'project-signal',
    coverSrc: 'https://picsum.photos/seed/aiops-incident-assistant/1200/800',
    title: {
      en: 'AIOps Incident Assistant',
      de: 'AIOps Incident Assistant',
      fr: 'Assistant d\'incidents AIOps',
      hi: 'AIOps इंसिडेंट असिस्टेंट',
    },
    tagline: {
      en: 'Incident triage and remediation assistant integrated with observability',
      de: 'Assistent fuer Incident-Triage und Remediation mit Observability-Integration',
      fr: 'Tri et remediation d\'incidents integres a l\'observabilite',
      hi: 'ऑब्ज़र्वेबिलिटी के साथ इंसिडेंट ट्रायेज और रिमेडिएशन असिस्टेंट',
    },
    slug: {
      en: 'aiops-incident-assistant',
      de: 'aiops-incident-assistant',
      fr: 'aiops-incident-assistant',
      hi: 'aiops-incident-assistant',
    },
  },
]

export function getProjectBySlug(
  locale: Locale,
  slug: string,
): Project | undefined {
  return projects.find((p) => p.slug[locale] === slug)
}

export function resolveProjectSlug(
  locale: Locale,
  slug: string,
): Project | undefined {
  return (
    projects.find((p) => p.slug[locale] === slug) ??
    projects.find((p) => Object.values(p.slug).includes(slug))
  )
}
