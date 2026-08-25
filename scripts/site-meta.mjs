/**
 * Shared build-time metadata for social link previews.
 *
 * Consumed by `scripts/emit-social-html.mjs` (emits per-route static HTML after
 * `vite build`) and `scripts/generate-social-images.mjs` (renders the 1200x630
 * card variants). Nothing here ships to the client bundle.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const repoRoot = path.resolve(__dirname, '..')
export const writingsDir = path.join(repoRoot, 'src/content/writings')
export const publicDir = path.join(repoRoot, 'public')
export const distDir = path.join(repoRoot, 'dist')

/**
 * Deployed origin. This is a GitHub Pages *user* site (repo `0xTHAC0.github.io`,
 * no `CNAME`, no Vite `base`), so the origin is the lowercased owner domain and
 * the app is served from the root path. Change this one constant if the site
 * ever moves to a custom domain or a project subpath.
 */
export const SITE_ORIGIN = 'https://0xthac0.github.io'

export const SITE_NAME = '0xthac0'
export const SITE_TITLE = '0xthac0 | Portfolio'
export const SITE_DESCRIPTION =
  'Engineer, systems thinker, and interface craftsperson. Product systems, resilient frontends, shaders, and AI-assisted workflows — written up with an editorial eye.'
export const TWITTER_CARD = 'summary_large_image'

/** Derived 1200x630 social cards live here; source art in `media/writings` is never touched. */
export const SOCIAL_IMAGE_DIR = 'media/social'
export const DEFAULT_SOCIAL_IMAGE = `/${SOCIAL_IMAGE_DIR}/default.jpg`
export const SOCIAL_IMAGE_WIDTH = 1200
export const SOCIAL_IMAGE_HEIGHT = 630

/** Replaced wholesale, per route, by the post-build emitter. */
export const META_MARKER_START = '<!-- social-meta:start -->'
export const META_MARKER_END = '<!-- social-meta:end -->'

/**
 * Non-post routes that get their own static HTML entry with tailored defaults.
 * Post routes are discovered from the MDX directory, so new articles need no edit here.
 */
export const ROUTE_META = [
  { route: '/', title: SITE_TITLE, description: SITE_DESCRIPTION },
  {
    route: '/about',
    title: `About | ${SITE_NAME}`,
    description: 'Engineer and writer exploring ideas through software, notes, and experiments.',
  },
  {
    route: '/writing',
    title: `Writing | ${SITE_NAME}`,
    description:
      'Notes on shaders, creative coding, frontend architecture, and the workflows around building software.',
  },
  {
    route: '/reading',
    title: `Reading | ${SITE_NAME}`,
    description: 'A running list of articles, papers, and references worth keeping.',
  },
  {
    route: '/experiments',
    title: `Experiments | ${SITE_NAME}`,
    description: 'Interactive sketches: WebGL passes, motion studies, and interface prototypes.',
  },
  {
    route: '/sections',
    title: `Sections | ${SITE_NAME}`,
    description: 'Layout and section studies from the site itself.',
  },
]

export function absoluteUrl(pathname) {
  if (/^https?:\/\//.test(pathname)) return pathname
  return new URL(pathname, `${SITE_ORIGIN}/`).href
}

export function socialImagePathForSlug(slug) {
  return `/${SOCIAL_IMAGE_DIR}/${slug}.jpg`
}

export function currentUtcDate() {
  return new Date().toISOString().slice(0, 10)
}

export function isWritingReleased(meta, today = currentUtcDate()) {
  return meta.date <= today
}

/**
 * Pulls the `writingMeta` object literal out of an MDX file.
 *
 * The MDX files are prose plus JSX, so they cannot be imported from a plain Node
 * script. Every post declares the literal as the first export and closes it with
 * a brace in column 0 (both the hand-written files and `scaffold-writing.mjs`
 * output), which makes the block cheap to slice out and evaluate as data.
 */
function parseWritingMeta(source, file) {
  const marker = 'export const writingMeta ='
  const markerAt = source.indexOf(marker)
  if (markerAt === -1) throw new Error(`No writingMeta export in ${file}`)

  const braceAt = source.indexOf('{', markerAt)
  if (braceAt === -1) throw new Error(`Malformed writingMeta in ${file}`)

  const closeAt = source.indexOf('\n}', braceAt)
  if (closeAt === -1) throw new Error(`Could not find end of writingMeta in ${file}`)

  const literal = source.slice(braceAt, closeAt + 2)
  let meta
  try {
    meta = new Function(`return (${literal})`)()
  } catch (error) {
    throw new Error(`Could not evaluate writingMeta in ${file}: ${error.message}`)
  }
  if (!meta?.id || !meta.title) throw new Error(`writingMeta in ${file} is missing id or title`)
  return meta
}

/** Every post on disk, newest first, mirroring the runtime registry's sort. */
export function readWritingMetas() {
  return readdirSync(writingsDir)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const meta = parseWritingMeta(readFileSync(path.join(writingsDir, name), 'utf-8'), name)
      return { ...meta, file: name, isDraft: meta.keywords?.includes('draft') ?? false }
    })
    .sort((a, b) => b.date.localeCompare(a.date) || (a.order ?? 0) - (b.order ?? 0))
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Excerpts are authored for cards and carry markdown ticks; cards want one clean sentence. */
export function toDescription(text, limit = 200) {
  const flat = String(text ?? '')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (flat.length <= limit) return flat
  const clipped = flat.slice(0, limit)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > limit * 0.6 ? lastSpace : clipped.length).replace(/[\s,.;:—-]+$/, '')}…`
}

/**
 * Builds the block that sits between the marker comments in `index.html`.
 * `url` and `image` are made absolute here, since crawlers require it.
 */
export function renderMetaBlock({
  title,
  description,
  url,
  image,
  type = 'website',
  imageAlt,
  publishedTime,
  section,
}) {
  const absUrl = absoluteUrl(url)
  const absImage = absoluteUrl(image)
  const tags = [
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${escapeAttr(absUrl)}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${escapeAttr(absUrl)}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:image" content="${escapeAttr(absImage)}" />`,
    `<meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(imageAlt ?? title)}" />`,
    `<meta name="twitter:card" content="${TWITTER_CARD}" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(absImage)}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(imageAlt ?? title)}" />`,
  ]
  if (publishedTime) {
    tags.push(`<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />`)
  }
  if (section) {
    tags.push(`<meta property="article:section" content="${escapeAttr(section)}" />`)
  }
  return tags
}
