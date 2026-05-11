precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float luminance709(vec3 rgb) {
  return dot(rgb, vec3(0.2126, 0.7152, 0.0722));
}

vec3 scene(vec2 uv) {
  vec2 m = u_mouse.xy;
  float t = u_time * 0.45;
  float d0 = length(uv - m);
  float d1 = length(uv - vec2(0.28 + sin(t) * 0.06, 0.55));
  float d2 = length(uv - vec2(0.75, 0.32 + cos(t * 0.8) * 0.08));
  vec3 c0 = vec3(0.95, 0.35, 0.28);
  vec3 c1 = vec3(0.22, 0.72, 0.95);
  vec3 c2 = vec3(0.55, 0.95, 0.42);
  float k = 4.2;
  vec3 rgb =
    c0 * exp(-d0 * k) * 0.9 + c1 * exp(-d1 * k * 0.85) * 0.75 + c2 * exp(-d2 * k * 0.9) * 0.65;
  float vign = smoothstep(1.15, 0.25, length(uv - 0.5) * 1.25);
  rgb *= vign;
  float grid = 0.5 + 0.5 * sin(uv.x * 28.0 + t) * sin(uv.y * 22.0 - t * 0.6);
  rgb += vec3(0.04, 0.05, 0.06) * grid * vign;
  return clamp(rgb, 0.0, 1.0);
}

/** Procedural “glyph” ink in cell UV [0,1]² — density ramps like classic ASCII art. */
float glyphInk(int idx, vec2 uv) {
  vec2 p = uv - 0.5;
  float w = 0.055;
  float ink = 0.0;

  if (idx <= 0) {
    return 0.0;
  }
  if (idx == 1) {
    return 1.0 - smoothstep(0.04, 0.11, length(p));
  }
  if (idx == 2) {
    float a = 1.0 - smoothstep(0.03, 0.09, length(p - vec2(0.0, 0.14)));
    float b = 1.0 - smoothstep(0.03, 0.09, length(p + vec2(0.0, 0.14)));
    return max(a, b);
  }
  if (idx == 3) {
    return 1.0 - smoothstep(w * 0.5, w * 1.4, abs(p.y));
  }
  if (idx == 4) {
    return 1.0 - smoothstep(w * 0.5, w * 1.4, abs(p.x));
  }
  if (idx == 5) {
    return 1.0 - smoothstep(w * 0.6, w * 1.5, abs(p.x - p.y));
  }
  if (idx == 6) {
    float h = 1.0 - smoothstep(w * 0.5, w * 1.4, abs(p.y));
    float v = 1.0 - smoothstep(w * 0.5, w * 1.4, abs(p.x));
    return clamp(h + v, 0.0, 1.0);
  }
  if (idx == 7) {
    float h = 1.0 - smoothstep(w * 0.45, w * 1.25, abs(p.y - 0.12));
    h = max(h, 1.0 - smoothstep(w * 0.45, w * 1.25, abs(p.y + 0.12)));
    float v = 1.0 - smoothstep(w * 0.45, w * 1.25, abs(p.x - 0.1));
    v = max(v, 1.0 - smoothstep(w * 0.45, w * 1.25, abs(p.x + 0.1)));
    return clamp(h + v, 0.0, 1.0);
  }
  if (idx == 8) {
    float d = 1.0 - smoothstep(w * 0.55, w * 1.35, abs(p.x - p.y));
    float d2 = 1.0 - smoothstep(w * 0.55, w * 1.35, abs(p.x + p.y));
    return clamp(d + d2, 0.0, 1.0);
  }
  return 1.0 - smoothstep(0.38, 0.48, max(abs(p.x), abs(p.y)));
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float charAspect = 8.0 / 12.0;
  float nCols = 88.0;
  float nRows = nCols / aspect * charAspect;
  vec2 g = vec2(nCols, nRows);
  vec2 id = floor(v_uv * g);
  vec2 cellUv = fract(v_uv * g);
  vec2 cellCenter = (id + 0.5) / g;

  float L = luminance709(scene(cellCenter));
  int idx = int(clamp(floor(L * 10.0), 0.0, 9.0));
  float m = glyphInk(idx, cellUv);

  vec3 paper = vec3(0.04, 0.045, 0.05);
  vec3 ink = vec3(0.78, 0.82, 0.76);
  vec3 col = mix(paper, ink, m);
  fragColor = vec4(col, 1.0);
}
