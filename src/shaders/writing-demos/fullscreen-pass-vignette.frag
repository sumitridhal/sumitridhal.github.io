precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  vec2 c = uv - 0.5;
  float vig = 1.0 - dot(c, c) * 1.35;
  vig = smoothstep(0.15, 1.0, vig);
  float scan = sin(uv.y * u_resolution.y * 0.85 + u_time * 2.0) * 0.5 + 0.5;
  scan = mix(0.92, 1.0, scan);
  float n = hash(floor(uv * u_resolution * 0.5) + floor(u_time * 60.0));
  vec3 base = mix(vec3(0.04, 0.08, 0.12), vec3(0.12, 0.18, 0.28), uv.y);
  vec3 glow = vec3(0.35, 0.55, 0.85) * (0.08 + 0.06 * sin(u_time * 0.5 + uv.x * 3.0));
  vec3 col = base + glow * vig;
  col *= scan;
  col += (n - 0.5) * 0.02;
  fragColor = vec4(col, 1.0);
}
