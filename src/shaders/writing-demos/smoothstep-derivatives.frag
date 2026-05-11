precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  float split = 0.5;
  float x = v_uv.x;
  float band = sin((v_uv.y - 0.5) * 12.0 + u_time * 0.8) * 0.5 + 0.5;
  float edge = x - (0.35 + band * 0.3);
  vec3 leftCol = vec3(0.08, 0.1, 0.16);
  vec3 rightCol = vec3(0.85, 0.55, 0.35);
  vec3 col;
  if (x < split) {
    float s = smoothstep(-0.04, 0.04, edge);
    col = mix(leftCol, rightCol, s);
  } else {
    float w = fwidth(edge);
    w = max(w, 0.002);
    float s = smoothstep(-w, w, edge);
    col = mix(leftCol, rightCol, s);
  }
  float line = 1.0 - smoothstep(0.002, 0.006, abs(x - split));
  col += vec3(0.15, 0.18, 0.22) * line;
  fragColor = vec4(col, 1.0);
}
