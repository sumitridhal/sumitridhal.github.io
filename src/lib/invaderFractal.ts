export const COLS_HALF = 3
export const ROWS = 5
export const COLS_FULL = 5

/** One hue per cell; lightness/saturation steps only (no per-pixel hue noise). */
const GALLERY_HUES = [320, 120, 55, 200, 190, 280, 45, 210, 330] as const

/** Pattern type fixed per gallery slot (matches reference layout). */
const GALLERY_KINDS = [
  1, // top-left: vertical grades
  0, // solid
  0,
  0,
  2, // middle: horizontal gradient
  0,
  0,
  5, // split top/bottom grades
  4, // three column grades
] as const

const THREE_EYE_SLOTS = new Set([2, 8])

export function hash01(seed: number, ...parts: number[]): number {
  let h = Math.imul(Math.floor(seed * 1e9) ^ 0x9e3779b9, 0x85ebca6b)
  for (const p of parts) {
    h = Math.imul(h ^ p, 0xc2b2ae35)
    h ^= h >>> 16
  }
  return (h >>> 0) / 4294967296
}

export function halfGridFromSeed(seed: number, tileX: number, tileY: number): boolean[][] {
  return Array.from({ length: COLS_HALF }, (_, x) =>
    Array.from({ length: ROWS }, (_, y) => hash01(seed, tileX, tileY, x, y) > 0.48),
  )
}

export function fullCell(half: boolean[][], x: number, y: number): boolean {
  const c = x <= 2 ? x : COLS_FULL - 1 - x
  return half[c]![y]!
}

export type TileStyle = {
  kind: number
  hue: number
  sat: number
  threeEyes: boolean
}

export function tileStyleFromSeed(_seed: number, tileX: number, tileY: number): TileStyle {
  const slot = tileY * 3 + tileX
  return {
    kind: GALLERY_KINDS[slot] ?? 0,
    hue: GALLERY_HUES[slot]!,
    sat: 90,
    threeEyes: THREE_EYE_SLOTS.has(slot),
  }
}

function grade(style: TileStyle, lightness: number): string {
  return `hsl(${style.hue} ${style.sat}% ${lightness}%)`
}

function isEye(x: number, y: number, style: TileStyle): boolean {
  if (y !== 2) return false
  if (x === 1 || x === 3) return true
  if (style.threeEyes && x === 2) return true
  return false
}

export function invaderPixelColor(style: TileStyle, x: number, y: number, on: boolean): string {
  if (!on) return '#000000'
  if (isEye(x, y, style)) return '#000000'

  const { kind } = style
  switch (kind) {
    case 0:
      return grade(style, 58)
    case 1:
      return grade(style, 40 + x * 9)
    case 2:
      return grade(style, 36 + y * 10)
    case 3:
      return grade(style, (x + y) % 2 === 0 ? 50 : 66)
    case 4:
      if (x <= 1) return grade(style, 48)
      if (x === 2) return grade(style, 58)
      return grade(style, 68)
    case 5:
      return grade(style, y <= 2 ? 64 : 46)
    default:
      return grade(style, 58)
  }
}

function drawInvaderTile(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  pix: number,
  gap: number,
  seed: number,
  tileX: number,
  tileY: number,
) {
  const half = halfGridFromSeed(seed, tileX, tileY)
  const style = tileStyleFromSeed(seed, tileX, tileY)
  const step = pix + gap

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS_FULL; x++) {
      const on = fullCell(half, x, y)
      ctx.fillStyle = invaderPixelColor(style, x, y, on)
      ctx.fillRect(ox + x * step, oy + y * step, pix, pix)
    }
  }
}

export function drawInvaderField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  tilesPerAxis: number,
) {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, w, h)

  const gallery = tilesPerAxis <= 6
  const cellW = w / tilesPerAxis
  const gap = gallery ? 2 : Math.max(1, Math.floor(cellW / 32))
  const avail = cellW * (gallery ? 0.62 : 1)
  const pix = Math.max(gallery ? 3 : 1, Math.floor((avail - gap * 4) / 5))
  const invW = 5 * pix + 4 * gap
  const offset = Math.max(0, (cellW - invW) / 2)

  for (let ty = 0; ty < tilesPerAxis; ty++) {
    for (let tx = 0; tx < tilesPerAxis; tx++) {
      drawInvaderTile(ctx, tx * cellW + offset, ty * cellW + offset, pix, gap, seed, tx, ty)
    }
  }
}
