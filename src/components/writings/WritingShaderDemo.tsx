/* eslint-disable react-hooks/immutability -- Three.js ShaderMaterial.uniforms are updated from useFrame. */
/* eslint-disable react-hooks/refs -- GPU materials and render targets are held on refs for R3F integration. */
/* eslint-disable react-hooks/set-state-in-effect -- Material readiness is set after synchronous WebGL setup in layout. */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import type { WebGLRenderer } from 'three'

import blitTextureFrag from '@/shaders/writing-demos/blit-texture.frag?raw'
import pingPongFeedbackFrag from '@/shaders/writing-demos/ping-pong-feedback.frag?raw'

import {
  getWritingShaderFragmentSource,
  type WritingShaderPreset,
} from '@/components/writings/writingShaderPresets'
import { WRITING_SHADER_FULLSCREEN_VERT_THREE } from '@/components/writings/writingShaderFullscreenThreeVert'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

export type WritingShaderDemoProps = {
  preset: WritingShaderPreset
  ariaLabel: string
  caption?: string
  hint?: string
  animated?: boolean
  height?: number
  className?: string
}

type UniformRef = {
  mx: number
  my: number
  mz: number
  mw: number
}

type MosaicUniformCpuRef = {
  seed: number
  noiseIntensity: number
  gridSize: number
  cellRngMode: number
}

type RorschachUniformCpuRef = {
  warmInk: THREE.Color
  darkInk: THREE.Color
  paper: THREE.Color
}

const MOSAIC_CELL_RNG_OPTIONS = [
  { value: 0, label: 'Sin · dot (classic)' },
  { value: 1, label: 'Simplex 2D' },
  { value: 2, label: 'Perlin gradient 2D' },
  { value: 3, label: 'Fract permute' },
  { value: 4, label: 'Hash product' },
] as const

type RorschachPaletteKey = 'classic' | 'sepia' | 'monochrome' | 'cyanotype'

type RorschachPalette = {
  label: string
  warmInk: string
  darkInk: string
  paper: string
}

const RORSCHACH_PALETTES: Record<RorschachPaletteKey, RorschachPalette> = {
  classic: {
    label: 'Classic',
    warmInk: '#f53b13',
    darkInk: '#0e0d16',
    paper: '#fce8e0',
  },
  sepia: {
    label: 'Sepia',
    warmInk: '#c38a3c',
    darkInk: '#35200f',
    paper: '#f5eccf',
  },
  monochrome: {
    label: 'Monochrome',
    warmInk: '#686868',
    darkInk: '#111111',
    paper: '#f1efea',
  },
  cyanotype: {
    label: 'Cyanotype',
    warmInk: '#2d86a6',
    darkInk: '#062c4c',
    paper: '#e7f0ef',
  },
}

const RORSCHACH_PALETTE_KEYS = Object.keys(RORSCHACH_PALETTES) as RorschachPaletteKey[]

function rawShaderColor(value: string): THREE.Color {
  return new THREE.Color().setStyle(value, THREE.LinearSRGBColorSpace)
}

const CONTROL_PANEL_LABELS: Partial<Record<WritingShaderPreset, string>> = {
  ditherBanding: 'Dither controls',
  lightFalloff: 'Falloff controls',
  toneQuantize: 'Tone quantize controls',
  gridTransform2d: 'Grid transform controls',
  rorschachInkBlot: 'Ink blot controls',
  paletteMosaicGrid: 'Palette mosaic controls',
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduced
}

type WebglErrorBoundaryProps = { children: ReactNode; fallback: ReactNode }

type WebglErrorBoundaryState = { error: Error | null }

function drawingBufferPx(gl: WebGLRenderer, out: THREE.Vector2): THREE.Vector2 {
  return gl.getDrawingBufferSize(out)
}

class WebglErrorBoundary extends Component<WebglErrorBoundaryProps, WebglErrorBoundaryState> {
  constructor(props: WebglErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): WebglErrorBoundaryState {
    return { error }
  }

