/** Vertex shader for `PlaneGeometry(2,2)` + RawShaderMaterial (GLSL3) — outputs `v_uv` for existing writing-demo fragments. Omit `#version`; Three injects it when `glslVersion: THREE.GLSL3`. */
export const WRITING_SHADER_FULLSCREEN_VERT_THREE = `precision highp float;
in vec3 position;
in vec2 uv;
out vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`
