precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
in vec2 v_uv;
out vec4 fragColor;

float bayer4(vec2 fragPx) {
  ivec2 p = ivec2(mod(fragPx, 4.0));
  int i = p.x + p.y * 4;
  float m[16] = float[](
    0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,
    12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,
    3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,
    15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0
  );
  return m[i];
}

void main() {
  vec2 fragPx = floor(v_uv * u_resolution);
  float y = v_uv.y;
  float lum = mix(0.08, 0.92, y);
  float mode = u_mouse.z;
  float levels = 32.0;
  float q = floor(lum * levels + 0.001) / levels;
  float d = bayer4(fragPx) - 0.5;
  float dithered = lum + d * (0.85 / levels);
  float qd = floor(dithered * levels + 0.5) / levels;
  float outL = mix(q, qd, mode);
  vec3 col = vec3(outL);
  fragColor = vec4(col, 1.0);
}
