export type CosmosFloatItem = {
  id: string
  alt: string
  /** Percent of stage width from left edge */
  left: number
  /** Percent of stage height from top edge */
  top: number
  width: number
  zIndex: 1 | 10
  float: {
    xAmp: number
    yAmp: number
    duration: number
    delay: number
  }
  /** Visual variety on shared placeholder */
  hueRotate: number
}

export const COSMOS_FLOAT_PLACEHOLDER_SRC = '/media/writings/cosmos-float/placeholder.svg'

/** Hand-tuned scatter — stable across reloads (not runtime random). */
export const COSMOS_FLOAT_ITEMS: CosmosFloatItem[] = [
  {
    id: 'c01',
    alt: 'Deep space nebula with violet gas clouds',
    left: 4,
    top: 8,
    width: 280,
    zIndex: 10,
    float: { xAmp: 14, yAmp: 18, duration: 5.2, delay: 0 },
    hueRotate: 0,
  },
  {
    id: 'c02',
    alt: 'Spiral galaxy arms in starlight',
    left: 72,
    top: 4,
    width: 160,
    zIndex: 1,
    float: { xAmp: 8, yAmp: 10, duration: 4.1, delay: 0.2 },
    hueRotate: 28,
  },
  {
    id: 'c03',
    alt: 'Radio telescope dish under a star field',
    left: 58,
    top: 62,
    width: 220,
    zIndex: 10,
    float: { xAmp: 12, yAmp: 14, duration: 6.4, delay: 0.45 },
    hueRotate: 55,
  },
  {
    id: 'c04',
    alt: 'Orion nebula core in infrared tones',
    left: 18,
    top: 68,
    width: 120,
    zIndex: 1,
    float: { xAmp: 6, yAmp: 9, duration: 3.6, delay: 0.1 },
    hueRotate: 82,
  },
  {
    id: 'c05',
    alt: 'Distant galaxy cluster gravitationally lensed',
    left: 82,
    top: 38,
    width: 340,
    zIndex: 10,
    float: { xAmp: 16, yAmp: 12, duration: 6.8, delay: 0.3 },
    hueRotate: 110,
  },
  {
    id: 'c06',
    alt: 'Lunar surface crater rim at terminator',
    left: 2,
    top: 42,
    width: 100,
    zIndex: 1,
    float: { xAmp: 5, yAmp: 7, duration: 3.2, delay: 0.55 },
    hueRotate: 140,
  },
  {
    id: 'c07',
    alt: 'James Webb deep field galaxies',
    left: 38,
    top: 12,
    width: 190,
    zIndex: 1,
    float: { xAmp: 10, yAmp: 11, duration: 4.8, delay: 0.15 },
    hueRotate: 168,
  },
  {
    id: 'c08',
    alt: 'Saturn rings edge-on through a telescope',
    left: 48,
    top: 78,
    width: 260,
    zIndex: 10,
    float: { xAmp: 13, yAmp: 15, duration: 5.6, delay: 0.7 },
    hueRotate: 195,
  },
  {
    id: 'c09',
    alt: 'Aurora borealis over an observatory dome',
    left: 88,
    top: 72,
    width: 130,
    zIndex: 1,
    float: { xAmp: 7, yAmp: 8, duration: 3.9, delay: 0.25 },
    hueRotate: 220,
  },
  {
    id: 'c10',
    alt: 'Supernova remnant expanding shell',
    left: 26,
    top: 22,
    width: 310,
    zIndex: 10,
    float: { xAmp: 15, yAmp: 13, duration: 6.2, delay: 0.4 },
    hueRotate: 248,
  },
  {
    id: 'c11',
    alt: 'Milky Way core above desert silhouettes',
    left: 64,
    top: 18,
    width: 145,
    zIndex: 1,
    float: { xAmp: 9, yAmp: 10, duration: 4.4, delay: 0.6 },
    hueRotate: 275,
  },
  {
    id: 'c12',
    alt: 'Hubble palette emission nebula pillars',
    left: 8,
    top: 58,
    width: 200,
    zIndex: 10,
    float: { xAmp: 11, yAmp: 14, duration: 5.1, delay: 0.35 },
    hueRotate: 302,
  },
  {
    id: 'c13',
    alt: 'Binary star system accretion disk',
    left: 76,
    top: 52,
    width: 115,
    zIndex: 1,
    float: { xAmp: 6, yAmp: 8, duration: 3.4, delay: 0.5 },
    hueRotate: 328,
  },
  {
    id: 'c14',
    alt: 'Comet tail streaking past a crescent moon',
    left: 42,
    top: 48,
    width: 175,
    zIndex: 10,
    float: { xAmp: 10, yAmp: 12, duration: 4.6, delay: 0.8 },
    hueRotate: 350,
  },
  {
    id: 'c15',
    alt: 'International Space Station transit across the sun',
    left: 92,
    top: 14,
    width: 105,
    zIndex: 1,
    float: { xAmp: 5, yAmp: 6, duration: 3.1, delay: 0.05 },
    hueRotate: 18,
  },
]

