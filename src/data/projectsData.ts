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
    id: 'wu-design-system',
    imageKey: 'project-wu-design-system',
    coverSrc: '/media/projects/western-union-design-system-cover.png',
    title: 'Western Union design system',
    tagline:
      'Cross-channel tokens, component libraries, and governance for global money-movement products',
    slug: 'western-union-design-system',
  },
  {
    id: 'wu-cash-kiosk',
    imageKey: 'project-wu-cash-kiosk',
    coverSrc: '/media/projects/western-union-cash-send-kiosk-cover.png',
    title: 'Western Union retail kiosk',
    tagline:
      'Cash-in send flow for in-store kiosks: limits, validation, and clear recovery when hardware or networks fail',
    slug: 'western-union-cash-send-kiosk',
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
