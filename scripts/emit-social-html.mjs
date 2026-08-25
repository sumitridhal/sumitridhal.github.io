#!/usr/bin/env node
/**
 * Post-build step: emit one static HTML entry per route, each carrying its own
 * social preview tags.
 *
 * Social crawlers (Slack, X, Facebook, LinkedIn, iMessage) read the raw HTML
 * response and do not run JavaScript, so meta tags written into `document.head`
 * by React would never be seen. Instead every route gets a real file in `dist`
 * that is byte-for-byte the built SPA shell with the block between the
 * `social-meta` markers in `index.html` swapped for that route's tags. The same
 * bundle boots, the router reads the URL, and the crawler gets a 200 with the
 * right card — no redirect through `404.html`, which would answer HTTP 404 and
 * make several crawlers skip the unfurl entirely.
 *
 * Post routes are discovered from `src/content/writings/*.mdx`, so a new article
 * is picked up with no list to maintain.
 *
 * Usage: node scripts/emit-social-html.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_SOCIAL_IMAGE,
  META_MARKER_END,
  META_MARKER_START,
  ROUTE_META,
  SITE_ORIGIN,
  SOCIAL_IMAGE_DIR,
  absoluteUrl,
  distDir,
  isWritingReleased,
  readWritingMetas,
  renderMetaBlock,
  repoRoot,
  socialImagePathForSlug,
  toDescription,
} from './site-meta.mjs'

const indexFile = path.join(distDir, 'index.html')
if (!existsSync(indexFile)) {
  console.error(`No ${path.relative(repoRoot, indexFile)}. Run \`vite build\` first.`)
  process.exit(1)
}

const shell = readFileSync(indexFile, 'utf-8')
const startAt = shell.indexOf(META_MARKER_START)
const endAt = shell.indexOf(META_MARKER_END)
if (startAt === -1 || endAt === -1) {
  console.error(
    `index.html is missing the ${META_MARKER_START} / ${META_MARKER_END} markers; social meta cannot be injected.`,
  )
  process.exit(1)
}

const head = shell.slice(0, startAt + META_MARKER_START.length)
const tail = shell.slice(endAt)

/** Indentation of the emitted tags matches the marker's own indentation. */
const indent = ' '.repeat((shell.slice(0, startAt).match(/([ \t]*)$/)?.[1] ?? '').length)

function renderDocument(meta) {
  const tags = renderMetaBlock(meta)
    .map((tag) => `${indent}${tag}`)
    .join('\n')
  return `${head}\n${tags}\n${indent}${tail}`
}

/** Emits both `<route>.html` and `<route>/index.html` so either resolution serves a 200. */
function writeRoute(route, html) {
  const clean = route.replace(/^\/|\/$/g, '')
  const targets = clean
    ? [path.join(distDir, `${clean}.html`), path.join(distDir, clean, 'index.html')]
    : [indexFile]
  for (const target of targets) {
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, html)
  }
  return targets.map((t) => path.relative(distDir, t))
}

const staleCards = []
const written = []
let fallbackCount = 0

function resolveCard(post) {
  const candidate = socialImagePathForSlug(post.id)
  if (existsSync(path.join(distDir, candidate.replace(/^\//, '')))) return candidate
  fallbackCount += 1
  // A cover with no derived card means someone added art without regenerating.
  if (post.coverSrc) staleCards.push(post.id)
  return DEFAULT_SOCIAL_IMAGE
}

for (const route of ROUTE_META) {
  const html = renderDocument({
    title: route.title,
    description: toDescription(route.description),
    url: route.route,
    image: DEFAULT_SOCIAL_IMAGE,
    type: 'website',
  })
  written.push(...writeRoute(route.route, html))
}

// GitHub Pages serves this for anything not emitted above (drafts, stale links),
// where the SPA router still resolves the URL client-side.
const fallbackHtml = renderDocument({
  title: ROUTE_META[0].title,
  description: toDescription(ROUTE_META[0].description),
  url: '/',
  image: DEFAULT_SOCIAL_IMAGE,
  type: 'website',
})
writeFileSync(path.join(distDir, '404.html'), fallbackHtml)
written.push('404.html')

const posts = readWritingMetas().filter((post) => !post.isDraft && isWritingReleased(post))
for (const post of posts) {
  const route = `/writing/${post.id}`
  const html = renderDocument({
    title: post.title,
    description: toDescription(post.excerpt),
    url: route,
    image: resolveCard(post),
    type: 'article',
    imageAlt: post.title,
    publishedTime: post.date,
    section: post.category,
  })
  written.push(...writeRoute(route, html))
}

const defaultCard = path.join(distDir, DEFAULT_SOCIAL_IMAGE.replace(/^\//, ''))
if (!existsSync(defaultCard)) {
  console.error(
    `Missing ${DEFAULT_SOCIAL_IMAGE} in dist. Run \`npm run social:images\` and commit public/${SOCIAL_IMAGE_DIR}.`,
  )
  process.exit(1)
}

// Cheap guard against a new route shipping without its own preview defaults.
const declaredPaths = [
  ...readFileSync(path.join(repoRoot, 'src/App.tsx'), 'utf-8').matchAll(/path="([^"]+)"/g),
]
  .map((match) => match[1])
  .filter((route) => route !== '*' && !route.includes(':') && route !== '/')
const uncovered = declaredPaths.filter(
  (route) => !ROUTE_META.some((entry) => entry.route === `/${route.replace(/^\//, '')}`),
)
if (uncovered.length) {
  console.log(
    `note: routes in App.tsx without ROUTE_META entries (they will use 404.html defaults): ${uncovered.join(', ')}`,
  )
}

console.log(
  `social meta: ${ROUTE_META.length} site route(s) + ${posts.length} post(s) → ${written.length} file(s) in dist`,
)
console.log(`origin: ${SITE_ORIGIN}  ·  example: ${absoluteUrl(`/writing/${posts[0].id}`)}`)
console.log(
  `cards: ${posts.length - fallbackCount} derived, ${fallbackCount} on ${DEFAULT_SOCIAL_IMAGE}`,
)
if (staleCards.length) {
  console.log(
    `warning: ${staleCards.length} post(s) have a coverSrc but no derived card — run \`npm run social:images\`: ${staleCards.join(', ')}`,
  )
}
