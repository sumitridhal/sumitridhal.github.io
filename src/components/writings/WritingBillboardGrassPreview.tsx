import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const BLADE_COUNT = 11000

/* Wide enough that the scatter rim stays inside the haze from any orbit angle. */
const FIELD_RADIUS = 4.4

/* Wide enough that its rim sits past the haze, so there is no visible edge. */
const GROUND_RADIUS = 26

const CAMERA_POSITION: [number, number, number] = [0, 1.22, 2.35]
const CAMERA_TARGET: [number, number, number] = [0, 0.14, -0.9]

/* Reduced motion holds a phase with visible bend rather than an unbent field. */
const FROZEN_WIND_PHASE = 1.35

const ALPHA_MODES = ['smooth', 'dithered', 'cut'] as const
type AlphaMode = (typeof ALPHA_MODES)[number]

const GRASS_COMMON = /* glsl */ `
const vec3 BG = vec3(0.063, 0.086, 0.098);

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v * 1.142857;
}

vec3 grassRamp(float t) {
  vec3 shade = vec3(0.048, 0.105, 0.072);
  vec3 body = vec3(0.135, 0.275, 0.128);
  vec3 sun = vec3(0.352, 0.492, 0.178);
  vec3 dry = vec3(0.618, 0.598, 0.286);
  vec3 c = mix(shade, body, smoothstep(0.0, 0.42, t));
  c = mix(c, sun, smoothstep(0.36, 0.78, t));
  return mix(c, dry, smoothstep(0.74, 1.0, t));
}
`

const GRASS_VERT = /* glsl */ `
attribute vec3 aOffset;
attribute vec2 aScale;
attribute float aYaw;
attribute float aId;

uniform float uWindPhase;
uniform vec2 uWindDir;
uniform float uWindSpeed;
uniform float uTipBias;
uniform float uBillboard;
uniform float uMirrorWrap;
uniform float uShapeVariants;
uniform float uHighlightCut;
uniform float uFieldRadius;

varying vec2 vUv;
varying vec3 vTint;
varying float vShape;
varying float vHaze;

${GRASS_COMMON}

/* Periodic tent map: mirrors at every inflection instead of wrapping. */
vec2 tentMap(vec2 uv) {
  vec2 f = fract(uv * 0.5);
  return 2.0 * min(f, 1.0 - f);
}

float randomf(float index, float seed) {
  return sin(index + seed) * 0.5 + 0.5;
}

float windNoise(vec2 worldXz) {
  vec2 uv = worldXz * 0.19 - uWindDir * uWindPhase;
  vec2 wrapped = mix(fract(uv), tentMap(uv), uMirrorWrap);
  return fbm(wrapped * 3.0);
}

void main() {
  vUv = uv;
  vShape = mod(aId, uShapeVariants);

  float tone = fbm(aOffset.xz * 0.34 + vec2(11.3, 4.7));
  tone += step(randomf(aId, 1.0), uHighlightCut) * 0.4;
  vTint = grassRamp(clamp(tone, 0.0, 1.0));

  vec3 camRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 right = mix(vec3(cos(aYaw), 0.0, sin(aYaw)), camRight, uBillboard);
  vec3 up = mix(vec3(0.0, 1.0, 0.0), camUp, uBillboard);

  vec3 worldPos =
    aOffset +
    right * (position.x * aScale.x) +
    up * (position.y * aScale.y);

  float affect = pow(max(uv.y, 0.0001), uTipBias);
  float bend = windNoise(aOffset.xz) * uWindSpeed * 0.34 * affect;
  worldPos += vec3(uWindDir.x, 0.0, uWindDir.y) * bend;

  vHaze = smoothstep(0.62, 1.06, length(aOffset.xz) / uFieldRadius);
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`

const GRASS_FRAG = /* glsl */ `
uniform float uAlphaMode;
uniform float uAlphaCutStart;
uniform float uAlphaCutEnd;

varying vec2 vUv;
varying vec3 vTint;
varying float vShape;
varying float vHaze;

${GRASS_COMMON}

const vec3 UP = vec3(0.0, 1.0, 0.0);
const vec3 LIGHT = vec3(0.3216, 0.7504, 0.5743);

float bayer2(vec2 coord) {
  vec2 a = floor(coord);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 coord) {
  return bayer2(coord * 0.5) * 0.25 + bayer2(coord);
}

/* Half-width at the base, taper exponent, tip lean. */
vec3 bladeProfile(float shape) {
  if (shape < 0.5) return vec3(0.44, 0.85, 0.10);
  if (shape < 1.5) return vec3(0.33, 1.50, -0.17);
  if (shape < 2.5) return vec3(0.39, 0.55, 0.23);
  return vec3(0.27, 1.05, -0.05);
}

float bladeAlpha(vec2 uv, float shape) {
  vec3 prof = bladeProfile(shape);
  float t = clamp(uv.y, 0.0, 1.0);
  float halfWidth = prof.x * pow(1.0 - t, prof.y) + 0.02;
  float lean = prof.z * t * t;
  float d = abs(uv.x - 0.5 - lean);
  return 1.0 - smoothstep(halfWidth - 0.045, halfWidth + 0.045, d);
}

void main() {
  float shapeValue = bladeAlpha(vUv, vShape);

  float ndotl = max(dot(LIGHT, UP), 0.0);
  vec3 color = vTint * (0.44 + 0.56 * ndotl);
  color = mix(color, BG, vHaze);

  if (uAlphaMode < 0.5) {
    gl_FragColor = vec4(color, shapeValue);
    return;
  }

  float alpha = clamp(
    (shapeValue - uAlphaCutStart) / (uAlphaCutEnd - uAlphaCutStart),
    0.0,
    1.0
  );
  if (uAlphaMode < 1.5) {
    alpha = step(bayer4(gl_FragCoord.xy) + 0.01, alpha);
  }
  if (alpha < 0.1) discard;

  gl_FragColor = vec4(color, alpha);
}
`

