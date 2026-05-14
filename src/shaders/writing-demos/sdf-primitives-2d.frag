precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

// Site palette: $color-bg #05060a, accent-soft #5bc0be, accent #ff4d6d
const vec3 kBgDeep = vec3(0.02, 0.024, 0.039);
const vec3 kBgLift = vec3(0.047, 0.059, 0.094);
const vec3 kTeal = vec3(0.357, 0.753, 0.745);
const vec3 kTealDim = vec3(0.12, 0.28, 0.32);
const vec3 kCoral = vec3(1.0, 0.302, 0.427);
const vec3 kMist = vec3(0.91, 0.925, 0.957);

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float opUnion(float a, float b) {
  return min(a, b);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 frag = v_uv * u_resolution.xy;
  vec2 uv = (frag - 0.5 * u_resolution.xy) / u_resolution.y;

  float t = u_time * 0.35;
  vec2 mouseNdc = (u_mouse.xy - 0.5) * 2.0;
  vec2 drift = vec2(0.08 * sin(t * 0.7), 0.06 * cos(t * 0.55)) + mouseNdc * 0.12;

  float ca = cos(t * 0.4);
  float sa = sin(t * 0.4);
  vec2 p = mat2(ca, -sa, sa, ca) * (uv - drift);

  float dCircle = sdCircle(p - vec2(-0.14, 0.02), 0.11);
  float dBox = sdRoundBox(p - vec2(0.16, -0.02), vec2(0.1, 0.07), 0.04);
  float blendK = 0.085 + 0.02 * sin(t * 1.1);
  float d = smin(dCircle, dBox, blendK);

  float band = abs(d);
  float iso = exp(-band * 90.0) * 0.35 + exp(-band * 28.0) * 0.12;

  vec3 col = mix(kBgDeep, kBgLift, smoothstep(0.0, 0.42, band));
  col += kMist * iso * 0.22;

  float inside = smoothstep(0.004, -0.012, d);
  vec3 fillTeal = mix(kTealDim, kTeal, 0.65 + 0.35 * smoothstep(-0.08, -0.02, d));
  col = mix(col, fillTeal, inside);

  float near = smoothstep(0.09, 0.0, band);
  col += kCoral * near * 0.55 * (1.0 - inside);

  float seam = smoothstep(0.022, 0.0, abs(dCircle - dBox));
  col += kTeal * seam * 0.08 * smoothstep(0.02, 0.0, d);

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
