precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.4;
  vec3 a = vec3(0.15, 0.35, 0.55);
  vec3 b = vec3(0.95, 0.72, 0.35);
  vec3 c = vec3(0.55, 0.2, 0.45);
  float w = sin(uv.x * 6.28318 + t) * 0.5 + 0.5;
  float w2 = sin(uv.y * 6.28318 - t * 0.7) * 0.5 + 0.5;
  vec3 col = mix(mix(a, b, w), c, w2 * 0.45);
  float grid = smoothstep(0.98, 1.0, max(fract(uv.x * u_resolution.x / 40.0), fract(uv.y * u_resolution.y / 40.0)));
  col = mix(col, col * 1.15, grid * 0.12);
  fragColor = vec4(col, 1.0);
}
