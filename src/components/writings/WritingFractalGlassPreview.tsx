import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const RESTING_POINTER = { x: 0.5, y: 0.5 }

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRACTAL_GLASS_FRAG = /* glsl */ `
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerGrip;
uniform float uTime;
uniform float uScene;
uniform float uColumns;
uniform float uLensGain;
uniform float uFluid;
uniform float uTurbulence;
uniform float uGlass;
uniform float uWallEdge;

varying vec2 vUv;

const float TAU = 6.2831853;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), f.x),
    mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.02 + vec2(11.3, 7.7);
    amplitude *= 0.5;
  }
  return value;
}

/* Absolute-value octaves: the folds at each zero crossing are the creases that
   make the sheet read as poured rather than extruded. */
float turbulence(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    value += abs(valueNoise(p) * 2.0 - 1.0) * amplitude;
    p = p * 2.11 + vec2(5.2, 19.4);
    amplitude *= 0.5;
  }
  return value;
}

vec3 sceneDeepField(vec2 uv) {
  float glow = clamp(
    1.0 - length((uv - vec2(0.24, -0.06)) * vec2(0.78, 1.05)),
    0.0,
    1.0
  );
  vec3 color = mix(
    vec3(0.016, 0.043, 0.204),
    vec3(0.078, 0.322, 0.847),
    smoothstep(0.0, 0.92, glow)
  );
  color = mix(color, vec3(0.855, 0.933, 1.0), pow(glow, 3.2));
  return color;
}

vec3 sceneRuleGrid(vec2 uv) {
  vec2 cell = uv * vec2(8.0, 5.0);
  float rule = step(0.84, fract(cell.x));
  float row = step(0.9, fract(cell.y));
  float mark = max(rule, row);
  float block = step(0.58, valueNoise(floor(cell) * 0.63 + 4.1));
  vec3 color = mix(vec3(0.902, 0.894, 0.851), vec3(0.043, 0.055, 0.078), mark * 0.92);
  color = mix(color, vec3(0.937, 0.361, 0.208), block * (1.0 - mark) * 0.62);
  return color;
}

vec3 sceneNebula(vec2 uv) {
  float broad = fbm(uv * vec2(3.6, 2.3) + vec2(9.1, 3.3));
  float tight = fbm(uv * vec2(7.4, 4.8) + vec2(21.7, 14.2));
  vec3 color = mix(
    vec3(0.031, 0.020, 0.086),
    vec3(0.639, 0.118, 0.451),
    smoothstep(0.24, 0.86, broad)
  );
  color = mix(color, vec3(0.157, 0.718, 0.678), smoothstep(0.44, 0.96, tight) * 0.62);
  color += vec3(0.9, 0.86, 1.0) * pow(smoothstep(0.62, 1.0, broad * tight * 2.1), 3.0) * 0.55;
  return color;
}

vec3 sceneSpectrumBars(vec2 uv) {
  float bar = floor(uv.x * 7.0);
  /* A hue step coprime with the bar count keeps neighbours contrasting, so the
     bar boundaries stay legible after the lens compresses them. */
  float hue = fract(bar * 0.41 + 0.08);
  vec3 base = 0.5 + 0.5 * cos(TAU * (hue + vec3(0.0, 0.33, 0.67)));
  vec3 color = mix(base * 0.14, base, smoothstep(0.0, 1.0, uv.y));
  color = mix(color, vec3(1.0), smoothstep(0.88, 1.0, uv.y) * 0.55);
  return color;
}

/* The scene is a function, not a framebuffer: it answers for coordinates outside
   the unit square, so a lens offset never has to be clamped or wrapped. */
vec3 scene(vec2 uv) {
  if (uScene < 0.5) return sceneDeepField(uv);
  if (uScene < 1.5) return sceneRuleGrid(uv);
  if (uScene < 2.5) return sceneNebula(uv);
  return sceneSpectrumBars(uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * 0.06;

  vec2 grip = (uv - uPointer) * vec2(aspect, 1.0);
  float reach = exp(-9.0 * dot(grip, grip)) * uPointerGrip;

  vec2 creaseDomain = vec2(uv.x * aspect, uv.y) * mix(1.4, 5.2, uTurbulence)
    + vec2(time * 0.7, time)
    + (uPointer - 0.5) * 2.4;
  float creases = turbulence(creaseDomain) - 0.42;

  float bend = creases * uFluid * 0.28 - reach * grip.x * 0.55;
  float xScaled = (uv.x + bend) * uColumns;
  float columnIndex = floor(xScaled);
  float local = fract(xScaled);
  float lens = local * 2.0 - 1.0;

  float sliceHalf = 0.5 / uColumns;
  float thickness = fbm(vec2(columnIndex * 0.37, uv.y * 2.8 + time * 1.6)) - 0.5;
  float lensOffset = lens * sliceHalf * uLensGain + thickness * uFluid * sliceHalf * 2.6;

  vec2 sampleUv = vec2(
    (columnIndex + 0.5) * sliceHalf * 2.0 + lensOffset,
    uv.y + thickness * uFluid * 0.05
  );

  /* Derivatives of the pre-quantized coordinate: fwidth of the fractional part
     spikes to one at every seam, which the wall-edge modes let you compare. */
  float columnDerivative = fwidth(xScaled);
  float aa = 2.0 * columnDerivative;
  if (uWallEdge < 0.5) {
    aa = 0.06;
  } else if (uWallEdge > 1.5) {
    aa = 2.0 * fwidth(local);
  }

  float wall = smoothstep(1.0 - clamp(aa, 0.0005, 1.0), 1.0, abs(lens));
  float centre = 1.0 - abs(lens);

  vec3 refracted = scene(sampleUv);
  vec3 glass = refracted * (0.86 + 0.3 * pow(centre, 0.7));
  glass = mix(glass, glass * 0.52, wall * 0.85);
  glass += vec3(0.62, 0.76, 1.0) * pow(smoothstep(0.6, 1.0, centre), 3.0) * 0.07;

  /* Below roughly two device pixels per flute the pattern turns to moire, so the
     sheet fades out instead of sparkling. */
  float flutePixels = 1.0 / max(columnDerivative, 1e-5);
  float resolvable = smoothstep(1.6, 3.6, flutePixels);

  vec3 color = mix(scene(uv), glass, uGlass * resolvable);
  gl_FragColor = vec4(color, 1.0);
}
`

