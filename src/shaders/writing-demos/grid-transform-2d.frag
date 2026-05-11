precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  float ang = u_mouse.z * 6.2831853 + u_time * 0.12;
  float scale = mix(0.45, 1.6, u_mouse.w);
  vec2 uv = v_uv - 0.5;
  uv /= scale;
  float ca = cos(ang);
  float sa = sin(ang);
  uv = mat2(ca, -sa, sa, ca) * uv + 0.5;
  vec2 g = fract(uv * 12.0);
  float line = smoothstep(0.94, 0.98, max(g.x, g.y));
  vec3 bg = vec3(0.05, 0.08, 0.11);
  vec3 grid = vec3(0.45, 0.72, 0.95);
  fragColor = vec4(mix(bg, grid, line * 0.85), 1.0);
}
