/** App path helpers (no locale prefix). */

import type { ExperimentKind } from '@/data/experimentsData'

export const hrefHome = '/'

export const hrefAbout = '/about'

export const hrefWritings = '/writing'

export const hrefExperiments = '/experiments'

export function hrefExperimentsSection(kind: ExperimentKind): string {
  return `${hrefExperiments}#${kind}`
}

export function hrefWork(projectSlug: string): string {
  return `/work/${projectSlug}`
}

export function hrefWriting(slug: string): string {
  return `/writing/${slug}`
}