type PointerState = {
  x: number
  y: number
  active: boolean
}

type GlassControls = {
  scene: number
  columns: number
  lensGain: number
  fluid: number
  turbulence: number
  glass: number
  wallEdge: number
  reduced: boolean
}

function FractalGlassMesh({
  controls,
  pointerRef,
}: {
  controls: GlassControls
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef({ ...RESTING_POINTER, grip: 0 })
  const clock = useRef(0)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(RESTING_POINTER.x, RESTING_POINTER.y) },
      uPointerGrip: { value: 0 },
      uTime: { value: 0 },
      uScene: { value: controls.scene },
      uColumns: { value: controls.columns },
      uLensGain: { value: controls.lensGain },
      uFluid: { value: controls.fluid },
      uTurbulence: { value: controls.turbulence },
      uGlass: { value: controls.glass },
      uWallEdge: { value: controls.wallEdge },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const step = Math.min(delta, 0.1)
    const target = pointerRef.current
    const targetX = target?.active ? THREE.MathUtils.clamp(target.x, 0, 1) : 0.5
    const targetY = target?.active ? THREE.MathUtils.clamp(target.y, 0, 1) : 0.5
    const targetGrip = target?.active ? 1 : 0

    if (controls.reduced) {
      pointer.current.x = targetX
      pointer.current.y = targetY
      pointer.current.grip = targetGrip
    } else {
      clock.current += step
      pointer.current.x = THREE.MathUtils.damp(pointer.current.x, targetX, 9, step)
      pointer.current.y = THREE.MathUtils.damp(pointer.current.y, targetY, 9, step)
      pointer.current.grip = THREE.MathUtils.damp(pointer.current.grip, targetGrip, 6, step)
    }

    gl.getDrawingBufferSize(resolution)
    const shader = material.current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uPointer.value.set(pointer.current.x, pointer.current.y)
    shader.uPointerGrip.value = pointer.current.grip
    shader.uTime.value = controls.reduced ? 0 : clock.current
    shader.uScene.value = controls.scene
    shader.uColumns.value = controls.columns
    shader.uLensGain.value = controls.lensGain
    shader.uFluid.value = controls.fluid
    shader.uTurbulence.value = controls.turbulence
    shader.uGlass.value = controls.glass
    shader.uWallEdge.value = controls.wallEdge
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={FRACTAL_GLASS_FRAG}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function RangeRow({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
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

const SCENE_LABELS = ['Deep field', 'Rule grid', 'Nebula', 'Spectrum bars']
const WALL_EDGE_LABELS = ['FIXED', 'FWIDTH', 'SEAM']

export type WritingFractalGlassPreviewProps = {
  caption?: string
  height?: number
  className?: string
}

export function WritingFractalGlassPreview({
  caption = 'Drag across the glass to bend the flutes.',
  height = 520,
  className = '',
}: WritingFractalGlassPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ ...RESTING_POINTER, active: false })
  const [scene, setScene] = useState(0)
  const [columns, setColumns] = useState(26)
  const [lensGain, setLensGain] = useState(5.5)
  const [fluid, setFluid] = useState(0.22)
  const [turbulence, setTurbulence] = useState(0.3)
  const [glass, setGlass] = useState(0.85)
  const [wallEdge, setWallEdge] = useState(1)
  const controls: GlassControls = {
    scene,
    columns,
    lensGain,
    fluid,
    turbulence,
    glass,
    wallEdge,
    reduced,
  }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the fractal glass study.
    </p>
  )

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = canvasWrapRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    pointerRef.current.x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
    pointerRef.current.y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
    pointerRef.current.active = true
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current.active = false
  }, [])

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls caption={caption} label="Fractal glass controls" dense>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-scene`}>Environment</label>
          <select
            id={`${uid}-scene`}
            value={scene}
            onChange={(event) => setScene(Number(event.target.value))}
          >
            {SCENE_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <span className="writing-generative-play-preview__control-value">
            {scene + 1}/{SCENE_LABELS.length}
          </span>
        </div>
        <RangeRow
          id={`${uid}-fluid`}
          label="Fluid influence"
          min={0}
          max={1}
          step={0.01}
          value={fluid}
          display={fluid.toFixed(2)}
          onChange={setFluid}
        />
        <RangeRow
          id={`${uid}-turbulence`}
          label="Turbulence"
          min={0}
          max={1}
          step={0.01}
          value={turbulence}
          display={turbulence.toFixed(2)}
          onChange={setTurbulence}
        />
        <RangeRow
          id={`${uid}-glass`}
          label="Glass amount"
          min={0}
          max={1}
          step={0.01}
          value={glass}
          display={glass.toFixed(2)}
          onChange={setGlass}
        />
        <RangeRow
          id={`${uid}-columns`}
          label="Flutes"
          min={4}
          max={480}
          step={1}
          value={columns}
          display={`${columns}`}
          onChange={setColumns}
        />
        <RangeRow
          id={`${uid}-gain`}
          label="Lens gain"
          min={0}
          max={16}
          step={0.1}
          value={lensGain}
          display={lensGain.toFixed(1)}
          onChange={setLensGain}
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-wall`}>Wall edge</label>
          <select
            id={`${uid}-wall`}
            value={wallEdge}
            onChange={(event) => setWallEdge(Number(event.target.value))}
          >
            <option value={0}>Fixed band</option>
            <option value={1}>fwidth, pre-fract</option>
            <option value={2}>fwidth, post-fract</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {WALL_EDGE_LABELS[wallEdge]}
          </span>
        </div>
      </WritingPreviewControls>
      <div
        ref={canvasWrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={{ height: `${height}px`, cursor: 'ew-resize' }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Fluted glass effect: a procedural scene re-imaged through a field of vertical glass columns that bend toward the pointer"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <FractalGlassMesh controls={controls} pointerRef={pointerRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
