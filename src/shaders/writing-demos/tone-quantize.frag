precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  float y = v_uv.y;
  float lum = mix(0.05, 0.95, y);
  float bits = mix(3.0, 64.0, u_mouse.z);
  float levels = max(bits, 2.0);
  float q = floor(lum * levels + 0.001) / levels;
  vec3 ref = vec3(mix(0.12, 0.95, lum));
  vec3 qcol = vec3(q);
  float split = step(0.5, v_uv.x);
  vec3 col = mix(qcol, ref, split);
  float line = 1.0 - smoothstep(0.003, 0.008, abs(v_uv.x - 0.5));
  col += vec3(0.12) * line;
  fragColor = vec4(col, 1.0);
}