  render(): ReactNode {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

function FullscreenShaderMesh({
  fragment,
  uniformRef,
  mosaicUniformRef,
  rorschachUniformRef,
  shouldAnimate,
}: {
  fragment: string
  uniformRef: MutableRefObject<UniformRef>
  mosaicUniformRef: MutableRefObject<MosaicUniformCpuRef> | null
  rorschachUniformRef: MutableRefObject<RorschachUniformCpuRef> | null
  shouldAnimate: boolean
}) {
  const dbScratch = useMemo(() => new THREE.Vector2(), [])
  const mosaicGpuUniforms = useMemo(() => {
    if (!mosaicUniformRef) return null
    return {
      u_seed: new THREE.Uniform(0),
      u_noise_intensity: new THREE.Uniform(0.08),
      u_grid_size: new THREE.Uniform(12),
      u_cell_rng_mode: new THREE.Uniform(0),
    }
  }, [mosaicUniformRef])

  const rorschachGpuUniforms = useMemo(() => {
    if (!rorschachUniformRef) return null
    return {
      u_ink_warm: new THREE.Uniform(new THREE.Color()),
      u_ink_dark: new THREE.Uniform(new THREE.Color()),
      u_paper: new THREE.Uniform(new THREE.Color()),
    }
  }, [rorschachUniformRef])

  const uniforms = useMemo(() => {
    return {
      u_time: new THREE.Uniform(0),
      u_resolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
      u_mouse: new THREE.Uniform(new THREE.Vector4(0.5, 0.5, 0, 0.5)),
      ...(mosaicGpuUniforms ?? {}),
      ...(rorschachGpuUniforms ?? {}),
    }
  }, [mosaicGpuUniforms, rorschachGpuUniforms])

  const material = useMemo(
    () =>
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: WRITING_SHADER_FULLSCREEN_VERT_THREE,
        fragmentShader: fragment,
        uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    [fragment, uniforms],
  )

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame(({ clock, gl }) => {
    const wgl = gl as WebGLRenderer
    drawingBufferPx(wgl, dbScratch)
    uniforms.u_resolution.value.set(dbScratch.x, dbScratch.y)
    uniforms.u_time.value = shouldAnimate ? clock.elapsedTime : 0
    const u = uniformRef.current
    uniforms.u_mouse.value.set(u.mx, u.my, u.mz, u.mw)
    if (mosaicGpuUniforms && mosaicUniformRef) {
      const m = mosaicUniformRef.current
      mosaicGpuUniforms.u_seed.value = m.seed
      mosaicGpuUniforms.u_noise_intensity.value = m.noiseIntensity
      mosaicGpuUniforms.u_grid_size.value = m.gridSize
      mosaicGpuUniforms.u_cell_rng_mode.value = m.cellRngMode
    }
    if (rorschachGpuUniforms && rorschachUniformRef) {
      const palette = rorschachUniformRef.current
      rorschachGpuUniforms.u_ink_warm.value.copy(palette.warmInk)
      rorschachGpuUniforms.u_ink_dark.value.copy(palette.darkInk)
      rorschachGpuUniforms.u_paper.value.copy(palette.paper)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function PingPongRig({ uniformRef }: { uniformRef: MutableRefObject<UniformRef> }) {
  const gl = useThree((s) => s.gl) as WebGLRenderer
  const camera = useThree((s) => s.camera)
  const dbScratch = useMemo(() => new THREE.Vector2(), [])

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  const feedbackMatRef = useRef<THREE.RawShaderMaterial | null>(null)
  const displayMatRef = useRef<THREE.RawShaderMaterial | null>(null)
  const feedbackSceneRef = useRef<THREE.Scene | null>(null)
  const [materialsReady, setMaterialsReady] = useState(false)

  useLayoutEffect(() => {
    const feedbackMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: WRITING_SHADER_FULLSCREEN_VERT_THREE,
      fragmentShader: pingPongFeedbackFrag,
      uniforms: {
        u_prev: new THREE.Uniform(null as unknown as THREE.Texture),
        u_resolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
        u_mouse: new THREE.Uniform(new THREE.Vector4(0.5, 0.5, 0, 0.5)),
      },
      depthTest: false,
      depthWrite: false,
    })
    const displayMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: WRITING_SHADER_FULLSCREEN_VERT_THREE,
      fragmentShader: blitTextureFrag,
      uniforms: {
        u_tex: new THREE.Uniform(null as unknown as THREE.Texture),
      },
      depthTest: false,
      depthWrite: false,
    })
    feedbackMatRef.current = feedbackMat
    displayMatRef.current = displayMat
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(planeGeo, feedbackMat))
    feedbackSceneRef.current = scene
    setMaterialsReady(true)
    return () => {
      setMaterialsReady(false)
      feedbackMat.dispose()
      displayMat.dispose()
      feedbackMatRef.current = null
      displayMatRef.current = null
      feedbackSceneRef.current = null
    }
  }, [planeGeo])

  const readTarget = useRef<THREE.WebGLRenderTarget | null>(null)
  const writeTarget = useRef<THREE.WebGLRenderTarget | null>(null)

  const allocTargets = useCallback(() => {
    drawingBufferPx(gl, dbScratch)
    const w = Math.max(1, Math.floor(dbScratch.x))
    const h = Math.max(1, Math.floor(dbScratch.y))
    readTarget.current?.dispose()
    writeTarget.current?.dispose()
    const opts: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    }
    readTarget.current = new THREE.WebGLRenderTarget(w, h, opts)
    writeTarget.current = new THREE.WebGLRenderTarget(w, h, opts)
    const clearBlack = (rt: THREE.WebGLRenderTarget) => {
      gl.setRenderTarget(rt)
      gl.setClearColor(0x000000, 1)
      gl.clear(true, false, false)
    }
    clearBlack(readTarget.current)
    clearBlack(writeTarget.current)
    gl.setRenderTarget(null)
  }, [dbScratch, gl])

