import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useEffect,
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

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const MASKED_WARP_FRAG = /* glsl */ `
uniform sampler2D uBody;
uniform sampler2D uSkeleton;
uniform vec2 uResolution;
uniform float uTime;
uniform float uAmount;
uniform float uFrequency;
uniform float uOctaves;
uniform float uFeather;
uniform float uSides;
uniform float uIrregularity;
uniform float uTurbulent;
uniform float uMultiply;
uniform float uMaskEnabled;
uniform vec2 uCenter;
uniform vec2 uPointerDrift;

varying vec2 vUv;

const float IMAGE_ASPECT = 1.2;
const vec3 PLATE_BACKGROUND = vec3(0.91, 0.94, 0.96);

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

  return cos(edgeIndex * sector - angle) * length(p) - 0.145 * irregular;
}

vec2 containUv(vec2 uv, out float inside) {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 scale = canvasAspect > IMAGE_ASPECT
    ? vec2(canvasAspect / IMAGE_ASPECT, 1.0)
    : vec2(1.0, IMAGE_ASPECT / canvasAspect);
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

  float polygon = 1.0 - smoothstep(-uFeather, uFeather, polygonField(uv));
  float imageInside;
  vec2 imageUv = containUv(uv, imageInside);
  float warpedInside;
  vec2 warpedUv = containUv(uv + warp * uAmount, warpedInside);
  float mask = mix(imageInside, polygon * imageInside, uMaskEnabled);

  vec3 untouched = mix(PLATE_BACKGROUND, texture2D(uBody, imageUv).rgb, imageInside);
  vec3 displaced = mix(PLATE_BACKGROUND, texture2D(uBody, warpedUv).rgb, warpedInside);
  vec3 base = mix(untouched, displaced, mask);
  vec3 skeleton = texture2D(uSkeleton, warpedUv).rgb;
  vec3 normalBlend = mix(base, skeleton, 0.88);
  float skeletonLuma = dot(skeleton, vec3(0.2126, 0.7152, 0.0722));
  float boneInk = 1.0 - smoothstep(0.85, 0.89, skeletonLuma);
  vec3 multiplyOverlay = vec3(1.0 - boneInk * 0.82);
  vec3 multiplyBlend = base * multiplyOverlay;
  vec3 composite = mix(normalBlend, multiplyBlend, uMultiply);
  vec3 color = mix(base, composite, mask * 0.94);

  gl_FragColor = vec4(color, 1.0);
}
`

/** Where the aperture rests while the pointer is away, in UV space. */
const RESTING_CENTER = { x: 0.52, y: 0.53 }

/** The torso in viewport UV space, used to keep the aperture over the subject. */
const BODY_BOUNDS = { minX: 0.48, maxX: 0.62, minY: 0.36, maxY: 0.68 }

const BODY_TEXTURE_SRC = '/media/writings/masked-noise-warp/body.jpg'
const SKELETON_TEXTURE_SRC = '/media/writings/masked-noise-warp/skeleton.jpg'

type PointerState = {
  x: number
  y: number
  active: boolean
}

