import { MapControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Component,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
  type ReactNode,
} from 'react'
import * as THREE from 'three'

const CHUNK = 6
const SHELL = [-1, 0, 1] as const

function slotColor(cx: number, cy: number, i: number, j: number): string {
  let h = cx * 374761393 + cy * 668265263 + i * 2246822519 + j * 3266489917
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  const r = 0.22 + ((h >>> 0) & 255) / 255 * 0.55
  h = Math.imul(h ^ (h >>> 15), 2246822519)
  const g = 0.22 + ((h >>> 0) & 255) / 255 * 0.5
  h = Math.imul(h ^ (h >>> 13), 3266489917)
  const b = 0.28 + ((h >>> 0) & 255) / 255 * 0.45
  return new THREE.Color(r, g, b).getStyle()
}

function slotZ(cx: number, cy: number, i: number, j: number): number {
  let h = cx * 1013 + cy * 7919 + i * 104729 + j * 224737
  h ^= h >>> 17
  h = Math.imul(h, 668265263)
  return (((h >>> 0) % 1000) / 1000 - 0.5) * 0.35
}

function ChunkSlots({ cx, cy }: { cx: number; cy: number }) {
  const slot = CHUNK / 3
  const pad = 0.08
  const meshes = useMemo(() => {
    const out: ReactNode[] = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = cx * CHUNK + (i + 0.5) * slot
        const y = cy * CHUNK + (j + 0.5) * slot
        out.push(
          <mesh key={`${i}-${j}`} position={[x, y, slotZ(cx, cy, i, j)]}>
            <planeGeometry args={[slot * (1 - pad), slot * (1 - pad)]} />
            <meshStandardMaterial
              color={slotColor(cx, cy, i, j)}
              roughness={0.78}
              metalness={0.06}
            />
          </mesh>,
        )
      }
    }
    return out
  }, [cx, cy, slot, pad])
  return <>{meshes}</>
}

function CameraChunkSync({
  onChunkChange,
}: {
  onChunkChange: (cx: number, cy: number) => void
}) {
  const last = useRef({ cx: Number.NaN, cy: Number.NaN })
  useFrame(({ camera }) => {
    const cx = Math.floor(camera.position.x / CHUNK)
    const cy = Math.floor(camera.position.y / CHUNK)
    if (cx !== last.current.cx || cy !== last.current.cy) {
      last.current = { cx, cy }
      onChunkChange(cx, cy)
    }
  })
  return null
}

type WebglErrorBoundaryProps = { children: ReactNode; fallback: ReactNode }

type WebglErrorBoundaryState = { error: Error | null }

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

function Scene() {
  const [center, setCenter] = useState({ cx: 0, cy: 0 })
  const { camera } = useThree()
  const controlsRef = useRef<ElementRef<typeof MapControls>>(null)

  useLayoutEffect(() => {
    camera.position.set(0.5, 0.5, 14)
    camera.lookAt(0.5, 0.5, 0)
    const ctrl = controlsRef.current
    if (ctrl && 'target' in ctrl && ctrl.target instanceof THREE.Vector3) {
      ctrl.target.set(0.5, 0.5, 0)
      if ('update' in ctrl && typeof ctrl.update === 'function') ctrl.update()
    }
  }, [camera])

  return (
    <>
      <CameraChunkSync onChunkChange={(cx, cy) => setCenter({ cx, cy })} />
      <color attach="background" args={['#050608']} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 8, 10]} intensity={0.95} />
      {SHELL.flatMap((dx) =>
        SHELL.map((dy) => (
          <ChunkSlots key={`${center.cx + dx}-${center.cy + dy}`} cx={center.cx + dx} cy={center.cy + dy} />
        )),
      )}
      <MapControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        minPolarAngle={Math.PI / 2 - 0.02}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={6}
        maxDistance={28}
        screenSpacePanning
        dampingFactor={0.08}
      />
    </>
  )
}

export type WritingInfiniteCanvasPreviewProps = {
  /** Short figure caption (same tone as shader demos). */
  caption?: string
  /** Minimum canvas height in CSS px. */
  height?: number
  className?: string
}

export function WritingInfiniteCanvasPreview({
  caption = 'Pan the window: nine chunks stay hot; colors are deterministic per slot.',
  height = 300,
  className = '',
}: WritingInfiniteCanvasPreviewProps) {
  const [webglFailed, setWebglFailed] = useState(false)
  const fallback = (
    <p className="writing-infinite-canvas-preview__fallback">
      WebGL could not be initialized in this browser (Three.js / react-three-fiber).
    </p>
  )

  return (
    <figure className={`writing-infinite-canvas-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-infinite-canvas-preview__caption">{caption}</figcaption> : null}
      <div className="writing-infinite-canvas-preview__canvas-wrap" style={{ height: `${height}px` }}>
        {webglFailed ? fallback : null}
        {!webglFailed ? (
          <WebglErrorBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <Canvas
                className="writing-infinite-canvas-preview__canvas"
                aria-label="Miniature streamed chunk grid: pan to load neighboring chunks with stable pseudo-random colors per slot"
                role="img"
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
                frameloop="always"
                onCreated={() => {
                  queueMicrotask(() => setWebglFailed(false))
                }}
              >
                <Scene />
              </Canvas>
            </Suspense>
          </WebglErrorBoundary>
        ) : null}
      </div>
    </figure>
  )
}
