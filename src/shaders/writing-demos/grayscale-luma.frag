precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

/** Rec.709 luma — common default for video and real-time shading. */
float luminance709(vec3 rgb) {
  return dot(rgb, vec3(0.2126, 0.7152, 0.0722));
}

vec3 scene(vec2 uv) {
  vec2 m = u_mouse.xy;
  float t = u_time * 0.45;
  float d0 = length(uv - m);
  float d1 = length(uv - vec2(0.28 + sin(t) * 0.06, 0.55));
  float d2 = length(uv - vec2(0.75, 0.32 + cos(t * 0.8) * 0.08));
  vec3 c0 = vec3(0.95, 0.35, 0.28);
  vec3 c1 = vec3(0.22, 0.72, 0.95);
  vec3 c2 = vec3(0.55, 0.95, 0.42);
  float k = 4.2;
  vec3 rgb =
    c0 * exp(-d0 * k) * 0.9 + c1 * exp(-d1 * k * 0.85) * 0.75 + c2 * exp(-d2 * k * 0.9) * 0.65;
  float vign = smoothstep(1.15, 0.25, length(uv - 0.5) * 1.25);
  rgb *= vign;
  float grid = 0.5 + 0.5 * sin(uv.x * 28.0 + t) * sin(uv.y * 22.0 - t * 0.6);
  rgb += vec3(0.04, 0.05, 0.06) * grid * vign;
  return clamp(rgb, 0.0, 1.0);
}

void main() {
  vec3 rgb = scene(v_uv);
  float y = luminance709(rgb);
  fragColor = vec4(vec3(y), 1.0);
}
