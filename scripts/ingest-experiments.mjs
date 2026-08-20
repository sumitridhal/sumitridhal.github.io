/**
 * Convert Motion Forge's staged 16:9 MP4 exports into square web assets.
 *
 * Usage:
 *   npm run experiments:ingest
 *   node scripts/ingest-experiments.mjs --input=/path/to/site-experiments
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const inputArg = args.find((arg) => arg.startsWith('--input='))
const INPUT_DIR = inputArg
  ? path.resolve(inputArg.slice('--input='.length))
  : path.join(os.homedir(), '.motion-forge/output/site-experiments')
const OUTPUT_DIR = path.join(ROOT, 'public/media/experiments')
const MANIFEST_PATH = path.join(INPUT_DIR, 'manifest.json')
const force = args.includes('--force')
const squareFilter =
  'crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=720:720:flags=lanczos,format=yuv420p'

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${command} failed`).slice(-1200))
  }
}

function shouldSkip(paths) {
  return (
    !force &&
    paths.every((filePath) => fs.existsSync(filePath) && fs.statSync(filePath).size > 1000)
  )
}

if (!fs.existsSync(MANIFEST_PATH)) {
  throw new Error(`Motion Forge staging manifest not found: ${MANIFEST_PATH}`)
}

const entries = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
if (!Array.isArray(entries) || entries.length === 0) {
  throw new Error('Motion Forge staging manifest has no entries')
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true })
const completed = []

for (const entry of entries) {
  const source = path.join(INPUT_DIR, `${entry.slug}.mp4`)
  const mp4 = path.join(OUTPUT_DIR, `${entry.slug}.mp4`)
  const webm = path.join(OUTPUT_DIR, `${entry.slug}.webm`)
  const poster = path.join(OUTPUT_DIR, `${entry.slug}-poster.webp`)
  const posterPng = path.join(OUTPUT_DIR, `${entry.slug}-poster.png`)

  process.stdout.write(`${entry.slug}… `)
  if (!fs.existsSync(source)) {
    console.log('missing staged MP4')
    continue
  }
  if (shouldSkip([mp4, webm, poster])) {
    console.log('skip')
    completed.push(entry)
    continue
  }

  try {
    run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      source,
      '-vf',
      squareFilter,
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '30',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4,
    ])
    run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      source,
      '-vf',
      squareFilter,
      '-an',
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '38',
      '-b:v',
      '0',
      '-row-mt',
      '1',
      '-pix_fmt',
      'yuv420p',
      webm,
    ])
    run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      source,
      '-vf',
      squareFilter,
      '-frames:v',
      '1',
      posterPng,
    ])
    run('cwebp', ['-quiet', '-q', '82', posterPng, '-o', poster])
    fs.rmSync(posterPng, { force: true })
    completed.push(entry)
    console.log('ok')
  } catch (error) {
    fs.rmSync(posterPng, { force: true })
    console.log(`fail: ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log('\nReady-to-paste experiment entries:\n')
for (const entry of completed) {
  const provenance =
    entry.kind === 'look'
      ? `    look: ${JSON.stringify(entry.title)},`
      : `    shader: ${JSON.stringify(entry.routeId)},`
  console.log(`  {
    id: ${JSON.stringify(entry.slug)},
    title: ${JSON.stringify(entry.title)},
    tag: "MOTION FORGE",
    source: "motion-forge",
${provenance}
    ...experimentVideo(${JSON.stringify(entry.slug)}),
    alt: ${JSON.stringify(`${entry.title} motion study`)},
  },`)
}

console.log(`\nDone. ${completed.length}/${entries.length} experiments ingested.`)
process.exit(completed.length === entries.length ? 0 : 1)
