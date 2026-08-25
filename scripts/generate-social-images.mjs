#!/usr/bin/env node
/**
 * Render the 1200x630 social card variants used by `og:image` / `twitter:image`.
 *
 * Source art in `public/media/writings` is a demo capture at whatever aspect the
 * capture had (portrait, 4:3, square). Pointing a `summary_large_image` slot at
 * those means a hard centre crop, so each cover gets a derived landscape card
 * instead: the art placed whole on a field built from that post's own palette.
 * Sources are never modified.
 *
 * Outputs are checked in, so `npm run build` needs neither sharp nor a network.
 * Run this after adding or replacing a cover.
 *
 * Usage:
 *   node scripts/generate-social-images.mjs [--force] [--only <slug>] [--quality N]
 *
 *   --force        Rebuild cards that already exist
 *   --only <slug>  Restrict to one post (or `default` for the site card)
 *   --quality N    JPEG quality, default 80
 */
import { existsSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  SOCIAL_IMAGE_DIR,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_WIDTH,
  publicDir,
  readWritingMetas,
  socialImagePathForSlug,
} from './site-meta.mjs'

const W = SOCIAL_IMAGE_WIDTH
const H = SOCIAL_IMAGE_HEIGHT
const TARGET_ASPECT = W / H

/** Below this the art is a thumbnail, not a cover; upscaling it looks broken. */
const MIN_SOURCE_LONG_EDGE = 640
/** Sources this close to the card aspect can be cropped to full bleed without losing the subject. */
const FULL_BLEED_ASPECT_FLOOR = TARGET_ASPECT * 0.88

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const force = args.includes('--force')
const only = flag('--only') ?? null
const quality = Number(flag('--quality') ?? 80)

const outDir = path.join(publicDir, SOCIAL_IMAGE_DIR)

function rgbToHsl({ r, g, b }) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h, s, l }
}

function hslToRgb({ h, s, l }) {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  return {
    r: Math.round(channel(h + 1 / 3) * 255),
    g: Math.round(channel(h) * 255),
    b: Math.round(channel(h - 1 / 3) * 255),
  }
}

/**
 * The field colour behind the art: the source's dominant hue mixed with its
 * average, then pushed to a deep, low-chroma tone so the placed art stays the
 * brightest thing on the card.
 */
async function fieldTone(input) {
  const image = sharp(input)
  const { dominant } = await image.stats()
  const raw = await sharp(input).resize(1, 1, { fit: 'cover' }).removeAlpha().raw().toBuffer()
  const average = { r: raw[0], g: raw[1], b: raw[2] }
  const mixed = {
    r: dominant.r * 0.6 + average.r * 0.4,
    g: dominant.g * 0.6 + average.g * 0.4,
    b: dominant.b * 0.6 + average.b * 0.4,
  }
  const hsl = rgbToHsl(mixed)
  return hslToRgb({
    h: hsl.h,
    s: Math.min(0.45, Math.max(0.08, hsl.s * 0.75)),
    l: Math.min(0.26, Math.max(0.1, hsl.l * 0.45)),
  })
}

function artPlateSvg({ left, top, width, height }) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect x="${left + 0.5}" y="${top + 0.5}" width="${width - 1}" height="${height - 1}"
        fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1" />
    </svg>`,
  )
}

function edgeShadingSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000" stop-opacity="0.28" />
          <stop offset="0.45" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity="0.34" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#v)" />
    </svg>`,
  )
}

async function composeCard(input) {
  const meta = await sharp(input).metadata()
  const srcW = meta.width ?? 0
  const srcH = meta.height ?? 0
  if (Math.max(srcW, srcH) < MIN_SOURCE_LONG_EDGE) {
    return { skipped: `source too small (${srcW}x${srcH})` }
  }

  const tone = await fieldTone(input)
  const aspect = srcW / srcH
  const layers = []

  if (aspect >= FULL_BLEED_ASPECT_FLOOR) {
    // Near-landscape already: fill the card, the crop costs nothing.
    layers.push({
      input: await sharp(input).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer(),
    })
  } else {
    // Place the art whole and build the surrounding field from the art itself:
    // a blurred, darkened cover pass over the flat tone, so nothing letterboxes to black.
    const backdrop = await sharp(input)
      .resize(W, H, { fit: 'cover', position: 'centre' })
      .flatten({ background: tone })
      .blur(52)
      .modulate({ brightness: 0.6, saturation: 1.3 })
      .ensureAlpha(0.55)
      .png()
      .toBuffer()

    const art = sharp(input).resize({
      width: W,
      height: H,
      fit: 'inside',
      withoutEnlargement: false,
    })
    const artBuffer = await art.toBuffer()
    const artMeta = await sharp(artBuffer).metadata()
    const artW = artMeta.width ?? 0
    const artH = artMeta.height ?? 0
    const left = Math.round((W - artW) / 2)
    const top = Math.round((H - artH) / 2)

    layers.push(
      { input: backdrop },
      { input: edgeShadingSvg() },
      { input: artBuffer, left, top },
      { input: artPlateSvg({ left, top, width: artW, height: artH }) },
    )
  }

  const buffer = await sharp({
    create: { width: W, height: H, channels: 3, background: tone },
  })
    .composite(layers)
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer()

  return { buffer, source: `${srcW}x${srcH}`, mode: aspect >= FULL_BLEED_ASPECT_FLOOR ? 'full-bleed' : 'placed on palette field' }
}

