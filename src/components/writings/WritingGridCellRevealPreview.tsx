import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const ILLUSTRATION_SRC = '/media/writings/grid-cell-reveal/illustration.jpg'
const PHOTOREAL_SRC = '/media/writings/grid-cell-reveal/photoreal.jpg'

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const REVEAL_FRAG = /* glsl */ `
uniform sampler2D uBase;
uniform sampler2D uHover;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uPixelSize;
uniform float uCardSpace;
uniform float uCircle;
uniform float uArtAspect;

varying vec2 vUv;

/* The card sits left of centre so its edges cut the screen lattice mid-cell. */
const float CARD_ORIGIN_X = 0.12;
const float CARD_HEIGHT = 0.84;
const float CARD_MAX_WIDTH = 0.76;

float revealShape(vec2 cellUv, float extent, float aa) {
  float squareDistance = max(abs(cellUv.x - 0.5), abs(cellUv.y - 0.5));
  float circleDistance = distance(cellUv, vec2(0.5));
  float shapeDistance = mix(squareDistance, circleDistance, uCircle);
  return 1.0 - smoothstep(extent - aa, extent + aa, shapeDistance);
}

void main() {
  vec2 uv = vUv;

  /* Height is fixed; width follows the art, then shrinks if a narrow pane cannot hold it. */
  float rawWidth = CARD_HEIGHT * uArtAspect * (uResolution.y / max(uResolution.x, 1.0));
  float fit = min(1.0, CARD_MAX_WIDTH / max(rawWidth, 0.0001));
  vec2 cardSize = vec2(rawWidth, CARD_HEIGHT) * fit;
  vec2 origin = vec2(CARD_ORIGIN_X, (1.0 - cardSize.y) * 0.5);

  float inside = step(origin.x, uv.x) * step(uv.x, origin.x + cardSize.x)
    * step(origin.y, uv.y) * step(uv.y, origin.y + cardSize.y);

  vec2 localUv = (uv - origin) / cardSize;
  vec4 base = texture2D(uBase, clamp(localUv, 0.0, 1.0));
  vec4 hover = texture2D(uHover, clamp(localUv, 0.0, 1.0));

  vec2 screenCellUv = fract((uv * uResolution) / max(uPixelSize, 2.0));
  vec2 cardPixels = max(cardSize * uResolution, vec2(1.0));
  vec2 cardCellUv = fract((localUv * cardPixels) / max(uPixelSize, 2.0));
  vec2 cellUv = mix(screenCellUv, cardCellUv, uCardSpace);

  float aspect = cardPixels.x / cardPixels.y;
  vec2 centered = localUv * 2.0 - 1.0;
  centered.x *= aspect;
  float maxRadius = length(vec2(aspect, 1.0));
  float radius = uProgress * (maxRadius + 0.16);
  float grow = 1.0 - smoothstep(radius - 0.16, radius + 0.16, length(centered));
  grow *= step(0.0001, uProgress);

  float extent = mix(0.0, 0.5, grow);
  float aa = max(fwidth(max(abs(cellUv.x - 0.5), abs(cellUv.y - 0.5))) * 1.5, 0.002);
  float mask = revealShape(cellUv, extent, aa);
  vec3 cardColor = mix(base.rgb, hover.rgb, mask);

  vec3 background = vec3(0.035, 0.04, 0.055);
  vec3 color = mix(background, cardColor, inside);
  gl_FragColor = vec4(color, 1.0);
}
`

type RevealControls = {
  progress: number
  pixelSize: number
  cardSpace: boolean
  circle: boolean
  reduced: boolean
}