/** Tiny distant plates that fade in at staggered scroll thresholds (stable “random” spawn times). */
export type CosmosSpawnItem = {
  id: string
  alt: string
  left: number
  top: number
  width: number
  zIndex: 1 | 10
  /** Scroll progress 0–1 when this speck begins appearing */
  spawnAt: number
  hueRotate: number
  float: {
    xAmp: number
    yAmp: number
    duration: number
    delay: number
  }
}

export const COSMOS_SPAWN_ITEMS: CosmosSpawnItem[] = [
  {
    id: 's01',
    alt: 'Distant star cluster pinpoints',
    left: 50,
    top: 46,
    width: 52,
    zIndex: 1,
    spawnAt: 0.14,
    hueRotate: 42,
    float: { xAmp: 4, yAmp: 5, duration: 4.2, delay: 0 },
  },
  {
    id: 's02',
    alt: 'Faint emission knot in deep field',
    left: 28,
    top: 52,
    width: 48,
    zIndex: 10,
    spawnAt: 0.22,
    hueRotate: 95,
    float: { xAmp: 3, yAmp: 4, duration: 3.6, delay: 0.15 },
  },
  {
    id: 's03',
    alt: 'Micro galaxy smudge',
    left: 62,
    top: 38,
    width: 58,
    zIndex: 1,
    spawnAt: 0.3,
    hueRotate: 210,
    float: { xAmp: 5, yAmp: 3, duration: 5.1, delay: 0.08 },
  },
  {
    id: 's04',
    alt: 'Cosmic dust mote',
    left: 14,
    top: 24,
    width: 44,
    zIndex: 10,
    spawnAt: 0.38,
    hueRotate: 280,
    float: { xAmp: 3, yAmp: 5, duration: 3.9, delay: 0.22 },
  },
  {
    id: 's05',
    alt: 'Background quasar glint',
    left: 78,
    top: 58,
    width: 50,
    zIndex: 1,
    spawnAt: 0.44,
    hueRotate: 15,
    float: { xAmp: 4, yAmp: 4, duration: 4.8, delay: 0.05 },
  },
  {
    id: 's06',
    alt: 'Sparse open cluster specks',
    left: 40,
    top: 72,
    width: 64,
    zIndex: 10,
    spawnAt: 0.52,
    hueRotate: 165,
    float: { xAmp: 6, yAmp: 4, duration: 3.4, delay: 0.18 },
  },
  {
    id: 's07',
    alt: 'Redshifted dwarf galaxy',
    left: 56,
    top: 14,
    width: 46,
    zIndex: 1,
    spawnAt: 0.58,
    hueRotate: 330,
    float: { xAmp: 4, yAmp: 6, duration: 5.4, delay: 0.12 },
  },
  {
    id: 's08',
    alt: 'Interstellar ice crystal glare',
    left: 8,
    top: 72,
    width: 42,
    zIndex: 10,
    spawnAt: 0.64,
    hueRotate: 52,
    float: { xAmp: 3, yAmp: 3, duration: 3.2, delay: 0.28 },
  },
  {
    id: 's09',
    alt: 'Planetary nebula remnant speck',
    left: 86,
    top: 20,
    width: 54,
    zIndex: 1,
    spawnAt: 0.7,
    hueRotate: 118,
    float: { xAmp: 5, yAmp: 5, duration: 4.5, delay: 0.1 },
  },
  {
    id: 's10',
    alt: 'Dark matter filament hint',
    left: 36,
    top: 32,
    width: 48,
    zIndex: 10,
    spawnAt: 0.76,
    hueRotate: 245,
    float: { xAmp: 3, yAmp: 4, duration: 3.8, delay: 0.2 },
  },
]

/** Interleave specks among main plates in DOM paint order. */
export const COSMOS_RENDER_ORDER: ReadonlyArray<
  { type: 'main'; index: number } | { type: 'spawn'; index: number }
> = [
  { type: 'main', index: 0 },
  { type: 'spawn', index: 0 },
  { type: 'main', index: 1 },
  { type: 'main', index: 2 },
  { type: 'spawn', index: 1 },
  { type: 'main', index: 3 },
  { type: 'spawn', index: 2 },
  { type: 'main', index: 4 },
  { type: 'spawn', index: 3 },
  { type: 'main', index: 5 },
  { type: 'main', index: 6 },
  { type: 'spawn', index: 4 },
  { type: 'main', index: 7 },
  { type: 'spawn', index: 5 },
  { type: 'main', index: 8 },
  { type: 'spawn', index: 6 },
  { type: 'main', index: 9 },
  { type: 'main', index: 10 },
  { type: 'spawn', index: 7 },
  { type: 'main', index: 11 },
  { type: 'spawn', index: 8 },
  { type: 'main', index: 12 },
  { type: 'main', index: 13 },
  { type: 'spawn', index: 9 },
  { type: 'main', index: 14 },
]
