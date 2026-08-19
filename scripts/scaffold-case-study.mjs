#!/usr/bin/env node
/**
 * Scaffold a reusable /work/:slug case study MDX file.
 *
 * Usage:
 *   node scripts/scaffold-case-study.mjs <slug> [--title "Title"]
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const workDir = path.join(root, 'src/content/work')

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('--'))
const titleFlag = args.indexOf('--title')
const title =
  titleFlag >= 0 && args[titleFlag + 1]
    ? args[titleFlag + 1]
    : slug
        ?.split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: node scripts/scaffold-case-study.mjs <kebab-slug> [--title "Title"]')
  process.exit(1)
}

mkdirSync(workDir, { recursive: true })
const outPath = path.join(workDir, `${slug}.mdx`)
if (existsSync(outPath)) {
  console.error(`Refusing to overwrite existing file: ${outPath}`)
  process.exit(1)
}

const imageKey = `project-${slug}`
const coverSrc = `/media/projects/${slug}-cover.png`

const body = `export const workMeta = {
  id: '${slug}',
  order: 50,
  title: ${JSON.stringify(title)},
  tagline: 'One sentence for cards and the page hero.',
  category: 'Category',
  role: 'Product engineering',
  year: '2026',
  stack: 'Short stack line for the meta row',
  techStack: ['React', 'Vite'],
  coverSrc: '${coverSrc}',
  imageKey: '${imageKey}',
  demoUrl: 'http://localhost:3000',
  repoPath: '~/git/${slug}',
  highlights: [
    'Ship-facing highlight one.',
    'Ship-facing highlight two.',
  ],
  gallery: [
    {
      src: '${coverSrc}',
      alt: '${title} product screenshot',
      width: 1024,
      height: 640,
    },
  ],
}

Opening paragraph — what it is and why it exists.

## Problem

Who hurts and what breaks without this.

## Approach

How the system is shaped (architecture, constraints, gates).

## Tech stack

Repeat or refine the stack in prose if needed.

## Demo

\`\`\`bash
# runnable commands only
\`\`\`

Sources: repo README path, brain page slug.
`

writeFileSync(outPath, body)
console.log(`Wrote ${path.relative(root, outPath)}`)
console.log(`Next:
  1. Add cover at public${coverSrc}
  2. Add "${imageKey}" to src/data/image-dimensions.json and lqip-data.json
  3. Fill Problem / Approach / Tech stack / Demo from README + brain
  4. npm run build && open /work/${slug}`)
