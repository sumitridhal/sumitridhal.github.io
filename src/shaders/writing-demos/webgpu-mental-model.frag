precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  float t = u_time * 0.25;
  vec2 uv = v_uv;
  float band = floor(uv.y * 5.0);
  float slide = fract(uv.x * 3.0 + t + band * 0.17);
  vec3 c0 = vec3(0.2, 0.45, 0.75);
  vec3 c1 = vec3(0.85, 0.55, 0.28);
  vec3 c2 = vec3(0.45, 0.75, 0.55);
  vec3 base = mix(c0, c1, smoothstep(0.2, 0.8, slide));
  base = mix(base, c2, step(0.5, mod(band, 2.0)) * 0.25);
  float grid = smoothstep(0.97, 1.0, fract(uv.x * u_resolution.x / 28.0));
  base = mix(base, base * 1.08, grid * 0.2);
  fragColor = vec4(base * 0.55, 1.0);
}
