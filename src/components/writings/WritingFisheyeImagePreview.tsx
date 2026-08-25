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

const PHOTO_SRC = '/media/writings/fisheye-hover/source.jpg'

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FISHEYE_IMAGE_FRAG = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPhotoAspect;
uniform float uIntensity;
uniform float uFisheyeStrength;
uniform float uFisheyeRadius;
uniform float uVignetteStart;
uniform float uVignetteEnd;
uniform float uAberration;
uniform float uNoise;
uniform float uVignette;
uniform float uPointerStrength;
uniform float uPointerRadius;
uniform float uTime;

varying vec2 vUv;

const vec3 BACKGROUND = vec3(0.003, 0.003, 0.004);
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec2 containScale() {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  return canvasAspect > uPhotoAspect
    ? vec2(canvasAspect / uPhotoAspect, 1.0)
    : vec2(1.0, uPhotoAspect / canvasAspect);
}

float insideBounds(vec2 uv) {
  return
    step(0.0, uv.x) *
    step(uv.x, 1.0) *
    step(0.0, uv.y) *
    step(uv.y, 1.0);
}

vec4 sampleSafe(vec2 uv) {
  vec2 overflow = max(-uv, uv - 1.0);
  float outside = max(max(overflow.x, overflow.y), 0.0);
  float fade = 1.0 - smoothstep(0.0, 0.075, outside);
  return texture2D(uPhoto, clamp(uv, 0.001, 0.999)) * fade;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 fisheyeUv(vec2 uv, float intensity) {
  vec2 delta = uv - 0.5;
  delta.x *= uPhotoAspect;
  float distanceValue = length(delta);

  if (distanceValue < uFisheyeRadius && distanceValue > 0.0001) {
    float percent = distanceValue / max(uFisheyeRadius, 0.0001);
    float theta = percent * percent * intensity * uFisheyeStrength * 0.72;
    delta = normalize(delta) * tan(theta) * distanceValue;
  }

  delta.x /= max(uPhotoAspect, 0.0001);
  return delta + 0.5;
}

void main() {
  vec2 scale = containScale();
  vec2 photoUv = (vUv - 0.5) * scale + 0.5;
  float inside = insideBounds(photoUv);
  vec2 safeUv = clamp(photoUv, 0.001, 0.999);

  vec2 radial = safeUv - 0.5;
  radial.x *= uPhotoAspect;
  float distanceFromCenter = length(radial);
  float edgeMask = smoothstep(uVignetteStart, uVignetteEnd, distanceFromCenter);

  vec2 distortedUv = fisheyeUv(safeUv, uIntensity);
  vec2 finalUv = mix(safeUv, distortedUv, edgeMask);

  vec2 pointerUv = (uPointer - 0.5) * scale + 0.5;
  vec2 pointerDelta = safeUv - pointerUv;
  pointerDelta.x *= uPhotoAspect;
  float pointerDistance = length(pointerDelta);
  float pointerField = smoothstep(uPointerRadius, 0.0, pointerDistance);
  vec2 pointerDirection = pointerDistance > 0.0001
    ? normalize(pointerDelta)
    : vec2(0.0);
  pointerDirection.x /= max(uPhotoAspect, 0.0001);
  finalUv += pointerDirection * pointerField * uPointerStrength * uIntensity;

  vec3 source = sampleSafe(safeUv).rgb;
  float gray = dot(source, LUMA);
  vec3 baseColor = vec3(clamp((gray - 0.5) * 1.2 + 0.5, 0.0, 1.0));

  vec2 splitDirection = finalUv - 0.5;
  float splitLength = length(splitDirection);
  splitDirection = splitLength > 0.0001
    ? splitDirection / splitLength
    : vec2(0.0);
  float split = uAberration * uIntensity;
  float red = sampleSafe(finalUv + splitDirection * split).r;
  float green = sampleSafe(finalUv).g;
  float blue = sampleSafe(finalUv - splitDirection * split).b;
  vec3 effectColor = vec3(red, green, blue);

  float grain = hash21(
    floor(safeUv * uResolution * 0.72) + floor(uTime * 24.0)
  ) - 0.5;
  effectColor += grain * uNoise * uIntensity;
  effectColor *= 1.0 - edgeMask * uVignette;

  vec3 color = mix(baseColor, effectColor, uIntensity);
  color = mix(BACKGROUND, color, inside);
  gl_FragColor = vec4(color, 1.0);
}
`

type PointerState = {
  x: number
  y: number
}

type FisheyeControls = {
  strength: number
  radius: number
  aberration: number
  noise: number
  vignette: number
  pointerStrength: number
  reduced: boolean
}

function FisheyeImageMesh({
  controls,
  activeRef,
  pointerRef,
}: {
  controls: FisheyeControls
  activeRef: RefObject<boolean>
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const intensity = useRef(0)
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const elapsed = useRef(0)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const loadedPhoto = useLoader(THREE.TextureLoader, PHOTO_SRC)
  const photo = useMemo(() => {
    const texture = loadedPhoto.clone()
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.needsUpdate = true
    return texture
  }, [loadedPhoto])
  const photoAspect = useMemo(() => {
    const image = photo.image as { width?: number; height?: number } | undefined
    return (image?.width ?? 1) / Math.max(image?.height ?? 1, 1)
  }, [photo])
  const uniforms = useMemo(
    () => ({
      uPhoto: { value: photo },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPhotoAspect: { value: photoAspect },
      uIntensity: { value: 0 },
      uFisheyeStrength: { value: 1 },
      uFisheyeRadius: { value: 0.8 },
      uVignetteStart: { value: 0.3 },
      uVignetteEnd: { value: 0.8 },
      uAberration: { value: 0.015 },
      uNoise: { value: 0.08 },
      uVignette: { value: 0.32 },
      uPointerStrength: { value: 0.02 },
      uPointerRadius: { value: 0.3 },
      uTime: { value: 0 },
    }),
    [photo, photoAspect],
  )

  useEffect(
    () => () => {
      photo.dispose()
    },
    [photo],
  )

  useFrame((_, delta) => {
    const current = material.current
    const targetPointer = pointerRef.current
    const active = activeRef.current
    if (!current || !targetPointer || active === null) return

    const step = Math.min(delta, 0.1)
    const targetIntensity = active ? 1 : 0
    intensity.current = controls.reduced
      ? targetIntensity
      : THREE.MathUtils.damp(intensity.current, targetIntensity, 6.5, step)
    const pointerX = controls.reduced ? 0.5 : targetPointer.x
    const pointerY = controls.reduced ? 0.5 : targetPointer.y
    pointer.current.x = controls.reduced
      ? pointerX
      : THREE.MathUtils.damp(pointer.current.x, pointerX, 9, step)
    pointer.current.y = controls.reduced
      ? pointerY
      : THREE.MathUtils.damp(pointer.current.y, pointerY, 9, step)
    if (!controls.reduced) elapsed.current += step

    gl.getDrawingBufferSize(resolution)
    const shader = current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uPointer.value.set(pointer.current.x, pointer.current.y)
    shader.uPhotoAspect.value = photoAspect
    shader.uIntensity.value = intensity.current
    shader.uFisheyeStrength.value = controls.strength
    shader.uFisheyeRadius.value = controls.radius
    shader.uAberration.value = controls.aberration
    shader.uNoise.value = controls.noise
    shader.uVignette.value = controls.vignette
    shader.uPointerStrength.value = controls.pointerStrength
    shader.uTime.value = controls.reduced ? 0 : elapsed.current
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={FISHEYE_IMAGE_FRAG}
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

export type WritingFisheyeImagePreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingFisheyeImagePreview({
  caption = 'Hover or focus the image to bend its outer field.',
  hint = 'An aspect-correct vignette mask weights fisheye UV distortion, radial RGB separation, pointer displacement, noise, and edge darkening.',
  height = 600,
  className = '',
}: WritingFisheyeImagePreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(false)
  const pointerRef = useRef<PointerState>({ x: 0.5, y: 0.5 })
  const [strength, setStrength] = useState(1)
  const [radius, setRadius] = useState(0.8)
  const [aberration, setAberration] = useState(0.015)
  const [noise, setNoise] = useState(0.08)
  const [vignette, setVignette] = useState(0.32)
  const [pointerStrength, setPointerStrength] = useState(0.02)
  const controls: FisheyeControls = {
    strength,
    radius,
    aberration,
    noise,
    vignette,
    pointerStrength,
    reduced,
  }
  const fallback = (
    <img
      className="writing-fisheye-image-preview__fallback-image"
      src={PHOTO_SRC}
      alt="Soft-focus portrait of a person with a white bob against a blue background"
    />
  )

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = wrapRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    pointerRef.current.x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
    pointerRef.current.y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
  }, [])

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Fisheye image controls"
        dense
      >
        <RangeRow
          id={`${uid}-strength`}
          label="Fisheye"
          min={0}
          max={1.2}
          step={0.05}
          value={strength}
          display={strength.toFixed(2)}
          onChange={setStrength}
        />
        <RangeRow
          id={`${uid}-radius`}
          label="Radius"
          min={0.2}
          max={1.2}
          step={0.05}
          value={radius}
          display={radius.toFixed(2)}
          onChange={setRadius}
        />
        <RangeRow
          id={`${uid}-aberration`}
          label="RGB split"
          min={0}
          max={0.06}
          step={0.001}
          value={aberration}
          display={aberration.toFixed(3)}
          onChange={setAberration}
        />
        <RangeRow
          id={`${uid}-noise`}
          label="Noise"
          min={0}
          max={0.16}
          step={0.005}
          value={noise}
          display={noise.toFixed(3)}
          onChange={setNoise}
        />
        <RangeRow
          id={`${uid}-vignette`}
          label="Vignette"
          min={0}
          max={0.65}
          step={0.01}
          value={vignette}
          display={vignette.toFixed(2)}
          onChange={setVignette}
        />
        <RangeRow
          id={`${uid}-pointer`}
          label="Pointer warp"
          min={0}
          max={0.08}
          step={0.002}
          value={pointerStrength}
          display={reduced ? 'STILL' : pointerStrength.toFixed(3)}
          onChange={setPointerStrength}
        />
      </WritingPreviewControls>

      <div
        ref={wrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
        tabIndex={0}
        aria-label="Interactive fisheye image"
        onPointerEnter={() => {
          activeRef.current = true
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          activeRef.current = false
        }}
        onFocus={() => {
          activeRef.current = true
        }}
        onBlur={() => {
          activeRef.current = false
        }}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Soft-focus portrait with interactive fisheye and chromatic edge distortion"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
            onCreated={({ gl }) => gl.setClearColor('#010102', 1)}
          >
            <Suspense fallback={null}>
              <FisheyeImageMesh
                controls={controls}
                activeRef={activeRef}
                pointerRef={pointerRef}
              />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>

      <footer className="writing-generative-play-preview__credit">
        Image by{' '}
        <a href="https://x.com/hewarsaber" target="_blank" rel="noreferrer">
          Hewar
        </a>
        {' · '}Effect after{' '}
        <a href="https://codepen.io/filipz/pen/dPoyMVB" target="_blank" rel="noreferrer">
          Filip Zrnzevic
        </a>
        .
      </footer>
    </figure>
  )
}