  const viewSize = useThree((s) => s.size)

  useLayoutEffect(() => {
    allocTargets()
    return () => {
      readTarget.current?.dispose()
      writeTarget.current?.dispose()
      readTarget.current = null
      writeTarget.current = null
    }
  }, [allocTargets, viewSize.height, viewSize.width])

  useEffect(() => {
    return () => {
      planeGeo.dispose()
    }
  }, [planeGeo])

  useFrame(() => {
    const read = readTarget.current
    const write = writeTarget.current
    const feedbackMat = feedbackMatRef.current
    const displayMat = displayMatRef.current
    const feedbackScene = feedbackSceneRef.current
    if (!read || !write || !feedbackMat || !displayMat || !feedbackScene) return

    feedbackMat.uniforms.u_prev.value = read.texture
    feedbackMat.uniforms.u_resolution.value.set(write.width, write.height)
    const u = uniformRef.current
    feedbackMat.uniforms.u_mouse.value.set(u.mx, u.my, u.mz, u.mw)

    gl.setRenderTarget(write)
    gl.setClearColor(0x000000, 1)
    gl.clear(true, false, false)
    gl.render(feedbackScene, camera)

    gl.setRenderTarget(null)
    displayMat.uniforms.u_tex.value = write.texture

    const tmp = read
    readTarget.current = write
    writeTarget.current = tmp
  }, -1)

  const displayMat = displayMatRef.current
  if (!materialsReady || !displayMat) {
    return (
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#050608" />
      </mesh>
    )
  }

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={displayMat} attach="material" />
    </mesh>
  )
}

function WritingDemoOrthoCamera() {
  const set = useThree((s) => s.set)
  useLayoutEffect(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2)
    cam.position.set(0, 0, 1)
    cam.updateProjectionMatrix()
    set({ camera: cam })
  }, [set])
  return null
}

function Scene({
  preset,
  fragment,
  uniformRef,
  mosaicUniformRef,
  rorschachUniformRef,
  shouldAnimate,
}: {
  preset: WritingShaderPreset
  fragment: string | null
  uniformRef: MutableRefObject<UniformRef>
  mosaicUniformRef: MutableRefObject<MosaicUniformCpuRef> | null
  rorschachUniformRef: MutableRefObject<RorschachUniformCpuRef> | null
  shouldAnimate: boolean
}) {
  if (preset === 'pingPongFeedback') {
    return <PingPongRig uniformRef={uniformRef} />
  }
  if (!fragment) return null
  return (
    <FullscreenShaderMesh
      fragment={fragment}
      uniformRef={uniformRef}
      mosaicUniformRef={mosaicUniformRef}
      rorschachUniformRef={rorschachUniformRef}
      shouldAnimate={shouldAnimate}
    />
  )
}

