precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  float angle = u_time * 0.35;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 uv = (v_uv - 0.5) * rot + 0.5;
  float cell = 18.0;
  vec2 g = fract(uv * cell) - 0.5;
  float tone = length(v_uv - 0.5) * 1.15 + 0.12;
  tone = smoothstep(0.05, 0.95, tone);
  float r = sqrt(tone) * 0.48;
  float m = 1.0 - smoothstep(r - 0.02, r + 0.02, length(g));
  vec3 paper = vec3(0.96, 0.94, 0.88);
  vec3 ink = vec3(0.06, 0.12, 0.08);
  vec3 col = mix(paper, ink, m);
  fragColor = vec4(col, 1.0);
}
