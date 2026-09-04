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

const CARD_SRC = '/media/writings/payatlas-chromatic-card/card.webp'
const FOIL_SRC = '/media/writings/payatlas-chromatic-card/foil-map.png'
const RESTING_POINTER = { x: 0.58, y: 0.34 }

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const CHROMATIC_CARD_FRAG = /* glsl */ `
uniform sampler2D uCard;
uniform sampler2D uFoil;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uCardTexel;
uniform float uCardAspect;
uniform float uCardScale;
uniform float uSeparation;
uniform float uFoilInfluence;
uniform float uEdgeEmphasis;

varying vec2 vUv;

const vec3 BACKGROUND = vec3(0.0015, 0.002, 0.006);
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec2 containScale() {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 scale = canvasAspect > uCardAspect
    ? vec2(canvasAspect / uCardAspect, 1.0)
    : vec2(1.0, uCardAspect / canvasAspect);
  return scale / max(uCardScale, 0.01);
}

float cardBounds(vec2 uv) {
  return
    step(0.0, uv.x) *
    step(uv.x, 1.0) *
    step(0.0, uv.y) *
    step(uv.y, 1.0);
}

float cardEdge(vec2 uv, vec4 center) {
  vec4 left = texture2D(uCard, clamp(uv - vec2(uCardTexel.x, 0.0), 0.0, 1.0));
  vec4 right = texture2D(uCard, clamp(uv + vec2(uCardTexel.x, 0.0), 0.0, 1.0));
  vec4 down = texture2D(uCard, clamp(uv - vec2(0.0, uCardTexel.y), 0.0, 1.0));
  vec4 up = texture2D(uCard, clamp(uv + vec2(0.0, uCardTexel.y), 0.0, 1.0));
  float centerLuma = dot(center.rgb, LUMA);
  float gradient =
    abs(dot(left.rgb, LUMA) - dot(right.rgb, LUMA)) +
    abs(dot(down.rgb, LUMA) - dot(up.rgb, LUMA)) +
    abs(left.a - right.a) +
    abs(down.a - up.a);
  gradient += abs(centerLuma - dot(right.rgb, LUMA)) * 0.5;
  return smoothstep(0.025, 0.42, gradient * max(uEdgeEmphasis, 0.001));
}

void main() {
  vec2 scale = containScale();
  vec2 cardUv = (vUv - 0.5) * scale + 0.5;
  float inside = cardBounds(cardUv);
  vec2 safeUv = clamp(cardUv, 0.001, 0.999);
  vec4 center = texture2D(uCard, safeUv);

  float pointerLength = length(uPointer);
  vec2 direction = pointerLength > 0.001
    ? normalize(uPointer)
    : normalize(vec2(0.8, 0.45));
  float pointerStrength = mix(0.36, 1.0, clamp(pointerLength / 1.4142, 0.0, 1.0));

  vec2 foilUv = fract(
    safeUv * vec2(1.18, 1.72) +
    vec2(uPointer.x, -uPointer.y) * 0.055
  );
  vec3 foilColor = texture2D(uFoil, foilUv).rgb;
  float foilLuma = dot(foilColor, LUMA);
  float foil = mix(1.0, mix(0.42, 1.42, foilLuma), uFoilInfluence);

  float edge = cardEdge(safeUv, center);
  float edgeWeight = mix(0.28, 1.0, edge);
  vec2 splitPx = direction * uSeparation * pointerStrength * foil * edgeWeight;
  vec2 splitUv = splitPx * scale / max(uResolution, vec2(1.0));

  vec4 redSample = texture2D(uCard, clamp(safeUv + splitUv, 0.001, 0.999));
  vec4 blueSample = texture2D(uCard, clamp(safeUv - splitUv, 0.001, 0.999));
  vec3 splitColor = vec3(redSample.r, center.g, blueSample.b);
  splitColor += max(foilColor - 0.72, 0.0) * edge * uFoilInfluence * 0.09;

  float alpha = center.a * inside;
  vec3 color = mix(BACKGROUND, splitColor, alpha);
  gl_FragColor = vec4(color, 1.0);
}
`

type PointerState = {
  x: number
  y: number
  active: boolean
}

type ChromaticControls = {
  separation: number
  foilInfluence: number
  edgeEmphasis: number
  reduced: boolean
}

function prepareTexture(source: THREE.Texture, repeat = false): THREE.Texture {
  const texture = source.clone()
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
  }
  texture.needsUpdate = true
  return texture
}

