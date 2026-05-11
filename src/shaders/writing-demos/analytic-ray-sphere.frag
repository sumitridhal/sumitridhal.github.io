precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 uv = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 ro = vec2(-1.3, -0.15);
  vec2 rd = normalize(vec2(1.0, 0.08));
  vec2 sc = vec2(0.0, 0.0);
  float R = 0.55;
  vec2 oc = ro - sc;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - R * R;
  float h = b * b - c;
  vec3 bg = vec3(0.04, 0.07, 0.1);
  if (h < 0.0) {
    fragColor = vec4(bg, 1.0);
    return;
  }
  float t = -b - sqrt(h);
  vec2 hit = ro + rd * t;
  float disk = 1.0 - smoothstep(R - 0.008, R + 0.008, length(uv - sc));
  float rayVis = 1.0 - smoothstep(0.02, 0.04, abs(uv.y - ro.y) + step(uv.x, ro.x) * 0.001);
  rayVis *= step(ro.x, uv.x) * step(uv.x, hit.x + 0.05);
  vec3 rayCol = vec3(0.85, 0.65, 0.35) * 0.35;
  vec3 sph = vec3(0.45, 0.75, 0.95) * (0.25 + 0.75 * (hit.y / R * 0.5 + 0.5));
  vec3 col = bg;
  col = mix(col, rayCol, rayVis * (1.0 - disk));
  col = mix(col, sph, disk);
  fragColor = vec4(col, 1.0);
}