const GROUND_VERT = /* glsl */ `
varying vec3 vWorld;

void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`

const GROUND_FRAG = /* glsl */ `
uniform float uFieldRadius;

varying vec3 vWorld;

${GRASS_COMMON}

void main() {
  float tone = fbm(vWorld.xz * 0.34 + vec2(11.3, 4.7));
  vec3 color = grassRamp(clamp(tone, 0.0, 1.0)) * 0.3;
  float haze = smoothstep(0.62, 1.34, length(vWorld.xz) / uFieldRadius);
  gl_FragColor = vec4(mix(color, BG, haze), 1.0);
}
`

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildBladeGeometry(count: number): THREE.InstancedBufferGeometry {
  const quad = new THREE.PlaneGeometry(1, 1, 1, 5)
  quad.translate(0, 0.5, 0)

  const geometry = new THREE.InstancedBufferGeometry()
  geometry.index = quad.index
  geometry.setAttribute('position', quad.getAttribute('position'))
  geometry.setAttribute('uv', quad.getAttribute('uv'))
  geometry.instanceCount = count

  const offset = new Float32Array(count * 3)
  const scale = new Float32Array(count * 2)
  const yaw = new Float32Array(count)
  const id = new Float32Array(count)
  const random = mulberry32(0x51a3)

  for (let i = 0; i < count; i += 1) {
    const radius = FIELD_RADIUS * Math.sqrt(random())
    const angle = random() * Math.PI * 2
    offset[i * 3] = Math.cos(angle) * radius
    offset[i * 3 + 2] = Math.sin(angle) * radius
    scale[i * 2] = 0.07 + random() * 0.05
    scale[i * 2 + 1] = 0.34 + random() * 0.28
    yaw[i] = random() * Math.PI
    id[i] = i
  }

  geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offset, 3))
  geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scale, 2))
  geometry.setAttribute('aYaw', new THREE.InstancedBufferAttribute(yaw, 1))
  geometry.setAttribute('aId', new THREE.InstancedBufferAttribute(id, 1))

  return geometry
}

type GrassControls = {
  windSpeed: number
  windAngle: number
  tipBias: number
  mirrorWrap: boolean
  billboard: boolean
  alphaMode: AlphaMode
  shapeVariants: number
  highlightCut: number
  reduced: boolean
}

function GrassField({ controls }: { controls: GrassControls }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const phase = useRef(FROZEN_WIND_PHASE)
  const geometry = useMemo(() => buildBladeGeometry(BLADE_COUNT), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uWindPhase: { value: FROZEN_WIND_PHASE },
      uWindDir: { value: new THREE.Vector2(1, 0) },
      uWindSpeed: { value: controls.windSpeed },
      uTipBias: { value: controls.tipBias },
      uBillboard: { value: 0 },
      uMirrorWrap: { value: 0 },
      uShapeVariants: { value: controls.shapeVariants },
      uHighlightCut: { value: controls.highlightCut },
      uFieldRadius: { value: FIELD_RADIUS },
      uAlphaMode: { value: 1 },
      uAlphaCutStart: { value: 0.1 },
      uAlphaCutEnd: { value: 0.9 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const radians = (controls.windAngle * Math.PI) / 180
    /* Integrating phase keeps the field still when only the amplitude changes. */
    if (!controls.reduced) {
      phase.current += Math.min(delta, 0.1) * controls.windSpeed * 0.19
    }

    const shader = material.current.uniforms
    shader.uWindPhase.value = controls.reduced ? FROZEN_WIND_PHASE : phase.current
    shader.uWindDir.value.set(Math.cos(radians), Math.sin(radians))
    shader.uWindSpeed.value = controls.windSpeed
    shader.uTipBias.value = controls.tipBias
    shader.uBillboard.value = controls.billboard ? 1 : 0
    shader.uMirrorWrap.value = controls.mirrorWrap ? 1 : 0
    shader.uShapeVariants.value = controls.shapeVariants
    shader.uHighlightCut.value = controls.highlightCut
    shader.uAlphaMode.value = ALPHA_MODES.indexOf(controls.alphaMode)
  })

  const smooth = controls.alphaMode === 'smooth'

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={GRASS_VERT}
        fragmentShader={GRASS_FRAG}
        side={THREE.DoubleSide}
        transparent={smooth}
        depthWrite={!smooth}
      />
    </mesh>
  )
}

