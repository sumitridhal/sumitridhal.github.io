import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
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

const SHEET_URLS = [
  '/media/writings/anime-slash-flipbook/sheet-01.png',
  '/media/writings/anime-slash-flipbook/sheet-02.png',
  '/media/writings/anime-slash-flipbook/sheet-03.png',
  '/media/writings/anime-slash-flipbook/sheet-04.png',
  '/media/writings/anime-slash-flipbook/sheet-05.png',
]

const SHEET_LABELS = [
  'Sliver flurry',
  'Wide swoosh',
  'Rising blade',
  'Open crescent',
  'Crescent sweep',
]

/** Measured busiest cell per sheet, used as the frame a paused preview opens on. */
const SHEET_PEAK_FRAME = [7, 3, 5, 7, 6]

const GRID = 4
const FRAMES = GRID * GRID

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const SLASH_FRAG = /* glsl */ `
uniform sampler2D uSheet;
uniform vec2 uResolution;
uniform float uSheetPx;
uniform float uFrame;
uniform float uBlend;
uniform float uView;
uniform float uZoom;
uniform float uThreshold;
uniform float uSoft;
uniform float uRim;
uniform float uPalette;
uniform float uGlow;

varying vec2 vUv;

const float GRID = 4.0;
const float FRAMES = 16.0;

vec3 coreColor() {
  if (uPalette < 0.5) return vec3(1.0);
  if (uPalette < 1.5) return vec3(0.94, 0.99, 1.0);
  if (uPalette < 2.5) return vec3(1.0, 0.97, 0.86);
  return vec3(1.0, 0.96, 1.0);
}

vec3 rimColor() {
  if (uPalette < 0.5) return vec3(0.55, 0.57, 0.62);
  if (uPalette < 1.5) return vec3(0.29, 0.71, 1.0);
  if (uPalette < 2.5) return vec3(1.0, 0.42, 0.13);
  return vec3(0.69, 0.31, 1.0);
}

/* Frame index to cell offset. The sheets read left-to-right, top-to-bottom,
   but three.js uploads with flipY so v = 1 is the top of the image; the row
   term is therefore inverted. */
vec2 cellOrigin(float index) {
  float i = mod(floor(index + 0.5), FRAMES);
  float col = mod(i, GRID);
  float row = floor(i / GRID);
  return vec2(col, GRID - 1.0 - row) / GRID;
}

/* Read one frame. The local coordinate is 0..1 inside the cell; it is clamped
   half a texel in from each wall so the bilinear footprint can never straddle
   into the neighbouring frame. */
float readFrame(float index, vec2 local) {
  float halfTexelLocal = 0.5 * GRID / uSheetPx;
  vec2 inner = clamp(local, halfTexelLocal, 1.0 - halfTexelLocal);
  return texture2D(uSheet, cellOrigin(index) + inner / GRID).r;
}

float maskAt(vec2 local) {
  float held = readFrame(floor(uFrame), local);
  if (uBlend < 0.5) return held;
  /* Cross-fade: the fractional part of the frame position mixes this cell with
     the next one, which costs a second read of the atlas. */
  float next = readFrame(floor(uFrame) + 1.0, local);
  return mix(held, next, fract(uFrame));
}

/* The sheets are all but binary, so a second threshold on the same mask buys a
   rim one texel wide. A visible rim has to come from growing the silhouette,
   which costs eight more reads rather than one more comparison. */
float dilatedMask(vec2 local, float radius) {
  float m = maskAt(local);
  float diagonal = radius * 0.7071;
  m = max(m, maskAt(local + vec2(radius, 0.0)));
  m = max(m, maskAt(local - vec2(radius, 0.0)));
  m = max(m, maskAt(local + vec2(0.0, radius)));
  m = max(m, maskAt(local - vec2(0.0, radius)));
  m = max(m, maskAt(local + vec2(diagonal, diagonal)));
  m = max(m, maskAt(local + vec2(diagonal, -diagonal)));
  m = max(m, maskAt(local + vec2(-diagonal, diagonal)));
  m = max(m, maskAt(local - vec2(diagonal, diagonal)));
  return m;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 centred = (vUv - 0.5) * vec2(aspect, 1.0);
  /* Both views draw a square. On a portrait canvas the width is the binding
     constraint, so fit against the shorter axis or the cell gets cropped. */
  float fit = min(aspect, 1.0);

  vec3 backdrop = vec3(0.043, 0.047, 0.063);
  backdrop += vec3(0.06, 0.07, 0.10) * (1.0 - length(centred * vec2(0.7, 1.0)));
  vec3 color = backdrop;

  if (uView > 0.5) {
    /* Contact sheet: the whole atlas, with the active cell called out so the
       read head is visible moving across the grid. */
    vec2 sheetUv = centred / (0.86 * fit) + 0.5;
    if (sheetUv.x > 0.0 && sheetUv.x < 1.0 && sheetUv.y > 0.0 && sheetUv.y < 1.0) {
      float a = texture2D(uSheet, sheetUv).r;
      vec3 lit = mix(rimColor(), coreColor(), smoothstep(0.25, 0.75, a));
      color = mix(vec3(0.075, 0.079, 0.098), lit, smoothstep(0.04, 0.5, a));

      vec2 inCell = fract(sheetUv * GRID);
      vec2 gridLine = min(inCell, 1.0 - inCell);
      float px = GRID / uResolution.y;
      color = mix(color, vec3(0.28, 0.30, 0.36), 1.0 - smoothstep(0.0, px * 1.2, min(gridLine.x, gridLine.y)));

      vec2 cellBase = cellOrigin(uFrame);
      vec2 d = abs(sheetUv - (cellBase + 0.5 / GRID)) - 0.5 / GRID;
      float onBorder = 1.0 - smoothstep(0.0, px * 2.0, abs(max(d.x, d.y)));
      color = mix(color, rimColor(), onBorder * 0.9);
      float insideCell = step(max(d.x, d.y), 0.0);
      color += rimColor() * insideCell * 0.05;
    }
    gl_FragColor = vec4(color, 1.0);
    return;
  }

  /* Playback: one cell filling a square in the middle of the canvas. */
  vec2 local = centred / (0.92 * fit / uZoom) + 0.5;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }

  float a = maskAt(local);
  float grown = uRim > 0.001 ? dilatedMask(local, uRim * 0.15) : a;

  /* One threshold, two silhouettes: the mask as drawn is the white-hot core,
     the grown mask is the outer edge, and the gap between them is the rim. */
  float core = smoothstep(uThreshold, uThreshold + uSoft, a);
  float outer = smoothstep(uThreshold, uThreshold + uSoft, grown);

  vec3 slash = mix(rimColor(), coreColor(), core);
  color = mix(color, slash, outer);
  /* Additive, because the sheet is emissive: a slash adds light, it does not
     occlude what is behind it. */
  color += slash * outer * uGlow;

  gl_FragColor = vec4(color, 1.0);
}
`

