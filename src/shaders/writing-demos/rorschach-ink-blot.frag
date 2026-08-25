precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
uniform vec3 u_ink_warm;
uniform vec3 u_ink_dark;
uniform vec3 u_paper;

in vec2 v_uv;
out vec4 fragColor;

/*
 * 3D simplex noise by Ian McEwan, Ashima Arts.
 * Distributed under the MIT License.
 * https://github.com/ashima/webgl-noise
 */
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
    )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n = 1.0 / 7.0;
  vec3 ns = n * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(
    vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))
  );
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(
    0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)),
    0.0
  );
  m *= m;
  return 42.0 * dot(
    m * m,
    vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))
  );
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float fbm(vec3 p, int octaves) {
  float sum = 0.0;
  float amplitude = 0.5;
  mat3 octaveTransform = mat3(
    1.6, 1.2, 0.0,
    -1.2, 1.6, 0.0,
    0.0, 0.0, 2.0
  );

  for (int i = 0; i < 5; i++) {
    if (i < octaves) {
      sum += snoise(p) * amplitude;
    }
    p = octaveTransform * p + vec3(17.0, 31.0, 47.0);
    amplitude *= 0.5;
  }
  return sum;
}

float paperVignette(vec2 q) {
  float edgeProduct = 16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y);
  return 0.34 + 0.66 * pow(max(edgeProduct, 0.0), 0.28);
}

void main() {
  vec2 p = v_uv * 2.0 - 1.0;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float mirrorAmount = clamp(u_mouse.w, 0.0, 1.0);
  vec2 folded = p;
  folded.x = mix(folded.x, abs(folded.x), mirrorAmount);

  vec2 pointerBias = (u_mouse.xy - 0.5) * vec2(0.5, 0.34);
  vec2 blotDomain = folded * vec2(1.48, 1.32) + pointerBias;
  float time = u_time * 0.075;
  float spread = mix(0.12, 0.43, clamp(u_mouse.z, 0.0, 1.0));
  float containment = length(p * vec2(0.82, 1.0)) * 0.48;

  float outerField = fbm(vec3(blotDomain, time + 13.0), 5);
  float innerField = fbm(vec3(blotDomain * 1.18 + vec2(4.7, -2.1), time * 0.86 + 29.0), 5);
  float outerInk = 1.0 - smoothstep(
    -0.035,
    0.035,
    outerField + containment - spread
  );
  float innerInk = 1.0 - smoothstep(
    -0.028,
    0.028,
    innerField + containment * 0.92 - spread * 0.84
  );

  float density = clamp(
    0.52 + 0.72 * fbm(vec3(p * 0.86 + vec2(-1.7, 3.2), time * 0.72 + 71.0), 4),
    0.0,
    1.0
  );

  vec2 pixel = v_uv * u_resolution;
  float grain = (hash21(pixel * 0.83) - 0.5) * 0.055;

  vec3 paper = u_paper + grain;

  vec3 color = mix(paper, u_ink_warm, outerInk * (0.38 + density * 0.58));
  color = mix(color, u_ink_dark, innerInk * (0.48 + density * 0.48));
  color *= paperVignette(v_uv);

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
