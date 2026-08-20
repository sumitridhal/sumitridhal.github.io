export type CollageSlot = {
  /** Horizontal center as a percentage of the collage width. */
  x: number
  /** Vertical offset within a band, in rem. */
  y: number
  /** Width as a percentage of the collage width. */
  w: number
  /** Width / height. */
  ar: number
  /** Visual depth from 0 (far) to 1 (near). */
  depth: number
}

export const BAND_HEIGHT = 54

export const PAGE_SLOTS: CollageSlot[] = [
  { x: -1, y: 2, w: 18, ar: 0.78, depth: 0.42 },
  { x: 20, y: 6, w: 13, ar: 1, depth: 0.66 },
  { x: 43, y: 3, w: 18, ar: 0.74, depth: 0.86 },
  { x: 72, y: 1, w: 15, ar: 0.78, depth: 0.52 },
  { x: 99, y: 7, w: 17, ar: 1, depth: 0.72 },
  { x: 10, y: 31, w: 16, ar: 1.35, depth: 0.78 },
  { x: 34, y: 37, w: 13, ar: 0.82, depth: 0.46 },
  { x: 63, y: 33, w: 18, ar: 1.45, depth: 0.96 },
  { x: 87, y: 34, w: 14, ar: 0.76, depth: 0.58 },
  { x: 109, y: 31, w: 17, ar: 1.18, depth: 0.82 },
  { x: 48, y: 44, w: 12, ar: 1, depth: 0.38 },
  { x: 77, y: 47, w: 11, ar: 1, depth: 0.68 },
]

export const HOME_SLOTS: CollageSlot[] = [
  { x: -3, y: 2, w: 19, ar: 0.78, depth: 0.44 },
  { x: 22, y: 7, w: 14, ar: 1, depth: 0.7 },
  { x: 48, y: 1, w: 18, ar: 0.74, depth: 0.9 },
  { x: 76, y: 5, w: 15, ar: 1.15, depth: 0.56 },
  { x: 103, y: 1, w: 17, ar: 0.82, depth: 0.76 },
  { x: 14, y: 33, w: 17, ar: 1.4, depth: 0.84 },
  { x: 68, y: 34, w: 19, ar: 1.45, depth: 1 },
  { x: 96, y: 36, w: 14, ar: 0.78, depth: 0.62 },
]

export function slotForIndex(index: number, slots: CollageSlot[]): CollageSlot {
  const slot = slots[index % slots.length]
  const band = Math.floor(index / slots.length)

  return {
    ...slot,
    y: slot.y + band * BAND_HEIGHT,
    x: slot.x + (band % 2 === 0 ? 0 : slot.x < 50 ? 3 : -3),
  }
}

export function collageHeight(itemCount: number, slots: CollageSlot[]): number {
  const bands = Math.max(1, Math.ceil(itemCount / slots.length))
  return bands * BAND_HEIGHT + 6
}
