import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const MASKED_WARP_FRAG = /* glsl */ `
uniform sampler2D uBase;
uniform sampler2D uReveal;
uniform sampler2D uShape;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uTime;
uniform float uAmount;
uniform float uFrequency;
uniform float uOctaves;
uniform float uFactor;
uniform float uTiling;
uniform float uFeathering;
uniform float uSides;
uniform float uIrregularity;
uniform float uTurbulent;
uniform float uShading;
uniform float uMaskEnabled;
uniform vec2 uCenter;
uniform vec2 uPointerDrift;

varying vec2 vUv;

const vec3 FRAME_BACKGROUND = vec3(0.043, 0.051, 0.071);
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const float POLYGON_RADIUS = 0.145;
const float REVEAL_WIDTH = 0.42;
const float SHAPE_THRESHOLD = 1.0;
const float SHAPE_ROTATION = 0.6981317;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.0, 289.0))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float layeredNoise(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  mat2 octaveTransform = mat2(1.6, 1.2, -1.2, 1.6);

  for (int i = 0; i < 6; i++) {
    if (float(i) < uOctaves) {
      float signedNoise = valueNoise(p) - 0.5;
      float ridge = abs(signedNoise) * 2.0 - 0.5;
      sum += amplitude * mix(signedNoise, ridge, uTurbulent);
    }
    p = octaveTransform * p;
    amplitude *= 0.5;
  }
  return sum;
}

/**
 * Reference layer 03 is a "Polygon · Solid" whose edges stay razor-sharp at any
 * size, so the outline is a straight-edged polygon SDF with no time input. The
 * irregularity below is a fixed per-edge radius, not an animated wobble.
 */
float polygonField(vec2 uv) {
  vec2 p = uv - uCenter;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  float sides = max(uSides, 3.0);
  float sector = 6.28318531 / sides;
  float angle = atan(p.x, p.y) + 3.14159265;
  float edgeIndex = floor(0.5 + angle / sector);

  // Perturbing the radius per edge keeps the facets flat while breaking symmetry.
  float irregular = 1.0 + uIrregularity * (valueNoise(vec2(edgeIndex * 1.37, 4.21)) - 0.5);

  return cos(edgeIndex * sector - angle) * length(p) - POLYGON_RADIUS * irregular;
}

vec2 rotateUv(vec2 uv, vec2 pivot, float angle) {
  mat2 rotation = mat2(vec2(sin(angle), -cos(angle)), vec2(cos(angle), sin(angle)));
  return (uv - pivot) * rotation + pivot;
}

/**
 * Ported from a Godot canvas_item dissolve: a gradient decides the reveal
 * order, a tiled shape decides which pixels inside the band flip first. Here
 * the polygon field supplies the gradient, so the stencil keeps its facets
 * while its edge breaks up into the shape lattice.
 */
float shapedReveal(vec2 uv, float field, vec2 scroll) {
  float gradient = -field / POLYGON_RADIUS;
  float progress = mix(-REVEAL_WIDTH, 1.0, uFactor);
  float value = clamp((gradient - progress) / REVEAL_WIDTH, 0.0, 1.0);

  float aspect = uResolution.y / max(uResolution.x, 1.0);
  vec2 aspectUv = (uv - vec2(0.0, 0.5)) * vec2(1.0, aspect) + vec2(0.0, 0.5);
  vec2 tiledUv = fract(rotateUv(aspectUv, vec2(0.5), SHAPE_ROTATION) * uTiling + scroll);

  // smoothstep needs edge0 < edge1, so the band can narrow but never collapse.
  float feathering = max(uFeathering, 0.002);
  float shape = 1.0 - texture2D(uShape, tiledUv).r;
  shape = mix(feathering * 0.5, 1.0 - feathering * 0.5, shape);

  float hidden = smoothstep(
    value - feathering * 0.5,
    value + feathering * 0.5,
    SHAPE_THRESHOLD - shape
  );
  return 1.0 - hidden;
}

vec2 containUv(vec2 uv, out float inside) {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 scale = canvasAspect > uImageAspect
    ? vec2(canvasAspect / uImageAspect, 1.0)
    : vec2(1.0, uImageAspect / canvasAspect);
  vec2 imageUv = (uv - 0.5) * scale + 0.5;
  inside =
    step(0.0, imageUv.x) *
    step(imageUv.x, 1.0) *
    step(0.0, imageUv.y) *
    step(imageUv.y, 1.0);
  return clamp(imageUv, 0.002, 0.998);
}

void main() {
  vec2 uv = vUv;
  float phase = 6.28318531 * mod(uTime / 6.0, 1.0);
  vec2 loopPoint = vec2(cos(phase), sin(phase)) * 0.34;

  vec2 noiseUv = uv * uFrequency;
  vec2 warp = vec2(
    layeredNoise(noiseUv + loopPoint + uPointerDrift),
    layeredNoise(noiseUv + vec2(7.13, -3.71) - loopPoint + uPointerDrift)
  );

  // One whole tile per loop, so the dissolve seams no matter how it is tiled.
  vec2 scroll = vec2(1.0, -1.0) * mod(uTime / 6.0, 1.0);
  float aperture = shapedReveal(uv, polygonField(uv), scroll);
  float imageInside;
  vec2 imageUv = containUv(uv, imageInside);
  float warpedInside;
  vec2 warpedUv = containUv(uv + warp * uAmount, warpedInside);
  float mask = mix(imageInside, aperture * imageInside, uMaskEnabled);

  vec3 untouched = mix(FRAME_BACKGROUND, texture2D(uBase, imageUv).rgb, imageInside);
  vec3 displaced = mix(FRAME_BACKGROUND, texture2D(uBase, warpedUv).rgb, warpedInside);
  vec3 base = mix(untouched, displaced, mask);
  vec3 revealed = texture2D(uReveal, warpedUv).rgb;
  float baseLuma = max(dot(base, LUMA), 0.08);
  float revealLuma = dot(revealed, LUMA);
  vec3 shadingBlend = clamp(base * (revealLuma / baseLuma), 0.0, 1.0);
  vec3 composite = mix(revealed, shadingBlend, uShading);
  vec3 color = mix(base, composite, mask * 0.94);

  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * Both are image UV, not canvas UV: the artwork is letterboxed by containUv(), so
 * anything anchored to the artwork has to be converted per frame or it drifts
 * off the scene as the canvas changes shape.
 */
const RESTING_CENTER = { x: 0.52, y: 0.53 }

/** Keep the reveal over the shared artwork while allowing it to reach the frame edges. */
const SUBJECT_BOUNDS = { minX: 0.08, maxX: 0.92, minY: 0.08, maxY: 0.92 }

/** Inverse of containUv() in the shader, so JS and GLSL agree on where the artwork sits. */
function imageToCanvasUv(x: number, y: number, canvasAspect: number, imageAspect: number) {
  const wide = canvasAspect > imageAspect
  const scaleX = wide ? canvasAspect / imageAspect : 1
  const scaleY = wide ? 1 : imageAspect / canvasAspect
  return { x: (x - 0.5) / scaleX + 0.5, y: (y - 0.5) / scaleY + 0.5 }
}

const BASE_TEXTURE_SRC = '/media/writings/masked-noise-warp/illustration.jpg'
const REVEAL_TEXTURE_SRC = '/media/writings/masked-noise-warp/photoreal.jpg'

/**
 * One tileable cell for the dissolve. Dark pixels cross the reveal threshold
 * first, so a dark-centred dot opens as a growing circle inside the band.
 */
function makeShapeTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create the dissolve shape texture')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)

  const dot = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.5)
  dot.addColorStop(0, '#000000')
  dot.addColorStop(0.72, '#b4b4b4')
  dot.addColorStop(1, '#ffffff')
  context.fillStyle = dot
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

type PointerState = {
  x: number
  y: number
  active: boolean
}

type WarpControls = {
  amount: number
  frequency: number
  octaves: number
  factor: number
  tiling: number
  feathering: number
  sides: number
  irregularity: number
  turbulent: boolean
  shading: boolean
  maskEnabled: boolean
  looping: boolean
  reduced: boolean
}

function MaskedWarpMesh({
  controls,
  pointerRef,
}: {
  controls: WarpControls
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const center = useRef({ ...RESTING_CENTER })
  const { gl, size } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const [baseTexture, revealTexture] = useLoader(THREE.TextureLoader, [
    BASE_TEXTURE_SRC,
    REVEAL_TEXTURE_SRC,
  ])
  const textures = useMemo(() => {
    const base = baseTexture.clone()
    const reveal = revealTexture.clone()
    for (const texture of [base, reveal]) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }
    return { base, reveal, shape: makeShapeTexture() }
  }, [baseTexture, revealTexture])
  const imageAspect = useMemo(() => {
    const image = textures.base.image as { width?: number; height?: number } | undefined
    if (!image?.width || !image.height) return 1
    return image.width / image.height
  }, [textures])

  const uniforms = useMemo(
    () => ({
      uBase: { value: textures.base },
      uReveal: { value: textures.reveal },
      uShape: { value: textures.shape },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageAspect: { value: 1 },
      uTime: { value: 0 },
      uAmount: { value: controls.amount },
      uFrequency: { value: controls.frequency },
      uOctaves: { value: controls.octaves },
      uFactor: { value: controls.factor },
      uTiling: { value: controls.tiling },
      uFeathering: { value: controls.feathering },
      uSides: { value: controls.sides },
      uIrregularity: { value: controls.irregularity },
      uTurbulent: { value: controls.turbulent ? 1 : 0 },
      uShading: { value: controls.shading ? 1 : 0 },
      uMaskEnabled: { value: controls.maskEnabled ? 1 : 0 },
      uCenter: { value: new THREE.Vector2(RESTING_CENTER.x, RESTING_CENTER.y) },
      uPointerDrift: { value: new THREE.Vector2(0, 0) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useEffect(
    () => () => {
      textures.base.dispose()
      textures.reveal.dispose()
      textures.shape.dispose()
    },
    [textures],
  )

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    resolution.set(size.width * dpr, size.height * dpr)
  }, [gl, resolution, size.height, size.width])

  useFrame(({ clock }, delta) => {
    if (!material.current) return
    const shader = material.current.uniforms
    const pointer = pointerRef.current
    const canvasAspect = resolution.x / Math.max(resolution.y, 1)
    const lower = imageToCanvasUv(
      SUBJECT_BOUNDS.minX,
      SUBJECT_BOUNDS.minY,
      canvasAspect,
      imageAspect,
    )
    const upper = imageToCanvasUv(
      SUBJECT_BOUNDS.maxX,
      SUBJECT_BOUNDS.maxY,
      canvasAspect,
      imageAspect,
    )
    const resting = imageToCanvasUv(
      RESTING_CENTER.x,
      RESTING_CENTER.y,
      canvasAspect,
      imageAspect,
    )

    // Clamped to the shared artwork so the reveal never hovers over the frame.
    const targetX = pointer?.active
      ? THREE.MathUtils.clamp(pointer.x, lower.x, upper.x)
      : resting.x
    const targetY = pointer?.active
      ? THREE.MathUtils.clamp(pointer.y, lower.y, upper.y)
      : resting.y
    const step = Math.min(delta, 0.1)

    center.current.x = controls.reduced
      ? targetX
      : THREE.MathUtils.damp(center.current.x, targetX, 7, step)
    center.current.y = controls.reduced
      ? targetY
      : THREE.MathUtils.damp(center.current.y, targetY, 7, step)

    shader.uCenter.value.set(center.current.x, center.current.y)
    shader.uPointerDrift.value.set(
      (center.current.x - resting.x) * 1.8,
      (center.current.y - resting.y) * 1.8,
    )
    shader.uResolution.value.copy(resolution)
    shader.uImageAspect.value = imageAspect
    // Every reference layer is static, so time is pinned unless the loop is
    // switched on. The outline never reads it either way.
    shader.uTime.value = controls.reduced || !controls.looping ? 0 : clock.elapsedTime
    shader.uAmount.value = controls.amount
    shader.uFrequency.value = controls.frequency
    shader.uOctaves.value = controls.octaves
    shader.uFactor.value = controls.factor
    shader.uTiling.value = controls.tiling
    shader.uFeathering.value = controls.feathering
    shader.uSides.value = controls.sides
    shader.uIrregularity.value = controls.irregularity
    shader.uTurbulent.value = controls.turbulent ? 1 : 0
    shader.uShading.value = controls.shading ? 1 : 0
    shader.uMaskEnabled.value = controls.maskEnabled ? 1 : 0
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={MASKED_WARP_FRAG}
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

export type WritingMaskedNoiseWarpPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingMaskedNoiseWarpPreview({
  caption = 'Move the pointer to open the reveal.',
  hint = 'Two registered renderings become one reveal study. Move across the illustration to uncover its photoreal counterpart, or scrub the dissolve factor to close the aperture.',
  height = 580,
  className = '',
}: WritingMaskedNoiseWarpPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ ...RESTING_CENTER, active: false })
  const [amount, setAmount] = useState(0.035)
  const [frequency, setFrequency] = useState(5.2)
  const [octaves, setOctaves] = useState(5)
  const [factor, setFactor] = useState(0.15)
  const [tiling, setTiling] = useState(26)
  const [feathering, setFeathering] = useState(0.12)
  const [sides, setSides] = useState(6)
  const [irregularity, setIrregularity] = useState(0.35)
  const [turbulent, setTurbulent] = useState(true)
  const [shading, setShading] = useState(false)
  const [maskEnabled, setMaskEnabled] = useState(true)
  const [looping, setLooping] = useState(false)
  const controls = {
    amount,
    frequency,
    octaves,
    factor,
    tiling,
    feathering,
    sides,
    irregularity,
    turbulent,
    shading,
    maskEnabled,
    looping,
    reduced,
  }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the masked noise-warp preview.
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
    <figure
      className={`writing-generative-play-preview writing-generative-play-preview--reveal ${className}`.trim()}
    >
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Masked noise reveal controls"
        dense
      >
        <RangeRow
          id={`${uid}-amount`}
          label="Warp amount"
          min={0}
          max={0.11}
          step={0.001}
          value={amount}
          display={amount.toFixed(3)}
          onChange={setAmount}
        />
        <RangeRow
          id={`${uid}-frequency`}
          label="Noise frequency"
          min={1}
          max={12}
          step={0.1}
          value={frequency}
          display={frequency.toFixed(1)}
          onChange={setFrequency}
        />
        <RangeRow
          id={`${uid}-octaves`}
          label="Octaves"
          min={1}
          max={6}
          step={1}
          value={octaves}
          display={`${octaves}`}
          onChange={setOctaves}
        />
        <RangeRow
          id={`${uid}-sides`}
          label="Polygon sides"
          min={3}
          max={10}
          step={1}
          value={sides}
          display={`${sides}`}
          onChange={setSides}
        />
        <RangeRow
          id={`${uid}-irregularity`}
          label="Edge irregularity"
          min={0}
          max={1}
          step={0.01}
          value={irregularity}
          display={irregularity.toFixed(2)}
          onChange={setIrregularity}
        />
        <RangeRow
          id={`${uid}-factor`}
          label="Dissolve factor"
          min={0}
          max={1}
          step={0.01}
          value={factor}
          display={factor.toFixed(2)}
          onChange={setFactor}
        />
        <RangeRow
          id={`${uid}-tiling`}
          label="Shape tiling"
          min={4}
          max={64}
          step={1}
          value={tiling}
          display={`${tiling}`}
          onChange={setTiling}
        />
        <RangeRow
          id={`${uid}-feathering`}
          label="Shape feathering"
          min={0}
          max={1}
          step={0.01}
          value={feathering}
          display={feathering.toFixed(2)}
          onChange={setFeathering}
        />
        <ToggleRow
          id={`${uid}-turbulent`}
          label="Noise character"
          checked={turbulent}
          onChange={setTurbulent}
          onLabel="TURBULENT"
          offLabel="SMOOTH"
        />
        <ToggleRow
          id={`${uid}-shading`}
          label="Reveal blend"
          checked={shading}
          onChange={setShading}
          onLabel="SHADING"
          offLabel="NORMAL"
        />
        <ToggleRow
          id={`${uid}-mask`}
          label="Polygon mask"
          checked={maskEnabled}
          onChange={setMaskEnabled}
          onLabel="ON"
          offLabel="OFF"
        />
        <ToggleRow
          id={`${uid}-loop`}
          label="Layer motion"
          checked={looping}
          onChange={setLooping}
          onLabel="6s LOOP"
          offLabel="STATIC"
        />
      </WritingPreviewControls>
      <div
        ref={canvasWrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Interactive seaside illustration where a pointer-following polygon aperture dissolves through a tiled shape lattice to reveal a registered photoreal rendering"
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <MaskedWarpMesh controls={controls} pointerRef={pointerRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
      <footer
        className="writing-generative-play-preview__credit"
        aria-label="Artwork credit"
      >
        Artwork by{' '}
        <a
          href="https://x.com/craftian_keskin"
          target="_blank"
          rel="noreferrer noopener"
        >
          @craftian_keskin
        </a>
      </footer>
    </figure>
  )
}
