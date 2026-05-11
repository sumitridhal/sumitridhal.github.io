precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.0, 289.0))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv * 2.0;
  float t = u_time * 0.15;
  vec2 warp = vec2(fbm(uv + t), fbm(uv - t * 0.7)) - 0.5;
  uv += warp * 0.35;
  float n = fbm(uv * 2.3 + t * 0.2);
  vec3 c1 = vec3(0.08, 0.14, 0.22);
  vec3 c2 = vec3(0.35, 0.65, 0.85);
  vec3 c3 = vec3(0.95, 0.75, 0.45);
  vec3 col = mix(c1, c2, smoothstep(0.2, 0.75, n));
  col = mix(col, c3, smoothstep(0.55, 0.95, n) * 0.35);
  fragColor = vec4(col, 1.0);
}