export type SlashPreset = 'flipbook' | 'contact' | 'blend' | 'styled'

type SlashControls = {
  frame: number
  blend: number
  view: number
  zoom: number
  threshold: number
  soft: number
  rim: number
  palette: number
  glow: number
  fps: number
  playing: boolean
}

function SlashMesh({
  texture,
  controls,
  readoutRef,
}: {
  texture: THREE.Texture
  controls: SlashControls
  readoutRef: RefObject<HTMLSpanElement | null>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const playhead = useRef(0)
  const lastShown = useRef(-1)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const sheetPx = useMemo(() => {
    const image = texture.image as { width?: number } | undefined
    return image?.width ?? 1024
  }, [texture])

  const uniforms = useMemo(
    () => ({
      uSheet: { value: texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSheetPx: { value: 1024 },
      uFrame: { value: 0 },
      uBlend: { value: controls.blend },
      uView: { value: controls.view },
      uZoom: { value: controls.zoom },
      uThreshold: { value: controls.threshold },
      uSoft: { value: controls.soft },
      uRim: { value: controls.rim },
      uPalette: { value: controls.palette },
      uGlow: { value: controls.glow },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const shader = material.current.uniforms

    if (controls.playing) {
      playhead.current = (playhead.current + delta * controls.fps) % FRAMES
    } else {
      playhead.current = controls.frame
    }

    const shown = Math.floor(playhead.current)
    if (shown !== lastShown.current && readoutRef.current) {
      lastShown.current = shown
      readoutRef.current.textContent = `frame ${shown} · cell r${Math.floor(shown / GRID)} c${shown % GRID}`
    }

    gl.getDrawingBufferSize(resolution)
    shader.uSheet.value = texture
    shader.uSheetPx.value = sheetPx
    shader.uResolution.value.copy(resolution)
    shader.uFrame.value = playhead.current
    shader.uBlend.value = controls.blend
    shader.uView.value = controls.view
    shader.uZoom.value = controls.zoom
    shader.uThreshold.value = controls.threshold
    shader.uSoft.value = controls.soft
    shader.uRim.value = controls.rim
    shader.uPalette.value = controls.palette
    shader.uGlow.value = controls.glow
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={SLASH_FRAG}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function SlashScene({
  sheet,
  controls,
  readoutRef,
}: {
  sheet: number
  controls: SlashControls
  readoutRef: RefObject<HTMLSpanElement | null>
}) {
  const loaded = useLoader(THREE.TextureLoader, SHEET_URLS)
  const textures = useMemo(
    () =>
      loaded.map((source) => {
        const texture = source.clone()
        /* The sheet is a mask, not artwork: decoding it as sRGB would bend the
           antialiased ramp along every edge. */
        texture.colorSpace = THREE.NoColorSpace
        /* No mip chain. Minifying an atlas averages across cell walls, which
           ghosts neighbouring frames into the one being drawn. */
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.needsUpdate = true
        return texture
      }),
    [loaded],
  )

  return (
    <SlashMesh
      texture={textures[sheet] ?? textures[0]}
      controls={controls}
      readoutRef={readoutRef}
    />
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
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  disabled?: boolean
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
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{display}</span>
    </div>
  )
}

const PRESETS: Record<SlashPreset, Partial<Record<string, number | boolean>>> = {
  flipbook: { sheet: 1, view: 0, playing: true, fps: 12, blend: 0, palette: 0, rim: 0.06, glow: 0.25 },
  contact: { sheet: 2, view: 1, playing: true, fps: 6, blend: 0, palette: 1, rim: 0.1, glow: 0.2 },
  blend: { sheet: 1, view: 0, playing: true, fps: 4, blend: 1, palette: 0, rim: 0.06, glow: 0.25 },
  /* Glow is deliberately restrained: pushed higher it saturates the rim to
     white and the palette stops reading. */
  styled: { sheet: 4, view: 0, playing: true, fps: 12, blend: 0, palette: 2, rim: 0.19, glow: 0.45 },
}

export type WritingSlashFlipbookPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
  preset?: SlashPreset
  /** Sheet to open on, overriding the preset's own choice. */
  sheet?: number
}

export function WritingSlashFlipbookPreview({
  caption = 'Play the sheet, or scrub to a single frame.',
  hint,
  height = 560,
  className = '',
  preset = 'flipbook',
  sheet: initialSheet,
}: WritingSlashFlipbookPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const readoutRef = useRef<HTMLSpanElement>(null)
  const p = PRESETS[preset]
  const openingSheet = initialSheet ?? (p.sheet as number) ?? 1

  const [sheet, setSheet] = useState(openingSheet)
  const [view, setView] = useState((p.view as number) ?? 0)
  /* Reduced motion opens on a held frame rather than a loop, but Play stays
     available: scrubbing a flipbook by hand is not the thing being opted out of. */
  const [playing, setPlaying] = useState(((p.playing as boolean) ?? true) && !reduced)
  const [fps, setFps] = useState((p.fps as number) ?? 12)
  const [frame, setFrame] = useState(SHEET_PEAK_FRAME[openingSheet] ?? 6)
  const [blend, setBlend] = useState((p.blend as number) ?? 0)
  const [zoom, setZoom] = useState(1)
  const [threshold, setThreshold] = useState(0.34)
  const [soft, setSoft] = useState(0.12)
  const [rim, setRim] = useState((p.rim as number) ?? 0.06)
  const [palette, setPalette] = useState((p.palette as number) ?? 0)
  const [glow, setGlow] = useState((p.glow as number) ?? 0.25)

  const controls: SlashControls = {
    frame,
    blend,
    view,
    zoom,
    threshold,
    soft,
    rim,
    palette,
    glow,
    fps,
    playing,
  }

  const onSheetChange = useCallback((next: number) => {
    setSheet(next)
    setFrame(SHEET_PEAK_FRAME[next] ?? 6)
  }, [])

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the slash flipbook study.
    </p>
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls caption={caption} hint={hint} label="Slash flipbook controls" dense>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-view`}>View</label>
          <select
            id={`${uid}-view`}
            value={view}
            onChange={(event) => setView(Number(event.target.value))}
          >
            <option value={0}>Playback</option>
            <option value={1}>Contact sheet</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {view === 0 ? 'CELL' : 'ATLAS'}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-play`}>Playback</label>
          <button
            id={`${uid}-play`}
            type="button"
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <span className="writing-generative-play-preview__control-value">
            {playing ? 'RUN' : 'HOLD'}
          </span>
        </div>
        <RangeRow
          id={`${uid}-fps`}
          label="Frame rate"
          min={1}
          max={30}
          step={1}
          value={fps}
          display={`${fps}fps`}
          disabled={!playing}
          onChange={setFps}
        />
        <RangeRow
          id={`${uid}-frame`}
          label="Frame"
          min={0}
          max={FRAMES - 1}
          step={1}
          value={frame}
          display={`${frame}`}
          disabled={playing}
          onChange={setFrame}
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-blend`}>Frame blend</label>
          <select
            id={`${uid}-blend`}
            value={blend}
            onChange={(event) => setBlend(Number(event.target.value))}
          >
            <option value={0}>Hold</option>
            <option value={1}>Cross-fade</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {blend === 0 ? '1 read' : '2 reads'}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-palette`}>Palette</label>
          <select
            id={`${uid}-palette`}
            value={palette}
            onChange={(event) => setPalette(Number(event.target.value))}
          >
            <option value={0}>Mono</option>
            <option value={1}>Ice</option>
            <option value={2}>Ember</option>
            <option value={3}>Violet</option>
          </select>
          <span className="writing-generative-play-preview__control-value">{palette + 1}/4</span>
        </div>
        <RangeRow
          id={`${uid}-threshold`}
          label="Threshold"
          min={0.02}
          max={0.9}
          step={0.01}
          value={threshold}
          display={threshold.toFixed(2)}
          onChange={setThreshold}
        />
        <RangeRow
          id={`${uid}-soft`}
          label="Edge softness"
          min={0.01}
          max={0.5}
          step={0.01}
          value={soft}
          display={soft.toFixed(2)}
          onChange={setSoft}
        />
        <RangeRow
          id={`${uid}-rim`}
          label="Rim width"
          min={0}
          max={0.25}
          step={0.01}
          value={rim}
          display={rim.toFixed(2)}
          onChange={setRim}
        />
        <RangeRow
          id={`${uid}-glow`}
          label="Glow"
          min={0}
          max={2}
          step={0.05}
          value={glow}
          display={glow.toFixed(2)}
          onChange={setGlow}
        />
        <RangeRow
          id={`${uid}-zoom`}
          label="Zoom"
          min={1}
          max={8}
          step={0.1}
          value={zoom}
          display={`${zoom.toFixed(1)}x`}
          disabled={view !== 0}
          onChange={setZoom}
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
            aria-label="An anime-style slash effect played back from a 4 by 4 sprite sheet, with a contact-sheet view showing which cell is being read"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <SlashScene sheet={sheet} controls={controls} readoutRef={readoutRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
      <figcaption className="writing-generative-play-preview__caption">
        {/* Sheet choice is the whole point of five sheets, so it stays on the
            surface rather than behind the controls toggle. */}
        <div className="writing-slash-flipbook-preview__sheets" role="group" aria-label="Sprite sheet">
          {SHEET_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === sheet ? 'is-active' : ''}
              aria-pressed={index === sheet}
              aria-label={`Sheet ${index + 1} of ${SHEET_LABELS.length}: ${label}`}
              title={label}
              onClick={() => onSheetChange(index)}
            >
              {index + 1}
            </button>
          ))}
          <span className="writing-slash-flipbook-preview__sheet-name">{SHEET_LABELS[sheet]}</span>
        </div>
        <span ref={readoutRef}>frame 0 · cell r0 c0</span>
      </figcaption>
    </figure>
  )
}
