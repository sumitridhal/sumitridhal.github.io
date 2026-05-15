precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
uniform float u_seed;
uniform float u_noise_intensity;
uniform float u_grid_size;
uniform float u_cell_rng_mode;
in vec2 v_uv;
out vec4 fragColor;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// --- Simplex 2D (Ashima / McEwan style, common WebGL snippet) ---
vec3 sn_mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 sn_mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 sn_permute(vec3 x) {
  return sn_mod289(((x * 34.0) + 1.0) * x);
}

float simplexNoise2D(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = sn_mod289(i);
  vec3 p = sn_permute(sn_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- Gradient Perlin 2D (bilinear mix of corner dot-gradients, IQ-style) ---
vec2 perlinHash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float perlinNoise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(perlinHash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
      dot(perlinHash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(perlinHash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
      dot(perlinHash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 cellNoiseCoord(vec2 cell, float seed) {
  return vec2(cell) * 0.19 + vec2(seed * 0.017, seed * 0.023);
}

// 0 — Classic sin · dot on (cell, seed) in R^3.
float cellRngSinDot(vec2 cell, float seed) {
  vec3 q = vec3(cell, seed * 19.1702);
  return fract(sin(dot(q, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// 1 — Simplex 2D sampled at cell coordinates (continuous field, tile picks palette band).
float cellRngSimplex2D(vec2 cell, float seed) {
  float n = simplexNoise2D(cellNoiseCoord(cell, seed));
  return clamp(n * 0.5 + 0.5, 0.0, 1.0);
}

// 2 — Gradient Perlin 2D at the same domain scale.
float cellRngPerlin2D(vec2 cell, float seed) {
  float n = perlinNoise2D(cellNoiseCoord(cell, seed) * 1.37 + vec2(3.1, 1.7));
  return clamp(n * 0.5 + 0.5, 0.0, 1.0);
}

// 3 — Fract permute (cheap pseudo-random hash).
float cellRngFractPermute(vec2 cell, float seed) {
  vec3 p = vec3(cell.xy, seed * 0.01003);
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.zyx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// 4 — Product of two independent 2D hashes.
float cellRngHashProduct(vec2 cell, float seed) {
  float a = hash21(cell + vec2(seed * 0.1, seed * 0.07));
  float b = hash21(cell.yx + vec2(seed * 0.13, seed * 0.02));
  return fract(a * 17.0 + b * 31.0);
}

float cellRng(vec2 cell, float seed, int mode) {
  if (mode == 0) return cellRngSinDot(cell, seed);
  if (mode == 1) return cellRngSimplex2D(cell, seed);
  if (mode == 2) return cellRngPerlin2D(cell, seed);
  if (mode == 3) return cellRngFractPermute(cell, seed);
  if (mode == 4) return cellRngHashProduct(cell, seed);
  return cellRngSinDot(cell, seed);
}

vec3 paletteColor(int i) {
  if (i == 0) return vec3(0.22, 0.42, 0.88);
  if (i == 1) return vec3(0.05, 0.08, 0.24);
  if (i == 2) return vec3(0.52, 0.18, 0.82);
  if (i == 3) return vec3(0.98, 0.52, 0.78);
  if (i == 4) return vec3(0.98, 0.92, 0.22);
  if (i == 5) return vec3(0.98, 0.52, 0.12);
  if (i == 6) return vec3(0.94, 0.32, 0.14);
  if (i == 7) return vec3(0.14, 0.48, 0.28);
  return vec3(0.91, 0.92, 0.94);
}

void main() {
  vec2 frag = v_uv * u_resolution.xy;
  float g = clamp(u_grid_size, 4.0, 32.0);
  vec2 cell = floor(frag * g / u_resolution.y);

  int mode = int(clamp(floor(u_cell_rng_mode + 0.5), 0.0, 4.0));
  float r = cellRng(cell, u_seed, mode);
  int idx = int(floor(r * 9.0));
  idx = clamp(idx, 0, 8);
  vec3 base = paletteColor(idx);

  float grain = hash21(frag * 0.92 + vec2(u_seed * 3.1, u_seed * 1.7));
  grain = grain * 2.0 - 1.0;
  vec3 col = base + vec3(grain) * u_noise_intensity;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
