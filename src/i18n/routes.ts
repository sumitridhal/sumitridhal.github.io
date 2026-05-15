/** App path helpers (no locale prefix). */

export const hrefHome = '/'

export const hrefAbout = '/about'

export const hrefSections = '/sections'

export const hrefWritings = '/writing'

export function hrefWork(projectSlug: string): string {
  return `/work/${projectSlug}`
}

export function hrefWriting(slug: string): string {
  return `/writing/${slug}`
}