export function WritingShaderDemo({
  preset,
  ariaLabel,
  caption = 'Move the pointer over the canvas.',
  hint,
  animated = true,
  height = 240,
  className = '',
}: WritingShaderDemoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const uniformRef = useRef<UniformRef>({ mx: 0.5, my: 0.5, mz: 0, mw: 0.5 })
  const mosaicUniformRef = useRef<MosaicUniformCpuRef>({
    seed: 0,
    noiseIntensity: 0.08,
    gridSize: 12,
    cellRngMode: 0,
  })
  const rorschachUniformRef = useRef<RorschachUniformCpuRef>({
    warmInk: rawShaderColor(RORSCHACH_PALETTES.classic.warmInk),
    darkInk: rawShaderColor(RORSCHACH_PALETTES.classic.darkInk),
    paper: rawShaderColor(RORSCHACH_PALETTES.classic.paper),
  })

  const [ditherMode, setDitherMode] = useState<'banding' | 'dither'>('banding')
  const [falloffMode, setFalloffMode] = useState<'invSq' | 'smooth'>('invSq')
  const [toneLevels, setToneLevels] = useState(0.25)
  const [gridAngle, setGridAngle] = useState(0.15)
  const [gridScale, setGridScale] = useState(0.45)
  const [mosaicSeed, setMosaicSeed] = useState(0)
  const [mosaicNoise, setMosaicNoise] = useState(0.08)
  const [mosaicGrid, setMosaicGrid] = useState(12)
  const [mosaicCellRngMode, setMosaicCellRngMode] = useState(0)
  const [rorschachSpread, setRorschachSpread] = useState(0.56)
  const [rorschachMirrored, setRorschachMirrored] = useState(true)
  const [rorschachWarmInk, setRorschachWarmInk] = useState(
    RORSCHACH_PALETTES.classic.warmInk,
  )
  const [rorschachDarkInk, setRorschachDarkInk] = useState(
    RORSCHACH_PALETTES.classic.darkInk,
  )
  const [rorschachPaper, setRorschachPaper] = useState(RORSCHACH_PALETTES.classic.paper)
  const activeRorschachPalette = RORSCHACH_PALETTE_KEYS.find((key) => {
    const palette = RORSCHACH_PALETTES[key]
    return (
      palette.warmInk === rorschachWarmInk &&
      palette.darkInk === rorschachDarkInk &&
      palette.paper === rorschachPaper
    )
  })

  useEffect(() => {
    uniformRef.current.mz = ditherMode === 'dither' ? 1 : 0
  }, [ditherMode])

  useEffect(() => {
    uniformRef.current.mz = falloffMode === 'smooth' ? 1 : 0
  }, [falloffMode])

  useEffect(() => {
    uniformRef.current.mz = toneLevels
  }, [toneLevels])

  useEffect(() => {
    uniformRef.current.mz = gridAngle
    uniformRef.current.mw = gridScale
  }, [gridAngle, gridScale])

  useEffect(() => {
    if (preset !== 'paletteMosaicGrid') return
    const r = mosaicUniformRef.current
    r.seed = mosaicSeed
    r.noiseIntensity = mosaicNoise
    r.gridSize = mosaicGrid
    r.cellRngMode = mosaicCellRngMode
  }, [preset, mosaicSeed, mosaicNoise, mosaicGrid, mosaicCellRngMode])

  useEffect(() => {
    if (preset !== 'rorschachInkBlot') return
    uniformRef.current.mz = rorschachSpread
    uniformRef.current.mw = rorschachMirrored ? 1 : 0
    const palette = rorschachUniformRef.current
    palette.warmInk.copy(rawShaderColor(rorschachWarmInk))
    palette.darkInk.copy(rawShaderColor(rorschachDarkInk))
    palette.paper.copy(rawShaderColor(rorschachPaper))
  }, [
    preset,
    rorschachDarkInk,
    rorschachMirrored,
    rorschachPaper,
    rorschachSpread,
    rorschachWarmInk,
  ])

  const syncUniformDefaults = useCallback(() => {
    const u = uniformRef.current
    u.mx = 0.5
    u.my = 0.5
    if (preset === 'ditherBanding') {
      u.mz = ditherMode === 'dither' ? 1 : 0
    } else if (preset === 'lightFalloff') {
      u.mz = falloffMode === 'smooth' ? 1 : 0
    } else if (preset === 'toneQuantize') {
      u.mz = toneLevels
    } else if (preset === 'gridTransform2d') {
      u.mz = gridAngle
      u.mw = gridScale
    } else if (preset === 'rorschachInkBlot') {
      u.mz = rorschachSpread
      u.mw = rorschachMirrored ? 1 : 0
      const palette = rorschachUniformRef.current
      palette.warmInk.copy(rawShaderColor(rorschachWarmInk))
      palette.darkInk.copy(rawShaderColor(rorschachDarkInk))
      palette.paper.copy(rawShaderColor(rorschachPaper))
    } else if (preset === 'paletteMosaicGrid') {
      const r = mosaicUniformRef.current
      r.seed = mosaicSeed
      r.noiseIntensity = mosaicNoise
      r.gridSize = mosaicGrid
      r.cellRngMode = mosaicCellRngMode
      u.mz = 0
      u.mw = 0.5
    } else {
      u.mz = 0
      u.mw = 0.5
    }
  }, [
    preset,
    ditherMode,
    falloffMode,
    toneLevels,
    gridAngle,
    gridScale,
    mosaicSeed,
    mosaicNoise,
    mosaicGrid,
    mosaicCellRngMode,
    rorschachSpread,
    rorschachMirrored,
    rorschachWarmInk,
    rorschachDarkInk,
    rorschachPaper,
  ])

  useEffect(() => {
    syncUniformDefaults()
  }, [syncUniformDefaults])

  const fragment = preset === 'pingPongFeedback' ? null : getWritingShaderFragmentSource(preset)
  const shouldAnimate = animated && !reducedMotion

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    uniformRef.current.mx = (e.clientX - r.left) / Math.max(r.width, 1)
    uniformRef.current.my = 1 - (e.clientY - r.top) / Math.max(r.height, 1)
  }, [])

  const controls =
    preset === 'ditherBanding' ? (
      <div className="writing-shader-demo__controls" role="group" aria-label="Dither mode">
        <button
          type="button"
          className={ditherMode === 'banding' ? 'is-active' : ''}
          onClick={() => setDitherMode('banding')}
        >
          Quantized
        </button>
        <button
          type="button"
          className={ditherMode === 'dither' ? 'is-active' : ''}
          onClick={() => setDitherMode('dither')}
        >
          Dithered
        </button>
      </div>
    ) : preset === 'lightFalloff' ? (
      <div className="writing-shader-demo__controls" role="group" aria-label="Falloff mode">
        <button
          type="button"
          className={falloffMode === 'invSq' ? 'is-active' : ''}
          onClick={() => setFalloffMode('invSq')}
        >
          Inverse square
        </button>
        <button
          type="button"
          className={falloffMode === 'smooth' ? 'is-active' : ''}
          onClick={() => setFalloffMode('smooth')}
        >
          Smooth window
        </button>
      </div>
    ) : preset === 'toneQuantize' ? (
      <label className="writing-shader-demo__control-row">
        <span>Levels (blend)</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(toneLevels * 100)}
          onChange={(e) => setToneLevels(Number(e.target.value) / 100)}
        />
      </label>
    ) : preset === 'gridTransform2d' ? (
      <div className="writing-shader-demo__control-stack">
        <label className="writing-shader-demo__control-row">
          <span>Rotation</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(gridAngle * 100)}
            onChange={(e) => setGridAngle(Number(e.target.value) / 100)}
          />
        </label>
        <label className="writing-shader-demo__control-row">
          <span>Scale</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(gridScale * 100)}
            onChange={(e) => setGridScale(Number(e.target.value) / 100)}
          />
        </label>
      </div>
    ) : preset === 'rorschachInkBlot' ? (
      <div className="writing-shader-demo__control-stack">
        <label className="writing-shader-demo__control-row">
          <span>Ink spread</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(rorschachSpread * 100)}
            onChange={(e) => setRorschachSpread(Number(e.target.value) / 100)}
          />
        </label>
        <div
          className="writing-shader-demo__controls writing-shader-demo__palette-controls"
          role="group"
          aria-label="Ink and paper color palette"
        >
          {RORSCHACH_PALETTE_KEYS.map((key) => {
            const palette = RORSCHACH_PALETTES[key]
            return (
              <button
                key={key}
                type="button"
                className={activeRorschachPalette === key ? 'is-active' : ''}
                aria-pressed={activeRorschachPalette === key}
                onClick={() => {
                  setRorschachWarmInk(palette.warmInk)
                  setRorschachDarkInk(palette.darkInk)
                  setRorschachPaper(palette.paper)
                }}
              >
                {palette.label}
              </button>
            )
          })}
        </div>
        <label className="writing-shader-demo__control-row writing-shader-demo__color-row">
          <span>Warm ink</span>
          <input
            type="color"
            value={rorschachWarmInk}
            aria-label="Warm ink color"
            onChange={(event) => setRorschachWarmInk(event.target.value)}
          />
          <output>{rorschachWarmInk.toUpperCase()}</output>
        </label>
        <label className="writing-shader-demo__control-row writing-shader-demo__color-row">
          <span>Dark ink</span>
          <input
            type="color"
            value={rorschachDarkInk}
            aria-label="Dark ink color"
            onChange={(event) => setRorschachDarkInk(event.target.value)}
          />
          <output>{rorschachDarkInk.toUpperCase()}</output>
        </label>
        <label className="writing-shader-demo__control-row writing-shader-demo__color-row">
          <span>Paper</span>
          <input
            type="color"
            value={rorschachPaper}
            aria-label="Paper color"
            onChange={(event) => setRorschachPaper(event.target.value)}
          />
          <output>{rorschachPaper.toUpperCase()}</output>
        </label>
        <div className="writing-shader-demo__controls" role="group" aria-label="Blot symmetry">
          <button
            type="button"
            className={rorschachMirrored ? 'is-active' : ''}
            onClick={() => setRorschachMirrored(true)}
          >
            Mirrored
          </button>
          <button
            type="button"
            className={!rorschachMirrored ? 'is-active' : ''}
            onClick={() => setRorschachMirrored(false)}
          >
            Raw field
          </button>
        </div>
      </div>
    ) : preset === 'paletteMosaicGrid' ? (
      <div className="writing-shader-demo__control-stack">
        <label className="writing-shader-demo__control-row">
          <span>Cell PRNG</span>
          <select
            aria-label="Pseudo-random method for tile colours"
            value={mosaicCellRngMode}
            onChange={(e) => setMosaicCellRngMode(Number(e.target.value))}
          >
            {MOSAIC_CELL_RNG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="writing-shader-demo__control-row">
          <span>Seed</span>
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(mosaicSeed)}
            onChange={(e) => setMosaicSeed(Number(e.target.value))}
          />
        </label>
        <label className="writing-shader-demo__control-row">
          <span>Grain</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(mosaicNoise * 400)}
            onChange={(e) => setMosaicNoise(Number(e.target.value) / 400)}
          />
        </label>
        <label className="writing-shader-demo__control-row">
          <span>Grid</span>
          <input
            type="range"
            min={4}
            max={32}
            step={1}
            value={mosaicGrid}
            onChange={(e) => setMosaicGrid(Number(e.target.value))}
          />
        </label>
        <div className="writing-shader-demo__controls" role="group" aria-label="Randomize mosaic">
          <button type="button" onClick={() => setMosaicSeed(Math.floor(Math.random() * 1001))}>
            Shuffle
          </button>
        </div>
      </div>
    ) : null

  const fallback = (
    <p className="writing-shader-demo__fallback">
      WebGL could not be initialized in this browser (Three.js / react-three-fiber).
    </p>
  )

  const canMountCanvas = fragment !== null || preset === 'pingPongFeedback'
  const controlsLabel = CONTROL_PANEL_LABELS[preset]

  return (
    <figure className={`writing-shader-demo ${className}`.trim()}>
      {controls && controlsLabel ? (
        <WritingPreviewControls caption={caption} hint={hint} label={controlsLabel}>
          {controls}
        </WritingPreviewControls>
      ) : caption ? (
        <figcaption className="writing-shader-demo__caption">{caption}</figcaption>
      ) : null}
      <div
        ref={wrapRef}
        className="writing-shader-demo__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
        onPointerMove={onPointerMove}
        role="presentation"
      >
        {webglFailed ? fallback : null}
        {!webglFailed && canMountCanvas ? (
          <WebglErrorBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <Canvas
                className="writing-shader-demo__canvas"
                aria-label={ariaLabel}
                role="img"
                dpr={[1, 2]}
                gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
                frameloop="always"
                onCreated={() => {
                  queueMicrotask(() => setWebglFailed(false))
                }}
              >
                <WritingDemoOrthoCamera />
                <color attach="background" args={['#050608']} />
                <Scene
                  preset={preset}
                  fragment={fragment}
                  uniformRef={uniformRef}
                  mosaicUniformRef={preset === 'paletteMosaicGrid' ? mosaicUniformRef : null}
                  rorschachUniformRef={
                    preset === 'rorschachInkBlot' ? rorschachUniformRef : null
                  }
                  shouldAnimate={shouldAnimate}
                />
              </Canvas>
            </Suspense>
          </WebglErrorBoundary>
        ) : null}
        {!webglFailed && !canMountCanvas ? (
          <p className="writing-shader-demo__fallback">Unknown shader preset.</p>
        ) : null}
      </div>
    </figure>
  )
}