/** Typographic card for the home page, non-post routes, and posts without a cover. */
async function composeDefaultCard() {
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0c0f18" />
          <stop offset="0.55" stop-color="#05060a" />
          <stop offset="1" stop-color="#0e1119" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)" />
      <g stroke="#e9b858" stroke-opacity="0.55">
        <line x1="96" y1="150" x2="360" y2="150" stroke-width="2" />
      </g>
      <text x="96" y="128" fill="#8b93a7" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="6">ENGINEER · WRITER · SHADERS</text>
      <text x="94" y="300" fill="#e8ecf4" font-family="Georgia, Times New Roman, serif"
        font-size="132" font-weight="700">${SITE_NAME}</text>
      <text x="96" y="374" fill="#aab1c0" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="34">Product systems, resilient frontends, and creative code.</text>
      <text x="96" y="556" fill="#655f57" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="3">0xthac0.github.io</text>
      <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#e9b858" fill-opacity="0.85" />
    </svg>`,
  )
  return {
    buffer: await sharp(svg).jpeg({ quality, mozjpeg: true }).toBuffer(),
    source: 'generated',
    mode: 'typographic default',
  }
}

async function loadSource(coverSrc) {
  if (/^https?:\/\//.test(coverSrc)) {
    try {
      const response = await fetch(coverSrc, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) return { error: `fetch ${response.status}` }
      return { input: Buffer.from(await response.arrayBuffer()), origin: 'remote' }
    } catch (error) {
      return { error: `fetch failed (${error.message})` }
    }
  }
  const file = path.join(publicDir, coverSrc.replace(/^\//, ''))
  if (!existsSync(file)) return { error: `missing file ${coverSrc}` }
  return { input: file, origin: 'local' }
}

function kb(file) {
  return `${Math.round(statSync(file).size / 1024)} KB`
}

mkdirSync(outDir, { recursive: true })

const rows = []

async function emit(name, compose) {
  const outFile = path.join(outDir, `${name}.jpg`)
  if (existsSync(outFile) && !force) {
    rows.push([name, 'kept', kb(outFile), 'already generated'])
    return
  }
  const result = await compose()
  if (result.skipped || !result.buffer) {
    rows.push([name, 'fallback', '—', result.skipped ?? 'no card'])
    return
  }
  await sharp(result.buffer).toFile(outFile)
  rows.push([name, 'written', kb(outFile), `${result.source} → ${result.mode}`])
}

if (!only || only === 'default') {
  await emit('default', composeDefaultCard)
}

if (only !== 'default') {
  for (const post of readWritingMetas()) {
    if (only && only !== post.id) continue
    if (!post.coverSrc) {
      rows.push([post.id, 'fallback', '—', `no coverSrc → ${DEFAULT_SOCIAL_IMAGE}`])
      continue
    }
    // Sequential on purpose: keeps sharp's memory flat and the log readable.
    const loaded = await loadSource(post.coverSrc)
    if (loaded.error) {
      rows.push([post.id, 'fallback', '—', loaded.error])
      continue
    }
    await emit(post.id, () => composeCard(loaded.input))
  }
}

const width = Math.max(...rows.map((r) => r[0].length))
for (const [name, status, size, note] of rows) {
  console.log(`${name.padEnd(width)}  ${status.padEnd(8)} ${size.padStart(7)}  ${note}`)
}
const written = rows.filter((r) => r[1] === 'written').length
const fallback = rows.filter((r) => r[1] === 'fallback').length
console.log(
  `\n${written} card(s) written, ${fallback} using ${DEFAULT_SOCIAL_IMAGE}, output in public/${SOCIAL_IMAGE_DIR}`,
)
console.log(`Cards are referenced as ${socialImagePathForSlug('<slug>')}`)
