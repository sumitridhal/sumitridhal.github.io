precision highp float;

uniform sampler2D u_prev;
uniform vec2 u_resolution;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 px = v_uv;
  vec3 prev = texture(u_prev, px).rgb;
  prev *= 0.965;
  vec2 m = u_mouse.xy;
  float d = distance(px, m);
  float stamp = smoothstep(0.12, 0.0, d) * 0.22;
  vec3 acc = prev + vec3(stamp * 0.95, stamp * 0.55, stamp * 0.2);
  fragColor = vec4(clamp(acc, 0.0, 1.0), 1.0);
}