type WarpControls = {
  amount: number
  frequency: number
  octaves: number
  feather: number
  sides: number
  irregularity: number
  turbulent: boolean
  multiply: boolean
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
  const [bodyTexture, skeletonTexture] = useLoader(THREE.TextureLoader, [
    BODY_TEXTURE_SRC,
    SKELETON_TEXTURE_SRC,
  ])
  const textures = useMemo(() => {
    const body = bodyTexture.clone()
    const skeleton = skeletonTexture.clone()
    for (const texture of [body, skeleton]) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }
    return { body, skeleton }
  }, [bodyTexture, skeletonTexture])

  const uniforms = useMemo(
    () => ({
      uBody: { value: textures.body },
      uSkeleton: { value: textures.skeleton },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uAmount: { value: controls.amount },
      uFrequency: { value: controls.frequency },
      uOctaves: { value: controls.octaves },
      uFeather: { value: controls.feather },
      uSides: { value: controls.sides },
      uIrregularity: { value: controls.irregularity },
      uTurbulent: { value: controls.turbulent ? 1 : 0 },
      uMultiply: { value: controls.multiply ? 1 : 0 },
      uMaskEnabled: { value: controls.maskEnabled ? 1 : 0 },
      uCenter: { value: new THREE.Vector2(RESTING_CENTER.x, RESTING_CENTER.y) },
      uPointerDrift: { value: new THREE.Vector2(0, 0) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useEffect(
    () => () => {
      textures.body.dispose()
      textures.skeleton.dispose()
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
    // Clamped to the torso so the x-ray stays registered to the subject.
    const targetX = pointer?.active
      ? THREE.MathUtils.clamp(pointer.x, BODY_BOUNDS.minX, BODY_BOUNDS.maxX)
      : RESTING_CENTER.x
    const targetY = pointer?.active
      ? THREE.MathUtils.clamp(pointer.y, BODY_BOUNDS.minY, BODY_BOUNDS.maxY)
      : RESTING_CENTER.y
    const step = Math.min(delta, 0.1)

    center.current.x = controls.reduced
      ? targetX
      : THREE.MathUtils.damp(center.current.x, targetX, 7, step)
    center.current.y = controls.reduced
      ? targetY
      : THREE.MathUtils.damp(center.current.y, targetY, 7, step)

    shader.uCenter.value.set(center.current.x, center.current.y)
    shader.uPointerDrift.value.set(
      (center.current.x - RESTING_CENTER.x) * 1.8,
      (center.current.y - RESTING_CENTER.y) * 1.8,
    )
    shader.uResolution.value.copy(resolution)
    // Every reference layer is static, so time is pinned unless the loop is
    // switched on. The outline never reads it either way.
    shader.uTime.value = controls.reduced || !controls.looping ? 0 : clock.elapsedTime
    shader.uAmount.value = controls.amount
    shader.uFrequency.value = controls.frequency
    shader.uOctaves.value = controls.octaves
    shader.uFeather.value = controls.feather
    shader.uSides.value = controls.sides
    shader.uIrregularity.value = controls.irregularity
    shader.uTurbulent.value = controls.turbulent ? 1 : 0
    shader.uMultiply.value = controls.multiply ? 1 : 0
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
  height?: number
  className?: string
}

export function WritingMaskedNoiseWarpPreview({
  caption = 'Two registered anatomy views become one x-ray study. Move the pointer across the muscle figure to reveal its matching skeleton; switch layer motion to the six-second loop to let time drive the warp.',
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
  const [feather, setFeather] = useState(0.008)
  const [sides, setSides] = useState(6)
  const [irregularity, setIrregularity] = useState(0.35)
  const [turbulent, setTurbulent] = useState(true)
  const [multiply, setMultiply] = useState(true)
  const [maskEnabled, setMaskEnabled] = useState(true)
  const [looping, setLooping] = useState(false)
  const controls = {
    amount,
    frequency,
    octaves,
    feather,
    sides,
    irregularity,
    turbulent,
    multiply,
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
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      {caption ? (
        <figcaption className="writing-generative-play-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-generative-play-preview__hud">
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
          id={`${uid}-feather`}
          label="Mask feather"
          min={0.001}
          max={0.04}
          step={0.001}
          value={feather}
          display={feather.toFixed(3)}
          onChange={setFeather}
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
        <ToggleRow
          id={`${uid}-turbulent`}
          label="Noise character"
          checked={turbulent}
          onChange={setTurbulent}
          onLabel="TURBULENT"
          offLabel="SMOOTH"
        />
        <ToggleRow
          id={`${uid}-multiply`}
          label="Skeleton blend"
          checked={multiply}
          onChange={setMultiply}
          onLabel="MULTIPLY"
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
      </div>
      <div
        ref={canvasWrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={{ height: `${height}px` }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Interactive comparative anatomy plate where a pointer-following polygon aperture reveals the registered skeleton beneath the muscle figure"
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
    </figure>
  )
}
