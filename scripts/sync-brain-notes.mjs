#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const brainRoot = path.resolve(process.env.BRAIN_REPO ?? path.join(os.homedir(), 'brain'))
const outputRoot = path.join(repoRoot, 'src/content/notes')
const sensitiveRoots = new Set([
  'companies',
  'deals',
  'entities',
  'gitlab',
  'hiring',
  'household',
  'jira',
  'meetings',
  'personal',
])
const leakPatterns = [
  { label: 'internal ticket ID', pattern: /\bRED-\d+\b/i },
  { label: 'known Snowflake account', pattern: /\bgdadclc[-/]rhprod\b/i },
  {
    label: 'internal hostname',
    pattern: /\b(?:[a-z0-9-]+\.)+(?:corp|internal|redhat\.com)\b/i,
  },
]

function parseArgs(argv) {
  const options = {
    allowSensitive: false,
    dryRun: false,
    force: false,
    only: undefined,
    stamp: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--allow-sensitive') options.allowSensitive = true
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--force') options.force = true
    else if (arg === '--stamp') options.stamp = true
    else if (arg === '--only') {
      options.only = argv[index + 1]
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function walkMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return []
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
  })
}

function parseScalar(rawValue) {
  const value = rawValue.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => String(parseScalar(item)))
      .filter(Boolean)
  }
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return { attributes: {}, body: source }
  const end = source.indexOf('\n---\n', 4)
  if (end < 0) return { attributes: {}, body: source }

  const attributes = {}
  const lines = source.slice(4, end).split('\n')
  let listKey

  for (const line of lines) {
    const listMatch = line.match(/^\s*-\s+(.+)$/)
    if (listMatch && listKey) {
      const current = Array.isArray(attributes[listKey]) ? attributes[listKey] : []
      attributes[listKey] = [...current, String(parseScalar(listMatch[1]))]
      continue
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!keyMatch) continue
    const [, key, rawValue] = keyMatch
    if (!rawValue) {
      attributes[key] = []
      listKey = key
    } else {
      attributes[key] = parseScalar(rawValue)
      listKey = undefined
    }
  }

  return {
    attributes,
    body: source.slice(end + 5).trim(),
  }
}

function toBrainSlug(filePath) {
  return path
    .relative(brainRoot, filePath)
    .replaceAll(path.sep, '/')
    .replace(/\.md$/, '')
}

function toNoteId(brainSlug) {
  return brainSlug
    .replaceAll('/', '-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.valueOf())
    ? String(value).slice(0, 10)
    : parsed.toISOString().slice(0, 10)
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstParagraph(body) {
  const paragraph = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith('#') && !part.startsWith('```'))
  return plainText(paragraph ?? '').slice(0, 280)
}

function convertWikiLinks(body) {
  return body.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?]]/g, (_, slug, label) => {
    return label?.trim() || slug.trim().split('/').at(-1).replaceAll('-', ' ')
  })
}

function stripLeadingTitle(body) {
  return body.replace(/^#\s+.+\n+/, '')
}

function findLeak(body) {
  return leakPatterns.find(({ pattern }) => pattern.test(body))
}

function formatNote({ attributes, body, brainSlug, noteId }) {
  const tags = Array.isArray(attributes.tags) ? attributes.tags : []
  const title =
    String(attributes.title ?? '').trim() ||
    brainSlug.split('/').at(-1).replaceAll('-', ' ')
  const noteMeta = {
    id: noteId,
    title,
    date: normalizeDate(attributes.updated ?? attributes.created),
    category: String(attributes.type ?? 'note'),
    excerpt: firstParagraph(body),
    tags,
    generated: true,
    source: `gbrain:${brainSlug}`,
  }

  return `export const noteMeta = ${JSON.stringify(noteMeta, null, 2)}

${convertWikiLinks(stripLeadingTitle(body))}
`
}

function stampPublishedUrl(filePath, source, noteId) {
  const publishedUrl = `https://0xTHAC0.github.io/notes/${noteId}`
  if (/^published:\s*/m.test(source)) {
    return source.replace(/^published:\s*.*$/m, `published: ${publishedUrl}`)
  }
  return source.replace(/\n---\n/, `\npublished: ${publishedUrl}\n---\n`)
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!existsSync(brainRoot)) throw new Error(`Brain repo not found: ${brainRoot}`)

  const results = {
    eligible: 0,
    refused: 0,
    skipped: 0,
    written: 0,
  }

  for (const filePath of walkMarkdownFiles(brainRoot)) {
    const brainSlug = toBrainSlug(filePath)
    if (options.only && brainSlug !== options.only) continue

    const source = readFileSync(filePath, 'utf8')
    const { attributes, body } = parseFrontmatter(source)
    if (attributes.publish !== true) continue
    results.eligible += 1

    const rootSegment = brainSlug.split('/')[0]
    if (!options.allowSensitive && sensitiveRoots.has(rootSegment)) {
      console.warn(`REFUSED sensitive path: ${brainSlug}`)
      results.refused += 1
      continue
    }

    const leak = findLeak(body)
    if (leak) {
      console.warn(`REFUSED ${leak.label}: ${brainSlug}`)
      results.refused += 1
      continue
    }

    const noteId = toNoteId(brainSlug)
    const outputPath = path.join(outputRoot, `${noteId}.mdx`)
    if (existsSync(outputPath) && !options.force) {
      console.warn(`SKIPPED existing file (use --force): ${outputPath}`)
      results.skipped += 1
      continue
    }

    const generated = formatNote({ attributes, body, brainSlug, noteId })
    if (options.dryRun) {
      console.log(`WOULD WRITE ${path.relative(repoRoot, outputPath)}`)
      console.log(generated)
    } else {
      mkdirSync(outputRoot, { recursive: true })
      writeFileSync(outputPath, generated)
      console.log(`WROTE ${path.relative(repoRoot, outputPath)}`)
      results.written += 1
    }

    if (options.stamp && !options.dryRun) {
      writeFileSync(filePath, stampPublishedUrl(filePath, source, noteId))
      console.log(`STAMPED ${brainSlug}`)
    }
  }

  console.log(JSON.stringify(results))
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
