#!/usr/bin/env node
/**
 * Scaffold a /writing/:slug blog post MDX file.
 *
 * Usage:
 *   node scripts/scaffold-writing.mjs <slug> [options]
 *
 * Options:
 *   --title "Title"          Post title (defaults to slug → Title Case)
 *   --date YYYY-MM-DD        Publish date (defaults to today)
 *   --category Category      Post category (defaults to "Blog")
 *   --excerpt "Short desc"   Teaser text for cards and footer
 *   --cover /path/to/img     Cover image path relative to public/
 *   --keywords tag1,tag2     Comma-separated keywords (include "draft" to hide)
 *   --order N                Sort order for same-date tie-break (default 0)
 *   --body path/to/file.md   Read body content from a markdown file
 *   --dry-run                Print to stdout instead of writing file
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const writingsDir = path.join(root, 'src/content/writings')

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      if (key === 'dry-run') {
        flags[key] = true
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        flags[key] = argv[++i]
      }
    } else {
      positional.push(argv[i])
    }
  }
  return { positional, flags }
}

function toTitleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function todayISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const { positional, flags } = parseArgs(process.argv.slice(2))
const slug = positional[0]

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    'Usage: node scripts/scaffold-writing.mjs <kebab-slug> [--title "Title"] [--date YYYY-MM-DD] [--category Cat] [--excerpt "..."] [--cover /path] [--keywords tag1,tag2] [--order N] [--body file.md] [--dry-run]',
  )
  process.exit(1)
}

const title = flags.title || toTitleCase(slug)
const date = flags.date || todayISO()
const category = flags.category || 'Blog'
const excerpt = flags.excerpt || 'TODO: write excerpt'
const order = parseInt(flags.order || '0', 10)
const keywords = flags.keywords ? flags.keywords.split(',').map((k) => k.trim()) : undefined
const coverSrc = flags.cover || `/media/writings/${slug}.png`

let bodyContent = `Opening paragraph — what this post is about and why it matters.

## Section

Body content here. Use standard markdown with React components where needed.

<figure className="writing-inline-figure">
  <img src="${coverSrc}" alt={writingMeta.title} loading="lazy" decoding="async" />
</figure>

## Conclusion

Closing thoughts.
`

if (flags.body) {
  const bodyPath = path.resolve(flags.body)
  if (!existsSync(bodyPath)) {
    console.error(`Body file not found: ${bodyPath}`)
    process.exit(1)
  }
  bodyContent = readFileSync(bodyPath, 'utf-8')
}

const titleLines = title.length > 30 ? splitTitle(title) : undefined

function splitTitle(t) {
  const words = t.split(' ')
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

const metaObj = {
  id: slug,
  order,
  title,
  date,
  category,
  excerpt,
  coverSrc,
}
if (titleLines) metaObj.titleLines = titleLines
if (keywords?.length) metaObj.keywords = keywords

const metaStr = JSON.stringify(metaObj, null, 2)

const mdxContent = `export const writingMeta = ${metaStr}

${bodyContent}
`

if (flags['dry-run']) {
  process.stdout.write(mdxContent)
  process.exit(0)
}

mkdirSync(writingsDir, { recursive: true })
const outPath = path.join(writingsDir, `${slug}.mdx`)
if (existsSync(outPath)) {
  console.error(`Refusing to overwrite existing file: ${outPath}`)
  process.exit(1)
}

writeFileSync(outPath, mdxContent)
console.log(`Wrote ${path.relative(root, outPath)}`)
console.log(`Next:
  1. Add cover image at public${coverSrc}
  2. Edit the body content in ${path.relative(root, outPath)}
  3. npm run dev && open http://localhost:5173/writing/${slug}
  4. Remove "draft" from keywords when ready to publish`)