function RevealMesh({ controls }: { controls: RevealControls }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const currentProgress = useRef(controls.progress)
  const [hovered, setHovered] = useState(false)
  const { gl, size } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const [loadedIllustration, loadedPhotoreal] = useLoader(THREE.TextureLoader, [
    ILLUSTRATION_SRC,
    PHOTOREAL_SRC,
  ])
  const textures = useMemo(() => {
    const prepare = (source: THREE.Texture) => {
      const texture = source.clone()
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
      return texture
    }
    return { base: prepare(loadedIllustration), hover: prepare(loadedPhotoreal) }
  }, [loadedIllustration, loadedPhotoreal])

  const uniforms = useMemo(
    () => ({
      uBase: { value: textures.base },
      uHover: { value: textures.hover },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uProgress: { value: controls.progress },
      uPixelSize: { value: controls.pixelSize },
      uCardSpace: { value: controls.cardSpace ? 1 : 0 },
      uCircle: { value: controls.circle ? 1 : 0 },
      uArtAspect: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Three uniform map identity is stable.
    [],
  )

  const artAspect = useMemo(() => {
    const image = textures.base.image as { width?: number; height?: number } | undefined
    if (!image?.width || !image.height) return 1
    return image.width / image.height
  }, [textures])

  useEffect(
    () => () => {
      textures.base.dispose()
      textures.hover.dispose()
    },
    [textures],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const target = hovered ? 1 : controls.progress
    currentProgress.current = controls.reduced
      ? target
      : THREE.MathUtils.damp(currentProgress.current, target, 8, Math.min(delta, 0.1))
    material.current.uniforms.uProgress.value = currentProgress.current
    material.current.uniforms.uPixelSize.value = controls.pixelSize
    material.current.uniforms.uCardSpace.value = controls.cardSpace ? 1 : 0
    material.current.uniforms.uCircle.value = controls.circle ? 1 : 0
    material.current.uniforms.uArtAspect.value = artAspect
    gl.getDrawingBufferSize(resolution)
    material.current.uniforms.uResolution.value.copy(resolution)
  })

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    resolution.set(size.width * dpr, size.height * dpr)
  }, [gl, resolution, size.height, size.width])

  return (
    <mesh onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={FULLSCREEN_VERT} fragmentShader={REVEAL_FRAG} />
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
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="writing-generative-play-preview__control-value">
        {label === 'Cell size' ? `${Math.round(value)}px` : `${Math.round(value * 100)}%`}
      </span>
    </div>
  )
}

export type WritingGridCellRevealPreviewProps = {
  caption?: string
  height?: number
  className?: string
}

export function WritingGridCellRevealPreview({
  caption = 'Hover the canvas, or scrub progress.',
  height = 560,
  className = '',
}: WritingGridCellRevealPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [progress, setProgress] = useState(0.38)
  const [pixelSize, setPixelSize] = useState(18)
  const [cardSpace, setCardSpace] = useState(false)
  const [circle, setCircle] = useState(false)
  const controls = { progress, pixelSize, cardSpace, circle, reduced }
  const fallback = <p className="writing-generative-play-preview__fallback">WebGL could not initialize the grid-cell reveal.</p>

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls caption={caption} label="Grid-cell reveal controls">
        <RangeRow id={`${uid}-progress`} label="Reveal" min={0} max={1} step={0.01} value={progress} onChange={setProgress} />
        <RangeRow id={`${uid}-pixels`} label="Cell size" min={5} max={54} step={1} value={pixelSize} onChange={setPixelSize} />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-space`}>Coordinate space</label>
          <select id={`${uid}-space`} value={cardSpace ? 'card' : 'screen'} onChange={(event) => setCardSpace(event.target.value === 'card')}>
            <option value="screen">Screen · continuous</option>
            <option value="card">Card · restarts</option>
          </select>
          <span className="writing-generative-play-preview__control-value">{cardSpace ? 'CARD' : 'SCREEN'}</span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-shape`}>Circle cells</label>
          <input id={`${uid}-shape`} type="checkbox" checked={circle} onChange={(event) => setCircle(event.target.checked)} />
          <span className="writing-generative-play-preview__control-value">{circle ? '○' : '□'}</span>
        </div>
      </WritingPreviewControls>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Interactive GPU grid-cell reveal where a lattice of cells opens a photoreal frame out of an illustration"
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <RevealMesh controls={controls} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