function Ground() {
  const uniforms = useMemo(() => ({ uFieldRadius: { value: FIELD_RADIUS } }), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[GROUND_RADIUS, 72]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={GROUND_VERT}
        fragmentShader={GROUND_FRAG}
      />
    </mesh>
  )
}

function GrassScene({ controls }: { controls: GrassControls }) {
  return (
    <>
      <color attach="background" args={['#101619']} />
      <Ground />
      <GrassField controls={controls} />
      <OrbitControls
        makeDefault
        target={CAMERA_TARGET}
        enablePan={false}
        minDistance={1.1}
        maxDistance={6.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.52}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

function RangeRow({
  id,
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{display}</span>
    </div>
  )
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel: string
  offLabel: string
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="writing-generative-play-preview__control-value">
        {checked ? onLabel : offLabel}
      </span>
    </div>
  )
}

export type WritingBillboardGrassPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingBillboardGrassPreview({
  caption = 'Drag to orbit, then push the wind speed up.',
  hint = 'Every blade shares one quad. Shape, colour, sway and highlight are derived from the instance index and the world position, never from authored per-blade data.',
  height = 560,
  className = '',
}: WritingBillboardGrassPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [windSpeed, setWindSpeed] = useState(0.42)
  const [windAngle, setWindAngle] = useState(34)
  const [tipBias, setTipBias] = useState(2)
  const [mirrorWrap, setMirrorWrap] = useState(false)
  const [billboard, setBillboard] = useState(false)
  const [alphaMode, setAlphaMode] = useState<AlphaMode>('dithered')
  const [shapeVariants, setShapeVariants] = useState(4)
  const [highlightCut, setHighlightCut] = useState(0.002)

  const controls: GrassControls = {
    windSpeed,
    windAngle,
    tipBias,
    mirrorWrap,
    billboard,
    alphaMode,
    shapeVariants,
    highlightCut,
    reduced,
  }

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the instanced grass field.
    </p>
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Billboard grass field controls"
        dense
      >
        <RangeRow
          id={`${uid}-wind-speed`}
          label="Wind speed"
          min={0}
          max={1.6}
          step={0.02}
          value={windSpeed}
          display={windSpeed.toFixed(2)}
          onChange={setWindSpeed}
        />
        <RangeRow
          id={`${uid}-wind-angle`}
          label="Wind angle"
          min={0}
          max={360}
          step={1}
          value={windAngle}
          display={`${windAngle}°`}
          onChange={setWindAngle}
        />
        <RangeRow
          id={`${uid}-tip-bias`}
          label="Tip bias"
          min={0}
          max={4}
          step={0.05}
          value={tipBias}
          display={tipBias.toFixed(2)}
          onChange={setTipBias}
        />
        <ToggleRow
          id={`${uid}-wrap`}
          label="Wind wrap"
          checked={mirrorWrap}
          onChange={setMirrorWrap}
          onLabel="MIRROR"
          offLabel="REPEAT"
        />
        <ToggleRow
          id={`${uid}-billboard`}
          label="Billboard"
          checked={billboard}
          onChange={setBillboard}
          onLabel="CAMERA"
          offLabel="FIXED"
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-alpha`}>Alpha</label>
          <select
            id={`${uid}-alpha`}
            value={alphaMode}
            onChange={(event) => setAlphaMode(event.target.value as AlphaMode)}
          >
            <option value="smooth">Smooth</option>
            <option value="dithered">Dithered</option>
            <option value="cut">Cut</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {alphaMode === 'smooth' ? 'BLENDED' : 'OPAQUE'}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-shapes`}>Shapes</label>
          <select
            id={`${uid}-shapes`}
            value={shapeVariants}
            onChange={(event) => setShapeVariants(Number(event.target.value))}
          >
            <option value={1}>One blade</option>
            <option value={2}>Two blades</option>
            <option value={4}>Four blades</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            ID % {shapeVariants}
          </span>
        </div>
        <RangeRow
          id={`${uid}-highlight`}
          label="Highlight cut"
          min={0}
          max={0.25}
          step={0.002}
          value={highlightCut}
          display={highlightCut.toFixed(3)}
          onChange={setHighlightCut}
        />
      </WritingPreviewControls>
      <div
        className="writing-generative-play-preview__canvas-wrap"
        style={{ height: `${height}px` }}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <Canvas
              className="writing-generative-play-preview__canvas"
              role="img"
              aria-label="Interactive field of instanced grass blades bending in procedural wind, with controls for wind, billboarding and alpha mode"
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              camera={{ position: CAMERA_POSITION, fov: 42, near: 0.05, far: 60 }}
            >
              <GrassScene controls={controls} />
            </Canvas>
          </Suspense>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
