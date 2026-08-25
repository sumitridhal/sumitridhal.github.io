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

const PHOTO_SRC = '/media/writings/bayer-disc/source.jpg'
const RESTING_CENTER = { x: 0.5, y: 0.5 }

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const BAYER_REVEAL_FRAG = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uPhotoAspect;
uniform float uRadius;
uniform float uPixelSize;
uniform float uFalloff;
uniform float uMatrixSize;
uniform float uOffsetBlocks;
uniform float uInterpolate;
uniform float uInvert;

varying vec2 vUv;

const vec3 PAPER = vec3(0.87, 0.85, 0.79);

float bayer2(vec2 coord) {
  vec2 a = floor(coord);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 coord) {
  return bayer2(coord * 0.5) * 0.25 + bayer2(coord);
}

float bayer8(vec2 coord) {
  return bayer4(coord * 0.5) * 0.25 + bayer2(coord);
}

float bayerThreshold(vec2 blockCoord) {
  float raw;
  float cells;
  if (uMatrixSize < 3.0) {
    raw = bayer2(blockCoord);
    cells = 4.0;
  } else if (uMatrixSize < 6.0) {
    raw = bayer4(blockCoord);
    cells = 16.0;
  } else {
    raw = bayer8(blockCoord);
    cells = 64.0;
  }
  return raw + 0.5 / cells;
}

float ditherAt(vec2 uv, vec2 stepUv) {
  vec2 blockCoord = floor(uv / stepUv + 0.00001);
  vec2 blockCenter = blockCoord * stepUv + stepUv * 0.5;
  vec2 radial = (blockCenter - uCenter) * uResolution;
  float distancePx = length(radial);
  float radiusPx = uRadius * min(uResolution.x, uResolution.y);
  float t = pow(
    clamp(distancePx / max(radiusPx, 1.0), 0.0, 1.0),
    max(0.1, uFalloff)
  );
  return step(bayerThreshold(blockCoord), 1.0 - t);
}

float maskAt(vec2 uv, vec2 stepUv, vec2 offsetUv) {
  float first = ditherAt(uv, stepUv);
  float second = ditherAt(uv - offsetUv, stepUv);
  return max(first, second);
}

vec2 containUv(vec2 uv, out float inside) {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 scale = canvasAspect > uPhotoAspect
    ? vec2(canvasAspect / uPhotoAspect, 1.0)
    : vec2(1.0, uPhotoAspect / canvasAspect);
  vec2 photoUv = (uv - 0.5) * scale + 0.5;
  inside =
    step(0.0, photoUv.x) *
    step(photoUv.x, 1.0) *
    step(0.0, photoUv.y) *
    step(photoUv.y, 1.0);
  return clamp(photoUv, 0.002, 0.998);
}

