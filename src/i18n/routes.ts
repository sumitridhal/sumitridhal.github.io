/** App path helpers (no locale prefix). */

export const hrefHome = '/'

export const hrefAbout = '/about'

export const hrefSections = '/sections'

export const hrefWritings = '/writing'

export const hrefReading = '/reading'

export const hrefExperiments = '/experiments'

export function hrefWriting(slug: string): string {
  return `/writing/${slug}`
}
