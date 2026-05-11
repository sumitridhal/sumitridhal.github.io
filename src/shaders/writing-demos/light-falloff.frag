precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 m = u_mouse.xy;
  float d = max(distance(v_uv, m), 0.001);
  float mode = step(0.5, u_mouse.z);
  float invSq = 1.0 / (1.0 + 18.0 * d * d);
  float smoothWin = pow(max(1.0 - d * 1.8, 0.0), 2.2);
  float lit = mix(invSq, smoothWin, mode);
  vec3 warm = vec3(1.0, 0.82, 0.55);
  vec3 cool = vec3(0.04, 0.06, 0.09);
  vec3 col = mix(cool, warm, lit);
  fragColor = vec4(col, 1.0);
}
