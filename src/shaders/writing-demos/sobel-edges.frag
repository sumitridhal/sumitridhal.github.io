precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float field(vec2 uv) {
  vec2 id = floor(uv * 14.0);
  return mod(id.x + id.y, 2.0);
}

void main() {
  vec2 px = vec2(1.0) / u_resolution;
  float tl = field(v_uv + vec2(-px.x, px.y));
  float tm = field(v_uv + vec2(0.0, px.y));
  float tr = field(v_uv + vec2(px.x, px.y));
  float ml = field(v_uv + vec2(-px.x, 0.0));
  float mm = field(v_uv);
  float mr = field(v_uv + vec2(px.x, 0.0));
  float bl = field(v_uv + vec2(-px.x, -px.y));
  float bm = field(v_uv + vec2(0.0, -px.y));
  float br = field(v_uv + vec2(px.x, -px.y));
  float gx = -tl + tr - 2.0 * ml + 2.0 * mr - bl + br;
  float gy = -tl - 2.0 * tm - tr + bl + 2.0 * bm + br;
  float mag = clamp(sqrt(gx * gx + gy * gy) * 0.25, 0.0, 1.0);
  vec3 edge = vec3(mag * 0.9, mag * 0.35, mag * 0.55);
  float base = mm * 0.12;
  fragColor = vec4(edge + vec3(base), 1.0);
}
