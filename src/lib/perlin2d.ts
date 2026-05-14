/**
 * Classic 2D Perlin noise (Ken Perlin, ~1983 style with fade curve 6t^5-15t^4+10t^3).
 * Returns approximately [-1, 1]. Continuous in x and y; integer lattice gives repeat
 * every 256 units unless you rescale inputs.
 */

const PERM_SRC = new Uint8Array([
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
  142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252,
  219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168,
  68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
  133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
  73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100,
  109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82,
  85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
  152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108,
  110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
  144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181,
  199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
  222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
])

/** 512-length permutation (256 + wrap copy). */
function makePerm(): Uint8Array {
  const p = new Uint8Array(512)
  for (let i = 0; i < 256; i++) p[i] = PERM_SRC[i]
  for (let i = 0; i < 256; i++) p[256 + i] = p[i]
  return p
}

const P = makePerm()

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a)
}

/** Pseudo-random gradient dot (x,y) from corner hash (four axis-aligned directions). */
function grad2(hash: number, x: number, y: number): number {
  const h = hash & 3
  if (h === 0) return x + y
  if (h === 1) return -x + y
  if (h === 2) return x - y
  return -x - y
}

/**
 * Sample 2D Perlin noise at continuous coordinates.
 * Typical use: scale inputs (e.g. col * 0.08, row * 0.08) before calling.
 */
export function perlin2(x: number, y: number): number {
  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  const u = fade(xf)
  const v = fade(yf)

  const aa = P[P[xi] + yi]
  const ab = P[P[xi] + yi + 1]
  const ba = P[P[xi + 1] + yi]
  const bb = P[P[xi + 1] + yi + 1]

  const x1 = lerp(u, grad2(aa, xf, yf), grad2(ba, xf - 1, yf))
  const x2 = lerp(u, grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1))
  return lerp(v, x1, x2)
}

/** Map perlin2 output to [0, 1]. */
export function perlin2Normalized(x: number, y: number): number {
  return (perlin2(x, y) + 1) * 0.5
}
