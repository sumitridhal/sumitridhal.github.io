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
