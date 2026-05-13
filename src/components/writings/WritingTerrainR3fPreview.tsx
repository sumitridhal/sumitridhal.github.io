import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useId, useMemo, useRef, useState, type ElementRef } from 'react'
import * as THREE from 'three'

import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const TERRAIN_VERT = /* glsl */ `
uniform float uAmp;
uniform float uFreq;
uniform float uWarp;
uniform float uTime;
varying float vH;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 xz = position.xy;
  float t = uTime * 0.08;
  vec2 w = uWarp * vec2(fbm(xz * uFreq * 0.35 + vec2(1.7, 0.3) + t), fbm(xz * uFreq * 0.35 - vec2(2.2, 4.1) - t));
  float h = fbm(xz * uFreq + w);
  vH = h;
  vec3 pos = vec3(xz, h * uAmp);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const TERRAIN_FRAG = /* glsl */ `
varying float vH;
void main() {
  vec3 lo = vec3(0.05, 0.07, 0.11);
  vec3 hi = vec3(0.42, 0.62, 0.38);
  vec3 c = mix(lo, hi, clamp(vH, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}
`

function TerrainMesh({
  amp,
  freq,
  warp,
  animate,
}: {
  amp: number
  freq: number
  warp: number
  animate: boolean
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const clock = useThree((s) => s.clock)

  useFrame(() => {
    const m = mat.current
    if (!m) return
    m.uniforms.uAmp.value = amp
    m.uniforms.uFreq.value = freq
    m.uniforms.uWarp.value = warp
    m.uniforms.uTime.value = animate ? clock.getElapsedTime() : 0
  })

  // Uniform objects must stay referentially stable; values are synced in useFrame.
  const uniforms = useMemo(
    () => ({
      uAmp: { value: amp },
      uFreq: { value: freq },
      uWarp: { value: warp },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Three uniform map identity is stable
    [],
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.2, 2.2, 160, 160]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={TERRAIN_VERT}
        fragmentShader={TERRAIN_FRAG}
        wireframe={false}
      />
    </mesh>
  )
}

function TerrainScene({
  amp,
  freq,
  warp,
  animate,
}: {
  amp: number
  freq: number
  warp: number
  animate: boolean
}) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(1.85, 1.15, 1.85)
    const c = controlsRef.current
    if (c?.target) {
      c.target.set(0, 0, 0)
      c.update?.()
    }
  }, [camera])

  return (
    <>
      <color attach="background" args={['#050608']} />
      <ambientLight intensity={0.2} />
      <TerrainMesh amp={amp} freq={freq} warp={warp} animate={animate} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        minDistance={1.1}
        maxDistance={5.5}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

function RangeRow({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
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
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{value.toFixed(2)}</span>
    </div>
  )
}

export type WritingTerrainR3fPreviewProps = {
  caption?: string
  height?: number
  className?: string
}

export function WritingTerrainR3fPreview({
  caption = 'Drag to orbit: heightfield from layered value noise with optional domain warp',
  height = 300,
  className = '',
}: WritingTerrainR3fPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [amp, setAmp] = useState(0.42)
  const [freq, setFreq] = useState(2.2)
  const [warp, setWarp] = useState(0.35)
  const [webglFailed, setWebglFailed] = useState(false)

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not be initialized in this browser (Three.js / react-three-fiber).
    </p>
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-generative-play-preview__caption">{caption}</figcaption> : null}
      <div className="writing-generative-play-preview__hud">
        <RangeRow
          id={`${uid}-amp`}
          label="Amplitude"
          min={0.08}
          max={0.75}
          step={0.01}
          value={amp}
          onChange={setAmp}
        />
        <RangeRow
          id={`${uid}-freq`}
          label="Frequency"
          min={0.6}
          max={5.5}
          step={0.05}
          value={freq}
          onChange={setFreq}
        />
        <RangeRow
          id={`${uid}-warp`}
          label="Domain warp"
          min={0}
          max={1.2}
          step={0.02}
          value={warp}
          onChange={setWarp}
        />
      </div>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        {webglFailed ? fallback : null}
        {!webglFailed ? (
          <WritingPlayWebglBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <Canvas
                className="writing-generative-play-preview__canvas"
                aria-label="Interactive terrain heightfield: orbit with the mouse, adjust noise parameters with sliders"
                role="img"
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                frameloop="always"
                camera={{ fov: 45, near: 0.06, far: 40 }}
                onCreated={() => {
                  queueMicrotask(() => setWebglFailed(false))
                }}
              >
                <TerrainScene amp={amp} freq={freq} warp={warp} animate={!reduced} />
              </Canvas>
            </Suspense>
          </WritingPlayWebglBoundary>
        ) : null}
      </div>
    </figure>
  )
}