function ChromaticAberrationMesh({
  controls,
  pointerRef,
}: {
  controls: ChromaticControls
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const currentPointer = useRef({ ...RESTING_POINTER })
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const [loadedCard, loadedFoil] = useLoader(THREE.TextureLoader, [CARD_SRC, FOIL_SRC])
  const card = useMemo(() => prepareTexture(loadedCard), [loadedCard])
  const foil = useMemo(() => prepareTexture(loadedFoil, true), [loadedFoil])
  const cardSize = useMemo(() => {
    const image = card.image as { width?: number; height?: number } | undefined
    const width = image?.width ?? 1
    const height = image?.height ?? 1
    return {
      aspect: width / Math.max(height, 1),
      texel: new THREE.Vector2(1 / Math.max(width, 1), 1 / Math.max(height, 1)),
    }
  }, [card])
  const uniforms = useMemo(
    () => ({
      uCard: { value: card },
      uFoil: { value: foil },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(RESTING_POINTER.x, RESTING_POINTER.y) },
      uCardTexel: { value: cardSize.texel.clone() },
      uCardAspect: { value: cardSize.aspect },
      uCardScale: { value: 0.74 },
      uSeparation: { value: 10 },
      uFoilInfluence: { value: 0.65 },
      uEdgeEmphasis: { value: 1.4 },
    }),
    [card, cardSize, foil],
  )

  useEffect(
    () => () => {
      card.dispose()
      foil.dispose()
    },
    [card, foil],
  )

  useFrame((_, delta) => {
    const current = material.current
    const pointer = pointerRef.current
    if (!current || !pointer) return

    const target =
      controls.reduced || !pointer.active
        ? RESTING_POINTER
        : {
            x: THREE.MathUtils.clamp(pointer.x, -1, 1),
            y: THREE.MathUtils.clamp(pointer.y, -1, 1),
          }
    const step = Math.min(delta, 0.1)
    currentPointer.current.x = controls.reduced
      ? target.x
      : THREE.MathUtils.damp(currentPointer.current.x, target.x, 8, step)
    currentPointer.current.y = controls.reduced
      ? target.y
      : THREE.MathUtils.damp(currentPointer.current.y, target.y, 8, step)

    gl.getDrawingBufferSize(resolution)
    const shader = current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uPointer.value.set(currentPointer.current.x, currentPointer.current.y)
    shader.uSeparation.value = controls.separation
    shader.uFoilInfluence.value = controls.foilInfluence
    shader.uEdgeEmphasis.value = controls.edgeEmphasis
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={CHROMATIC_CARD_FRAG}
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

export type WritingChromaticAberrationCardPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingChromaticAberrationCardPreview({
  caption = 'Move across the card to steer the RGB split.',
  hint = 'Red and blue sample opposite sides of one pointer-driven offset while a foil map varies the distance.',
  height = 560,
  className = '',
}: WritingChromaticAberrationCardPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ ...RESTING_POINTER, active: false })
  const [separation, setSeparation] = useState(10)
  const [foilInfluence, setFoilInfluence] = useState(0.65)
  const [edgeEmphasis, setEdgeEmphasis] = useState(1.4)
  const controls: ChromaticControls = {
    separation,
    foilInfluence,
    edgeEmphasis,
    reduced,
  }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the chromatic aberration card.
    </p>
  )

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = canvasWrapRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1
    const y = (1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1
    pointerRef.current.x = x
    pointerRef.current.y = y
    pointerRef.current.active = true
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current.active = false
  }, [])

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Chromatic aberration controls"
      >
        <RangeRow
          id={`${uid}-separation`}
          label="Separation"
          min={0}
          max={28}
          step={1}
          value={separation}
          display={`${separation}px`}
          onChange={setSeparation}
        />
        <RangeRow
          id={`${uid}-foil`}
          label="Foil influence"
          min={0}
          max={1}
          step={0.05}
          value={foilInfluence}
          display={foilInfluence.toFixed(2)}
          onChange={setFoilInfluence}
        />
        <RangeRow
          id={`${uid}-edge`}
          label="Edge emphasis"
          min={0.25}
          max={3}
          step={0.05}
          value={edgeEmphasis}
          display={edgeEmphasis.toFixed(2)}
          onChange={setEdgeEmphasis}
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
            aria-label="Interactive purple spell card with pointer-steered chromatic aberration"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
            onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
          >
            <Suspense fallback={null}>
              <ChromaticAberrationMesh controls={controls} pointerRef={pointerRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
      <footer className="writing-generative-play-preview__credit">
        Reference artwork by{' '}
        <a
          href="https://artem.vyraz.studio/projects/pa/pa-4.webp"
          target="_blank"
          rel="noreferrer"
        >
          Artem Morozov
        </a>{' '}
        for PayAtlas.
      </footer>
    </figure>
  )
}
