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

// 0 — Classic sin · dot on (cell, seed) in R^3 (small shader “random”, fully deterministic).
float cellRngSinDot(vec2 cell, float seed) {
  vec3 q = vec3(cell, seed * 19.1702);
  return fract(sin(dot(q, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// 1 — Fract permute: fold vec3 with self-dot (common cheap hash / “white” noise).
float cellRngFractPermute(vec2 cell, float seed) {
  vec3 p = vec3(cell.xy, seed * 0.01003);
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.zyx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// 2 — Interleaved gradient style: one multiply + fract (used for spatial dither patterns).
float cellRngIgn(vec2 cell, float seed) {
  float v = dot(cell, vec2(0.06711056, 0.00583715)) + seed * 0.0012345;
  return fract(52.9829189 * fract(v));
}

// 3 — Product of two independent 2D hashes (different swizzle + seed offsets).
float cellRngHashProduct(vec2 cell, float seed) {
  float a = hash21(cell + vec2(seed * 0.1, seed * 0.07));
  float b = hash21(cell.yx + vec2(seed * 0.13, seed * 0.02));
  return fract(a * 17.0 + b * 31.0);
}

// 4 — Double fract sin (two decorrelated samples, “nested” PRNG feel).
float cellRngDoubleSin(vec2 cell, float seed) {
  vec2 p = cell + vec2(seed * 0.031, seed * 0.019);
  float h = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  return fract(sin(dot(p + h, vec2(39.346, 11.717))) * 23421.631);
}

float cellRng(vec2 cell, float seed, int mode) {
  if (mode == 0) return cellRngSinDot(cell, seed);
  if (mode == 1) return cellRngFractPermute(cell, seed);
  if (mode == 2) return cellRngIgn(cell, seed);
  if (mode == 3) return cellRngHashProduct(cell, seed);
  if (mode == 4) return cellRngDoubleSin(cell, seed);
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
