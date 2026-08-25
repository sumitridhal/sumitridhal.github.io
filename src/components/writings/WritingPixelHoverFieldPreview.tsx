import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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

const PIXEL_FIELD_FRAG = /* glsl */ `
uniform vec2 uResolution;
uniform vec4 uReveal;
uniform float uTime;
uniform float uGapScale;
uniform float uWaveWidth;
uniform float uShimmer;

varying vec2 vUv;

const vec3 BACKGROUND = vec3(0.004, 0.0045, 0.006);
const vec3 SURFACE = vec3(0.018, 0.019, 0.024);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash11(float p) {
  return fract(sin(p * 127.1) * 43758.5453);
}

float pick4(vec4 values, float index) {
  if (index < 0.5) return values.x;
  if (index < 1.5) return values.y;
  if (index < 2.5) return values.z;
  return values.w;
}

vec3 palette(float index, float choice) {
  vec3 a;
  vec3 b;
  vec3 c;

  if (index < 0.5) {
    a = vec3(0.94, 0.96, 0.98);
    b = vec3(0.78, 0.82, 0.88);
    c = vec3(0.48, 0.53, 0.61);
  } else if (index < 1.5) {
    a = vec3(0.63, 0.91, 0.98);
    b = vec3(0.25, 0.75, 0.94);
    c = vec3(0.02, 0.45, 0.74);
  } else if (index < 2.5) {
    a = vec3(1.0, 0.88, 0.31);
    b = vec3(0.98, 0.68, 0.04);
    c = vec3(0.76, 0.42, 0.0);
  } else {
    a = vec3(1.0, 0.72, 0.75);
    b = vec3(0.98, 0.35, 0.45);
    c = vec3(0.72, 0.03, 0.18);
  }

  if (choice < 0.333) return a;
  if (choice < 0.666) return b;
  return c;
}

void main() {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  float wideLayout = step(1.2, canvasAspect);
  float columns = mix(2.0, 4.0, wideLayout);
  float rows = mix(2.0, 1.0, wideLayout);
  vec2 gridUv = vUv * vec2(columns, rows);
  vec2 tile = floor(gridUv);
  vec2 tileUv = fract(gridUv);
  float stackedIndex = tile.y > 0.5 ? tile.x : 2.0 + tile.x;
  float index = mix(stackedIndex, tile.x, wideLayout);

  vec2 tileSize = uResolution / vec2(columns, rows);
  vec2 maxCardSize = tileSize * 0.89;
  vec2 cardSize = maxCardSize;
  if (maxCardSize.x / max(maxCardSize.y, 1.0) > 0.8) {
    cardSize.x = maxCardSize.y * 0.8;
  } else {
    cardSize.y = maxCardSize.x / 0.8;
  }
  vec2 cardScale = cardSize / max(tileSize, vec2(1.0));
  vec2 cardUv = (tileUv - (1.0 - cardScale) * 0.5) / cardScale;
  float inside =
    step(0.0, cardUv.x) *
    step(cardUv.x, 1.0) *
    step(0.0, cardUv.y) *
    step(cardUv.y, 1.0);

  vec2 safeUv = clamp(cardUv, 0.0, 1.0);
  float reveal = pick4(uReveal, index);
  float gap = pick4(vec4(6.0, 10.0, 4.0, 7.0), index) * uGapScale;

  vec2 cardPixel = safeUv * cardSize;
  vec2 cell = floor(cardPixel / max(gap, 1.0));
  vec2 withinCell = fract(cardPixel / max(gap, 1.0)) - 0.5;
  float seed = hash21(cell + vec2(index * 41.7, index * 19.3));
  float choice = hash11(seed + index * 2.13);

  vec2 cellCenter = (cell + 0.5) * gap / max(cardSize, vec2(1.0));
  float radialDistance = length((cellCenter - 0.5) * vec2(cardSize.x / max(cardSize.y, 1.0), 1.0));
  radialDistance /= 0.72;
  float threshold = radialDistance * uWaveWidth + seed * 0.045;
  float revealClock = reveal * (uWaveWidth + 0.24);
  float appeared = smoothstep(threshold, threshold + 0.16, revealClock);

  float phase = hash11(seed + 7.31) * 6.2831853;
  float speed = pick4(vec4(2.1, 3.0, 4.2, 1.45), index);
  float shimmer = 0.72 + 0.28 * sin(uTime * speed + phase);
  shimmer = mix(1.0, shimmer, uShimmer * smoothstep(0.82, 1.0, appeared));
  float maxSizePx = mix(0.8, 2.8, hash11(seed + 3.77));
  float halfSize = (maxSizePx / max(gap, 1.0)) * 0.5 * appeared * shimmer;
  float squareDistance = max(abs(withinCell.x), abs(withinCell.y));
  float square = 1.0 - smoothstep(
    halfSize,
    halfSize + max(fwidth(squareDistance), 0.004),
    squareDistance
  );

  vec3 activeColor = palette(index, 0.18);
  float radialShade = 1.0 - smoothstep(0.1, 1.0, length(safeUv - vec2(0.08, 0.08)));
  vec3 surface = SURFACE + activeColor * radialShade * reveal * 0.025;
  vec3 pixelColor = palette(index, choice);
  vec3 cardColor = mix(surface, pixelColor, square * appeared);

  float edgePx = min(
    min(safeUv.x, 1.0 - safeUv.x) * cardSize.x,
    min(safeUv.y, 1.0 - safeUv.y) * cardSize.y
  );
  float border = 1.0 - smoothstep(0.5, 1.7, edgePx);
  cardColor = mix(cardColor, mix(vec3(0.12), activeColor, reveal), border);

  vec3 color = mix(BACKGROUND, cardColor, inside);
  gl_FragColor = vec4(color, 1.0);
}
`

