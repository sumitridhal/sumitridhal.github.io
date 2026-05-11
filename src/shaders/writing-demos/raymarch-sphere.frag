precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

void main() {
  vec2 uv = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float t = u_time * 0.45;
  vec3 ro = vec3(0.0, 0.0, 3.2);
  vec3 rd = normalize(vec3(uv, -1.8));
  float ca = cos(t);
  float sa = sin(t);
  rd.xz = mat2(ca, -sa, sa, ca) * rd.xz;
  float tot = 0.0;
  vec3 p = ro;
  vec3 col = vec3(0.06, 0.1, 0.14);
  for (int i = 0; i < 64; i++) {
    float d = sdSphere(p, 0.65);
    if (d < 0.0008) {
      vec3 n = normalize(p);
      vec3 ld = normalize(vec3(0.4, 0.85, 0.35));
      float diff = max(dot(n, ld), 0.0);
      col = vec3(0.55, 0.82, 0.95) * diff + vec3(0.08, 0.12, 0.18);
      break;
    }
    p += rd * max(d, 0.0005);
    tot += d;
    if (tot > 14.0) break;
  }
  fragColor = vec4(col, 1.0);
}
