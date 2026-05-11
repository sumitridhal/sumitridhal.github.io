precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  float b = 0.028;
  vec3 borderRgb = vec3(0.94, 0.92, 0.88);
  if (uv.x < b || uv.x > 1.0 - b || uv.y < b || uv.y > 1.0 - b) {
    fragColor = vec4(borderRgb, 1.0);
    return;
  }

  vec2 q = (uv - vec2(b)) / (1.0 - 2.0 * b);
  float cols = 11.0;
  float gx = q.x * cols;
  float colId = floor(gx);
  float colCenter = (cols - 1.0) * 0.5;
  float dCol = abs(colId - colCenter);
  float d = dCol / max(colCenter, 0.001);

  float t = u_time;
  float breathe = 0.045 * sin(t * 0.62);
  float base = mix(0.34, 0.91, pow(d, 1.08)) + breathe;
  float wiggle = 0.032 * sin(t * 1.35 + dCol * 0.85);
  float mx = (u_mouse.x - 0.5) * 0.1;
  float th = clamp(base + wiggle + mx, 0.14, 0.96);

  float distBelow = th - q.y;
  float feather = smoothstep(-0.02, 0.11, distBelow);
  float ug = clamp(pow(max(distBelow, 0.0) / 0.68, 1.12), 0.0, 1.0);

  vec3 deepRed = vec3(0.92, 0.05, 0.12);
  vec3 red = vec3(0.96, 0.14, 0.18);
  vec3 pink = vec3(0.93, 0.48, 0.58);
  vec3 cream = vec3(0.93, 0.91, 0.87);

  vec3 rgb = vec3(0.0);
  rgb = mix(rgb, deepRed, smoothstep(0.0, 0.08, ug));
  rgb = mix(rgb, red, smoothstep(0.05, 0.22, ug));
  rgb = mix(rgb, pink, smoothstep(0.18, 0.48, ug));
  rgb = mix(rgb, cream, smoothstep(0.42, 1.0, ug));
  rgb *= feather;

  float glow = exp(-pow((ug - 0.11) * 16.0, 2.0)) * 0.14;
  rgb += vec3(0.55, 0.03, 0.04) * glow * feather;

  vec2 gPx = floor(q * u_resolution.xy);
  vec2 ringSeed = vec2(dCol * 19.413 + 2.0, dCol * 6.07);
  float n0 = hash21(gPx + ringSeed + t * 67.0);
  float n1 = hash21(gPx * 1.37 + ringSeed.yx - t * 21.3);
  float n2 = hash21(gPx + floor(t * 22.0) + dCol * 3.1);
  float grainLuma =
    (n0 - 0.5) * 0.058 + (n1 - 0.5) * 0.036 + (n2 - 0.5) * 0.022;
  float grainAmp = mix(1.0, 1.2, feather);
  rgb += vec3(grainLuma * grainAmp);

  fragColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}