type PixelFieldControls = {
  gapScale: number
  waveWidth: number
  shimmer: number
  reduced: boolean
}

function PixelFieldMesh({
  controls,
  activeRef,
}: {
  controls: PixelFieldControls
  activeRef: RefObject<number>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const reveals = useRef([0, 0, 0, 0])
  const elapsed = useRef(0)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: new THREE.Vector4(0, 0, 0, 0) },
      uTime: { value: 0 },
      uGapScale: { value: 1 },
      uWaveWidth: { value: 1 },
      uShimmer: { value: 0.8 },
    }),
    [],
  )

  useFrame((_, delta) => {
    const current = material.current
    const active = activeRef.current
    if (!current || active === null) return

    const step = Math.min(delta, 0.1)
    for (let index = 0; index < reveals.current.length; index += 1) {
      const target = active === index ? 1 : 0
      reveals.current[index] = controls.reduced
        ? target
        : THREE.MathUtils.damp(reveals.current[index], target, 6.5, step)
    }
    if (!controls.reduced) elapsed.current += step

    gl.getDrawingBufferSize(resolution)
    const shader = current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uReveal.value.set(
      reveals.current[0],
      reveals.current[1],
      reveals.current[2],
      reveals.current[3],
    )
    shader.uTime.value = controls.reduced ? 0 : elapsed.current
    shader.uGapScale.value = controls.gapScale
    shader.uWaveWidth.value = controls.waveWidth
    shader.uShimmer.value = controls.shimmer
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={PIXEL_FIELD_FRAG}
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

const CARD_LABELS = ['Layout', 'Code', 'Command', 'Dropper'] as const

const CARD_PATHS = [
  'M4 5h24v22H4zM4 11h24M13 11v16',
  'M10 9 4 16l6 7M22 9l6 7-6 7M19 4l-6 24',
  'M9 5v5H5a4 4 0 1 1 4-4M23 5v5h4a4 4 0 1 0-4-4M9 27v-5H5a4 4 0 1 0 4 4M23 27v-5h4a4 4 0 1 1-4 4M9 10h14v12H9z',
  'M9 23 23 9l4 4-14 14H7v-6L21 7l4 4M7 27l-2 3',
] as const

export type WritingPixelHoverFieldPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingPixelHoverFieldPreview({
  caption = 'Hover or focus a card to release its pixel field.',
  hint = 'One fragment pass renders all four cards. Cell hashes choose palette, size, and phase; radial distance delays the reveal.',
  height = 560,
  className = '',
}: WritingPixelHoverFieldPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const activeRef = useRef(-1)
  const [gapScale, setGapScale] = useState(1)
  const [waveWidth, setWaveWidth] = useState(1)
  const [shimmer, setShimmer] = useState(0.8)
  const controls: PixelFieldControls = { gapScale, waveWidth, shimmer, reduced }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the pixel hover field.
    </p>
  )

  const activate = (index: number) => {
    activeRef.current = index
  }
  const deactivate = (index: number) => {
    if (activeRef.current === index) activeRef.current = -1
  }
  const onPointerEnter = (index: number) => () => {
    activate(index)
  }
  const onPointerLeave = (index: number) => () => {
    deactivate(index)
  }
  const onFocus = (index: number) => () => {
    activate(index)
  }
  const onBlur = (index: number) => () => {
    deactivate(index)
  }

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Pixel hover field controls"
      >
        <RangeRow
          id={`${uid}-density`}
          label="Grid spacing"
          min={0.6}
          max={1.8}
          step={0.05}
          value={gapScale}
          display={`${gapScale.toFixed(2)}×`}
          onChange={setGapScale}
        />
        <RangeRow
          id={`${uid}-wave`}
          label="Wave width"
          min={0.45}
          max={1.5}
          step={0.05}
          value={waveWidth}
          display={waveWidth.toFixed(2)}
          onChange={setWaveWidth}
        />
        <RangeRow
          id={`${uid}-shimmer`}
          label="Shimmer"
          min={0}
          max={1}
          step={0.05}
          value={shimmer}
          display={reduced ? 'STILL' : shimmer.toFixed(2)}
          onChange={setShimmer}
        />
      </WritingPreviewControls>

      <div
        className="writing-generative-play-preview__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Four dark cards with hover-activated procedural pixel fields"
            dpr={1}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
            onCreated={({ gl }) => gl.setClearColor('#010102', 1)}
          >
            <PixelFieldMesh controls={controls} activeRef={activeRef} />
          </Canvas>
        </WritingPlayWebglBoundary>

        <div className="writing-pixel-field-preview__cards" aria-label="Pixel field cards">
          {CARD_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`writing-pixel-field-preview__card writing-pixel-field-preview__card--${index + 1}`}
              onPointerEnter={onPointerEnter(index)}
              onPointerLeave={onPointerLeave(index)}
              onFocus={onFocus(index)}
              onBlur={onBlur(index)}
              onClick={() => activate(index)}
              aria-label={`Activate ${label} pixel field`}
            >
              <svg aria-hidden="true" viewBox="0 0 32 32">
                <path d={CARD_PATHS[index]} />
              </svg>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <footer className="writing-generative-play-preview__credit">
        Shader study after{' '}
        <a
          href="https://codepen.io/hexagoncircle/pen/KwPpdBZ"
          target="_blank"
          rel="noreferrer"
        >
          Ryan Mulligan’s pixel-canvas
        </a>
        .
      </footer>
    </figure>
  )
}
