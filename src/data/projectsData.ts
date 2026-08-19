import imageDimensions from '@/data/image-dimensions.json'
import { workEntries } from '@/data/workRegistry'
import type { WorkMeta } from '@/data/workTypes'

export type ImageKey = keyof typeof imageDimensions

export type Project = {
  id: string
  imageKey: ImageKey
  coverSrc: string
  title: string
  category: string
  tagline: string
  slug: string
}

function workMetaToProject(meta: WorkMeta): Project {
  return {
    id: meta.id,
    imageKey: meta.imageKey as ImageKey,
    coverSrc: meta.coverSrc,
    title: meta.title,
    category: meta.category,
    tagline: meta.tagline,
    slug: meta.id,
  }
}

/** Legacy TypeScript catalog entries (pre-MDX case studies). */
const legacyProjects: Project[] = [
  {
    id: 'wu-design-system',
    imageKey: 'project-wu-design-system',
    coverSrc: '/media/projects/western-union-design-system-cover.png',
    title: 'Western Union design system',
    category: 'Design system',
    tagline:
      'Cross-channel tokens, component libraries, and governance for global money-movement products',
    slug: 'western-union-design-system',
  },
  {
    id: 'wu-cash-kiosk',
    imageKey: 'project-wu-cash-kiosk',
    coverSrc: '/media/projects/western-union-cash-send-kiosk-cover.png',
    title: 'Western Union retail kiosk',
    category: 'Retail product',
    tagline:
      'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail',
    slug: 'western-union-cash-send-kiosk',
  },
]

/** MDX case studies first, then legacy TS-backed pages. */
export const projects: Project[] = [
  ...workEntries.map((e) => workMetaToProject(e.meta)),
  ...legacyProjects,
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