void main() {
  vec2 stepUv = vec2(max(uPixelSize, 1.0)) / max(uResolution, vec2(1.0));
  vec2 rawOffset = vec2(floor(uOffsetBlocks + 0.5) * stepUv.x, 0.0);
  vec2 effectiveOffset = mix(rawOffset, rawOffset * 0.5, uInterpolate);
  vec2 centeredUv = vUv + effectiveOffset * 0.5;

  float coverage;
  if (uInterpolate > 0.5) {
    vec2 subStep = stepUv * 0.5;
    vec2 quantizedUv = floor(centeredUv / stepUv) * stepUv;
    vec2 q1 = stepUv * 0.25;
    vec2 q3 = stepUv * 0.75;
    float v1 = maskAt(quantizedUv + q1, subStep, effectiveOffset);
    float v2 = maskAt(quantizedUv + vec2(q3.x, q1.y), subStep, effectiveOffset);
    float v3 = maskAt(quantizedUv + vec2(q1.x, q3.y), subStep, effectiveOffset);
    float v4 = maskAt(quantizedUv + q3, subStep, effectiveOffset);
    coverage = (v1 + v2 + v3 + v4) * 0.25;
  } else {
    vec2 quantizedUv = floor(centeredUv / stepUv) * stepUv;
    coverage = maskAt(quantizedUv, stepUv, effectiveOffset);
  }

  coverage = mix(coverage, 1.0 - coverage, uInvert);
  float photoInside;
  vec2 photoUv = containUv(vUv, photoInside);
  vec3 photo = mix(PAPER, texture2D(uPhoto, photoUv).rgb, photoInside);
  vec3 color = mix(PAPER, photo, coverage);

  gl_FragColor = vec4(color, 1.0);
}
`

type PointerState = {
  x: number
  y: number
  active: boolean
}

type BayerControls = {
  radius: number
  pixelSize: number
  falloff: number
  matrixSize: number
  offsetBlocks: number
  interpolate: boolean
  invert: boolean
  reduced: boolean
}

function BayerDitherMesh({
  controls,
  pointerRef,
}: {
  controls: BayerControls
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const center = useRef({ ...RESTING_CENTER })
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const loadedPhoto = useLoader(THREE.TextureLoader, PHOTO_SRC)
  const photo = useMemo(() => {
    const texture = loadedPhoto.clone()
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [loadedPhoto])

  const uniforms = useMemo(
    () => ({
      uPhoto: { value: photo },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(RESTING_CENTER.x, RESTING_CENTER.y) },
      uPhotoAspect: { value: 1 },
      uRadius: { value: controls.radius },
      uPixelSize: { value: controls.pixelSize },
      uFalloff: { value: controls.falloff },
      uMatrixSize: { value: controls.matrixSize },
      uOffsetBlocks: { value: controls.offsetBlocks },
      uInterpolate: { value: controls.interpolate ? 1 : 0 },
      uInvert: { value: controls.invert ? 1 : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  const photoAspect = useMemo(() => {
    const image = photo.image as { width?: number; height?: number } | undefined
    if (!image?.width || !image.height) return 1
    return image.width / image.height
  }, [photo])

  useEffect(
    () => () => {
      photo.dispose()
    },
    [photo],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const pointer = pointerRef.current
    const targetX = pointer?.active ? THREE.MathUtils.clamp(pointer.x, 0.08, 0.92) : 0.5
    const targetY = pointer?.active ? THREE.MathUtils.clamp(pointer.y, 0.08, 0.92) : 0.5
    const step = Math.min(delta, 0.1)
    center.current.x = controls.reduced
      ? targetX
      : THREE.MathUtils.damp(center.current.x, targetX, 8, step)
    center.current.y = controls.reduced
      ? targetY
      : THREE.MathUtils.damp(center.current.y, targetY, 8, step)

    gl.getDrawingBufferSize(resolution)
    const shader = material.current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uCenter.value.set(center.current.x, center.current.y)
    shader.uPhotoAspect.value = photoAspect
    shader.uRadius.value = controls.radius
    shader.uPixelSize.value = controls.pixelSize
    shader.uFalloff.value = controls.falloff
    shader.uMatrixSize.value = controls.matrixSize
    shader.uOffsetBlocks.value = controls.offsetBlocks
    shader.uInterpolate.value = controls.interpolate ? 1 : 0
    shader.uInvert.value = controls.invert ? 1 : 0
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={BAYER_REVEAL_FRAG}
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

export type WritingBayerDitherRevealPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingBayerDitherRevealPreview({
  caption = 'Move the pointer to carry the disc.',
  hint = 'A Bayer threshold matrix turns a radial field into a block-quantized photo reveal. Tune the matrix and cell controls to inspect its structure.',
  height = 640,
  className = '',
}: WritingBayerDitherRevealPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ ...RESTING_CENTER, active: false })
  const [radius, setRadius] = useState(0.4)
  const [pixelSize, setPixelSize] = useState(8)
  const [falloff, setFalloff] = useState(2.5)
  const [matrixSize, setMatrixSize] = useState(8)
  const [offsetBlocks, setOffsetBlocks] = useState(2)
  const [interpolate, setInterpolate] = useState(true)
  const [invert, setInvert] = useState(false)
  const controls: BayerControls = {
    radius,
    pixelSize,
    falloff,
    matrixSize,
    offsetBlocks,
    interpolate,
    invert,
    reduced,
  }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the Bayer dither reveal.
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
      className={`writing-generative-play-preview writing-generative-play-preview--bayer ${className}`.trim()}
    >
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Bayer dither reveal controls"
        dense
      >
        <RangeRow
          id={`${uid}-radius`}
          label="Radius"
          min={0.08}
          max={0.75}
          step={0.01}
          value={radius}
          display={radius.toFixed(2)}
          onChange={setRadius}
        />
        <RangeRow
          id={`${uid}-pixel-size`}
          label="Block size"
          min={2}
          max={32}
          step={1}
          value={pixelSize}
          display={`${pixelSize}px`}
          onChange={setPixelSize}
        />
        <RangeRow
          id={`${uid}-falloff`}
          label="Falloff"
          min={0.1}
          max={8}
          step={0.1}
          value={falloff}
          display={falloff.toFixed(1)}
          onChange={setFalloff}
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-matrix`}>Matrix</label>
          <select
            id={`${uid}-matrix`}
            value={matrixSize}
            onChange={(event) => setMatrixSize(Number(event.target.value))}
          >
            <option value={2}>2 × 2</option>
            <option value={4}>4 × 4</option>
            <option value={8}>8 × 8</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {matrixSize}×{matrixSize}
          </span>
        </div>
        <RangeRow
          id={`${uid}-offset`}
          label="Offset blocks"
          min={0}
          max={8}
          step={1}
          value={offsetBlocks}
          display={`${offsetBlocks}`}
          onChange={setOffsetBlocks}
        />
        <ToggleRow
          id={`${uid}-interpolate`}
          label="Interpolate"
          checked={interpolate}
          onChange={setInterpolate}
          onLabel="4 SAMPLES"
          offLabel="BINARY"
        />
        <ToggleRow
          id={`${uid}-invert`}
          label="Invert"
          checked={invert}
          onChange={setInvert}
          onLabel="OUTSIDE"
          offLabel="INSIDE"
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
            aria-label="Interactive illustration reveal where a pointer-following circular Bayer dither mask controls visibility"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <BayerDitherMesh controls={controls} pointerRef={pointerRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
